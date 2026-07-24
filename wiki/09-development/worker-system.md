# Worker System

Re:Earth CMS offloads CPU-intensive and long-running tasks to a separate **worker** process. This prevents the main API server from timing out or becoming unresponsive during heavy operations.

## Overview

The worker system consists of:
- **Main server** — dispatches tasks by publishing to a message queue
- **Worker** — subscribes to the queue and executes tasks
- **Notification endpoint** — the worker calls back to the main server on task completion

```
Main Server
    │
    │ (publishes task)
    ▼
Cloud Pub/Sub / SNS / Local Queue
    │
    │ (subscribes)
    ▼
Worker Process
    │
    │ (completes, notifies)
    ▼
Main Server: POST /api/notify
```

---

## Task Types

Five task types are handled by the worker:

| Task | Description |
|---|---|
| **DecompressAsset** | Decompress a ZIP archive asset into individual files |
| **CompressAsset** | (Re-)compress files into a ZIP archive |
| **Webhook** | Deliver an HTTP webhook notification to an external URL |
| **Copy** | Copy items or assets between projects or environments |
| **Import** | Bulk import items from a file (JSON, CSV, GeoJSON) |

---

## Task Dispatch Flow

1. The API server interactor calls `taskRunner.Run(task)`.
2. On GCP: task is published to Cloud Pub/Sub topic.
3. On AWS: task is published to SNS topic.
4. On local/development: task runs synchronously or in a goroutine.
5. The worker picks up the message and executes the task.
6. On completion, the worker calls `POST /api/notify` with the job result.
7. The main server updates the job status and triggers any dependent actions (e.g. events).

---

## Worker Executors

### GCP Deployment

| Task Type | Executor |
|---|---|
| DecompressAsset (large) | Cloud Build (high-CPU VM) |
| Webhook | Cloud Run worker via Pub/Sub |
| Import | Cloud Build |
| Copy | Cloud Run worker |

Cloud Build is used for heavy tasks because it supports:
- High-CPU machines (e.g. `E2_HIGHCPU_8` = 8 vCPUs)
- Up to 2 TB disk space
- Long-running jobs without timeout

### AWS Deployment

| Task Type | Executor |
|---|---|
| Webhook | Lambda / ECS via SNS |
| Others | ECS task |

---

## Asset Decompression Worker

The decompressor is the most compute-intensive worker. It runs with high parallelism to process ZIP archives efficiently.

### Progress Tracking

Decompression progress is saved to GCS object metadata:
- Progress percentage (0–100)
- Number of files processed
- Current file being processed

This enables the UI to show accurate progress and supports **resumable decompression** — if the Cloud Build job is interrupted, it can pick up where it left off.

---

## Import Worker

The import worker handles bulk item imports:

| Limit | Value |
|---|---|
| Maximum records | 50,000 |
| Maximum file size | 100 MB |
| Batch chunk size | 1,000 items |

### Streaming Processing

The import worker uses a **streaming JSON decoder** (`encoding/json.Decoder`) to process large files without loading the entire file into memory. Each batch of 1,000 items is written to the database before reading the next batch.

---

## Copy Worker

The copy worker copies items or assets between projects. It supports three transformation modes:

| Mode | Description |
|---|---|
| **ChangeTypeSet** | Copy items with a specific status set |
| **ChangeTypeNew** | Copy items as new (reset versioning) |
| **ChangeTypeULID** | Copy with new ULID-based IDs |

---

## Worker Authentication (M2M)

The worker communicates back to the main server using **Machine-to-Machine (M2M) authentication**:

```
Worker → POST /api/notify
         Authorization: Bearer <m2m-jwt>
```

The M2M JWT is issued by the configured M2M auth provider and validated by the server's auth middleware. This ensures only the legitimate worker can update job status.

---

## Worker Configuration

The worker uses the same environment variables as the main server, plus:

```bash
# The worker subscribes to this queue
REEARTH_CMS_TASK_TOPIC=cms-tasks

# For GCP Cloud Build tasks
REEARTH_CMS_TASK_GCPPROJECT=my-project
REEARTH_CMS_TASK_GCPREGION=asia-northeast1
REEARTH_CMS_TASK_BUILDSERVICEACCOUNT=worker@my-project.iam.gserviceaccount.com
```

---

## Job Tracking

Every async task creates a **job** in the database:

```graphql
type Job {
    id: ID!
    status: JobStatus!  # RUNNING | COMPLETED | FAILED
    debug: String       # Error details on failure
}

enum JobStatus { RUNNING COMPLETED FAILED }
```

Jobs can be queried via the GraphQL API:

```graphql
query {
    job(id: "job-id") {
        status
        debug
    }
}
```

The UI polls job status to show progress indicators for import and decompression operations.

---

## Running the Worker Locally

For development, the worker can run locally:

```bash
cd worker
cp .env.example .env
# Edit .env

go run ./cmd/reearth-cms-worker
```

Or with Docker:

```bash
docker run --env-file .env reearth/reearth-cms-worker:nightly
```
