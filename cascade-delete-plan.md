# Cascade Delete Implementation Plan

## The Problem

Deleting a workspace, project, or model currently only deletes that one document in MongoDB.
All the data underneath it — items, schemas, threads, views, assets, etc. — stays in the
database as orphaned records that can never be reached again.

This plan fixes that by making every delete operation clean up everything beneath it.

---

## Data Hierarchy

Understanding what belongs to what is the foundation of the whole plan.

```
Workspace
  ├── WorkspaceSettings
  └── Projects
        ├── Models
        │     ├── Schema
        │     ├── Metadata Schema
        │     ├── Views
        │     └── Items
        │           ├── Metadata Items
        │           └── Thread
        ├── Groups
        │     └── Schema
        ├── Assets
        │     ├── File  (stored in cloud: GCS/S3)
        │     └── Thread
        ├── Requests
        │     └── Thread
        └── Events
```

> **Note on Events:** Events are scoped to a project, not to individual models or items. This means they can only be bulk-deleted at the project level using `projectID`. When a single model is deleted, its events cannot be isolated from the rest of the project's events — so event deletion only happens when the whole project is deleted.

> **Note on Integrations:** Integrations are global entities owned by a developer user — they
> are not owned by a workspace or project. When a workspace is deleted, the membership link
> disappears with it. The integration document itself is not deleted (it may be used by other
> workspaces). No extra cleanup needed.

---

## Approach

Not all deletes are equal in size.

- **Model delete** is small enough to run synchronously in a single transaction.
- **Project and Workspace delete** can involve thousands of items. Running them synchronously
  would cause request timeouts and risk partial failures. These run as **async background jobs**.

### Async Job Pattern (for Project and Workspace)

1. Mark the resource as `deleting` — it immediately disappears from the UI.
2. Return success to the caller right away.
3. A background worker does the actual cleanup in safe, restartable batches.
4. If the worker fails halfway, it can resume without re-deleting already-cleaned data.

The `job` infrastructure already exists in this codebase — we just need a new deletion worker.

---

## What Gets Deleted and When

| Trigger | What to delete |
|---|---|
| Delete Model | Views, Items (+ metadata items), Threads on those items, Schema, Metadata Schema |
| Delete Project | All of the above (per model), plus Assets + files, Requests, Groups + schemas, Threads on assets/requests, Events |
| Delete Workspace | All of the above (per project), plus remaining workspace-level threads, WorkspaceSettings |
| Delete Item | Its Thread (if it has one) |
| Delete Asset | Its Thread (if it has one), its file in cloud storage |

---

## Implementation Steps

### Step 1 — Add Bulk Delete Methods to Repositories

**Why:** Right now, repositories only support deleting one document at a time. To delete
everything under a project or model efficiently, we need bulk `deleteMany` operations.

**What to add:**

| Repository | New Method |
|---|---|
| `repo/model.go` | `RemoveByProject(projectID)` |
| `repo/schema.go` | `RemoveByProject(projectID)` |
| `repo/view.go` | `RemoveByModel(modelID)`, `RemoveByProject(projectID)` |
| `repo/group.go` | `RemoveByProject(projectID)` |
| `repo/request.go` | `RemoveByProject(projectID)` |
| `repo/thread.go` | `Remove(threadID)`, `RemoveByWorkspace(workspaceID)` |
| `repo/event.go` | `RemoveByProject(projectID)` |
| `repo/item.go` | `RemoveByProject(projectID)` — for paginated deletion |

Each method maps to a single `deleteMany` query in the MongoDB implementation.
These are small, straightforward additions — one method per file.

---

### Step 2 — Fix Model Delete

**File:** `internal/usecase/interactor/model.go`

Expand the existing `Delete` method to run these steps inside the existing transaction:

1. **Delete Views** — views are display configurations tied to a model (filters, column layout, sorting). Bulk delete all of them by `modelID`.
2. **Delete Items by modelID in pages** — use `FindByModel` to fetch a page of items, then pass their IDs to the existing `BatchDelete` interactor method. Repeat until no items remain. Do not bypass `BatchDelete` with a raw `deleteMany` — it handles cross-item reference field cleanup and metadata items correctly.
3. **Delete Threads** — collect thread IDs from each page of deleted items and delete them.
4. **Delete Schema** — the schema defines the fields of the model. Delete the main schema document.
5. **Delete Metadata Schema** — if the model has one, delete it too.
6. **Delete the Model** — existing logic (also reorders sibling models)

---

### Step 4 — Fix Project Delete *(async job)*

**Files:** `internal/usecase/interactor/project.go`, new `internal/usecase/interactor/deletion_job.go`

**In `project.go`**, replace the current shallow delete with:
1. Mark the project as `deleting`
2. Enqueue a `DeletionJob { scope: "project", projectID, workspaceID }`
3. Return success immediately

**In `deletion_job.go`**, the worker processes the job in this order:

1. **Models** — for each model, run the Step 2 delete logic
2. **Assets** — each asset stores a reference to a file in cloud storage (GCS/S3). Delete
   the file from storage first, then delete the asset document. Also delete its thread if it has one.
3. **Requests** — requests are review/approval workflows attached to a project. Bulk delete
   all request documents by `projectID`. Also delete their threads.
4. **Groups and Group Schemas** — groups are reusable field sets within a project. Each group
   has its own schema document. Bulk delete both by `projectID`.
5. **Threads** — bulk delete all remaining threads by collecting remaining resource IDs
6. **Events** — bulk delete all events by `projectID` using `RemoveByProject`
7. **Project document** — delete it
8. **Mark job as complete**

> **Important:** The worker should process items in pages (e.g. 100 at a time) and track
> progress so it can safely resume if interrupted.

---

### Step 5 — Fix Workspace Delete *(async job)*

**File:** `internal/usecase/interactor/workspace.go` (or wherever workspace deletion is triggered)

Same pattern as Step 4:
1. Mark the workspace as `deleting`
2. Enqueue a `DeletionJob { scope: "workspace", workspaceID }`
3. Return success immediately

**Worker runs:**
1. **Projects** — for each project, run the Step 3 delete logic
2. **Remaining Threads** — bulk delete by `workspaceID` (catches any threads not cleaned up above)
3. **WorkspaceSettings** — delete by `workspaceID`
4. **Workspace document** — delete it
5. **Mark job as complete**

---

### Step 6 — Fix Thread Cleanup on Individual Item and Asset Deletes

This is a small but important fix independent of the job system. Today, when a single item
or asset is deleted, its thread is left behind as an orphan.

**`internal/usecase/interactor/item.go`** — after `BatchDelete` removes items, collect the
thread IDs from those items and delete them.

**`internal/usecase/interactor/asset.go`** — after removing the asset, if the asset has a
`threadID`, delete that thread.

**Request delete** — same pattern once request deletion is implemented.

---

## Order of Work

Step 1 is the foundation — everything else depends on it.
Steps 2 and 5 can be built and shipped independently once Step 1 is ready.
Steps 3 and 4 depend on the model delete (Step 2) being solid first.

```
Step 1  Add bulk delete methods to repositories
   │
   ├── Step 2  Fix model delete          (ship independently)
   ├── Step 5  Fix item/asset threads    (ship independently)
   │
   └── Step 3  Fix project delete
         │
         └── Step 4  Fix workspace delete
```

---

## Files Changed Summary

| File | Change |
|---|---|
| `repo/model.go` | Add `RemoveByProject` |
| `repo/schema.go` | Add `RemoveByProject` |
| `repo/view.go` | Add `RemoveByModel`, `RemoveByProject` |
| `repo/group.go` | Add `RemoveByProject` |
| `repo/request.go` | Add `RemoveByProject` |
| `repo/thread.go` | Add `Remove`, `RemoveByWorkspace` |
| `repo/item.go` | Add `FindByProject` |
| `mongo/model.go` | Implement `RemoveByProject` |
| `mongo/schema.go` | Implement `RemoveByProject` |
| `mongo/view.go` | Implement `RemoveByModel`, `RemoveByProject` |
| `mongo/group.go` | Implement `RemoveByProject` |
| `mongo/request.go` | Implement `RemoveByProject` |
| `mongo/thread.go` | Implement `Remove`, `RemoveByWorkspace` |
| `mongo/event.go` | Add `project` index; implement `RemoveByProject` |
| `mongodoc/event.go` | Add `Project` field to document; persist it in `NewEvent` |
| `mongo/item.go` | Implement `FindByProject` |
| `interactor/model.go` | Expand `Delete` with cascade logic |
| `interactor/project.go` | Replace delete with job enqueue |
| `interactor/item.go` | Delete thread after item delete |
| `interactor/asset.go` | Delete thread after asset delete |
| `interactor/deletion_job.go` | New file — async deletion worker |
