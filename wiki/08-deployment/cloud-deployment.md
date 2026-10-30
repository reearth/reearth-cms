# Cloud Deployment (GCP)

Re:Earth CMS is designed for production deployment on Google Cloud Platform (GCP) using Cloud Run for serverless container hosting.

## Architecture on GCP

```
Internet
    │
    ▼
Cloud Load Balancer (HTTPS)
    │
    ├──► Cloud Run: cms-web        (Nginx + React SPA)
    │
    └──► Cloud Run: cms-api        (Go backend)
              │
              ├──► Cloud Run: cms-internal-api  (gRPC, internal only)
              │
              ├──► MongoDB (Atlas or self-hosted on GCE)
              │
              ├──► Cloud Storage (assets)
              │
              └──► Cloud Pub/Sub ──► Cloud Run: cms-worker
                                           │
                                           └──► Cloud Build (heavy tasks)
```

## Cloud Run Services

| Service | Image | Description |
|---|---|---|
| `cms-api` | `reearth/reearth-cms` | Main backend API (GraphQL + REST) |
| `cms-internal-api` | `reearth/reearth-cms` | Internal gRPC API (not public-facing) |
| `cms-web` | `reearth/reearth-cms-web` | Web frontend served via Nginx |
| `cms-worker` | `reearth/reearth-cms-worker` | Async task worker |

All services are stateless and horizontally scalable.

---

## Deployment Prerequisites

1. GCP project with billing enabled
2. Enabled APIs: Cloud Run, Cloud Build, Cloud Pub/Sub, Cloud Storage, Secret Manager
3. Container images pushed to Artifact Registry or GCR
4. MongoDB instance (MongoDB Atlas recommended for production)
5. Service accounts with appropriate IAM roles

---

## IAM / Authentication

### Keyless Authentication (Workload Identity Federation)

Re:Earth CMS uses **Workload Identity Federation** / **OIDC** for keyless authentication between services and GCP:
- No long-lived service account keys stored in the code or environment
- Cloud Run services authenticate to GCP APIs using their service account identity
- CI/CD (GitHub Actions) authenticates to GCP using OIDC tokens

### Service Account Roles

| Service | Required Roles |
|---|---|
| `cms-api` | `storage.objectAdmin`, `pubsub.publisher`, `secretmanager.secretAccessor` |
| `cms-worker` | `storage.objectAdmin`, `cloudbuild.builds.editor`, `pubsub.subscriber` |
| CI/CD | `run.developer`, `artifactregistry.writer` |

---

## Secrets Management

All sensitive configuration (database credentials, auth secrets, API keys) is stored in **GCP Secret Manager** and injected at runtime:

```bash
# In Cloud Run service configuration, mount secrets as environment variables:
REEARTH_CMS_DB: projects/my-project/secrets/cms-db-uri/versions/latest
REEARTH_CMS_DOMAIN: projects/my-project/secrets/auth0-domain/versions/latest
```

The worker can reference the DB secret by name via:
```bash
REEARTH_CMS_TASK_DBSECRETNAME=cms-db-uri
```

---

## Asynchronous Tasks

### Webhook Delivery

1. CMS creates a webhook event
2. Event is published to Cloud Pub/Sub topic (`REEARTH_CMS_TASK_TOPIC`)
3. Worker subscriber picks up the message and delivers the HTTP POST to the configured webhook URL

### Asset Decompression

Large ZIP archive decompression runs on **Cloud Build** for maximum compute:
- Machine type: configurable (e.g. `E2_HIGHCPU_8`, 8 vCPUs)
- Disk: up to 2 TB
- Progress is tracked in GCS object metadata for resumability
- Configuration:
  ```bash
  REEARTH_CMS_TASK_DECOMPRESSORIMAGE=gcr.io/my-project/cms-decompressor
  REEARTH_CMS_TASK_DECOMPRESSORTOPIC=cms-decompressor-topic
  REEARTH_CMS_TASK_DECOMPRESSORMACHINETYPE=E2_HIGHCPU_8
  REEARTH_CMS_TASK_BUILDSERVICEACCOUNT=worker@my-project.iam.gserviceaccount.com
  ```

### Bulk Import

Large item imports (up to 50,000 rows) run as Cloud Build jobs to avoid Cloud Run timeout limits.

---

## Logging

- API and web services: Cloud Run automatically captures stdout/stderr to Cloud Logging
- Worker task logs: only the worker service sends logs to Cloud Logging (configured via `REEARTH_CMS_TASK_GCSHOST`)

---

## Cloud Run Deployment Example

```bash
gcloud run deploy cms-api \
  --image gcr.io/my-project/reearth-cms:v1.0.0 \
  --region asia-northeast1 \
  --platform managed \
  --service-account cms-api@my-project.iam.gserviceaccount.com \
  --set-env-vars REEARTH_CMS_DB=mongodb+srv://... \
  --set-secrets REEARTH_CMS_DOMAIN=auth0-domain:latest \
  --min-instances 1 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1
```

---

## PR Preview Environments

The CI/CD pipeline automatically creates preview environments for pull requests. Images are tagged as `pr-{number}` and deployed to a separate Cloud Run service for testing.

See [CI/CD](./ci-cd.md) for details.

---

## AWS Deployment

Re:Earth CMS also supports AWS deployment. Key differences:
- File storage: S3 instead of GCS
- Task dispatch: SNS instead of Cloud Pub/Sub
  ```bash
  REEARTH_CMS_AWSTASK_TOPICARN=arn:aws:sns:ap-northeast-1:123456789:cms-tasks
  REEARTH_CMS_AWSTASK_WEBHOOKARN=arn:aws:sns:ap-northeast-1:123456789:cms-webhooks
  ```
- Container hosting: ECS / Fargate instead of Cloud Run
- Secrets: AWS Secrets Manager instead of GCP Secret Manager

The `deploy_aws.yml` GitHub Actions workflow provides the AWS deployment pipeline.
