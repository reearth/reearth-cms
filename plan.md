# Implementation Plan: CMS-Side Project Visibility Enforcement

## Background

Currently, CMS does not enforce `project.Visibility` on operator-facing APIs (GraphQL, Integration REST).
Any authenticated workspace member can see all projects regardless of visibility setting.

Protection exists today only for:
- **Public API** (unauthenticated) — enforced via `accessibilityCheck()`
- **Internal gRPC API** — explicit check on `GetProject()` and `public_only` flag on `ListProjects()`
- **Cross-workspace `Search()`** — forces `public` when no workspace IDs are supplied

---

## Core Rule

> `private` projects are only visible to operators with an explicit role on that project.
> `public` projects are visible to any authenticated workspace member.

---

## Affected Code Paths

| API | Entry Point | Interactor Method | Gap |
|---|---|---|---|
| GraphQL | `resolver_project.go` `Projects()` | `FindByWorkspace` | No visibility filter |
| Integration REST | `integration/project.go` `ProjectFilter()` | `FindByWorkspace` | No visibility filter |
| Integration REST | `integration/project.go` `ProjectGet()` | `FindByIDOrAlias` | No visibility check |
| GraphQL | `loader_project.go` `FindByWorkspace()` | `FindByWorkspace` | No visibility filter |
| gRPC internal | `internalapi/server.go` `ListProjects()` | `Search()` | ✅ handled |
| gRPC internal | `internalapi/server.go` `GetProject()` | direct repo | ✅ handled |

---

## Implementation Steps

### Step 1 — Extend `ProjectFilter` with `AccessibleProjectIds`

**File:** `server/internal/usecase/interfaces/project.go`

Add an `AccessibleProjectIds` field to `ProjectFilter`. This allows the repo query to return public projects in the workspace **OR** private projects the operator explicitly has access to.

---

### Step 2 — Update MongoDB `Search()` to use `AccessibleProjectIds`

**File:** `server/internal/infrastructure/mongo/project.go`

When both `Visibility` and `AccessibleProjectIds` are set, build a `$or` query: match `visibility=public` or `id IN accessibleProjectIds`. Fall back to the existing single-condition filter otherwise.

---

### Step 3 — Apply visibility rules in interactors

**File:** `server/internal/usecase/interactor/project.go`

Add a shared `applyVisibilityFilter` helper with the following logic:
- `nil` operator → public only
- Machine operator → no restriction
- Authenticated operator → public projects + projects from `op.AllReadableProjects()`

Apply this helper inside `FindByWorkspace`, `FindByWorkspaces`, and `Search`.

---

### Step 4 — Enforce visibility on single-project fetches

**File:** `server/internal/usecase/interactor/project.go`

After fetching in `FindByIDOrAlias` and `Fetch`, return `ErrNotFound` if the project is private and the operator has no explicit access to it.

---

### Step 5 — Review operator construction for private project access

**File:** `server/internal/app/auth_client.go`

The `operatorProjects()` function assigns all workspace projects to the operator's role lists regardless of visibility. A decision is needed before proceeding:

- **Option A** *(restrictive)*: Only maintainers/owners automatically see private projects; readers/writers require an explicit project-level role.
- **Option B** *(permissive)*: All workspace members see all projects — visibility has no effect for authenticated users (current behavior).

**This decision gates Steps 3 and 4.**

---

### Step 6 — Add tests

**Unit tests** (`server/internal/usecase/interactor/project_test.go`):
- `FindByWorkspace` with nil operator → public projects only
- `FindByWorkspace` with machine operator → all projects
- `FindByWorkspace` with operator who has access to a private project → included
- `FindByWorkspace` with operator who does not have access to a private project → excluded
- `FindByIDOrAlias` on a private project with no operator → `ErrNotFound`
- `FindByIDOrAlias` on a private project with a readable operator → returned

**E2E tests** (`server/e2e/`):
- GraphQL `projects` as workspace `Reader` without explicit project access → private projects hidden
- GraphQL `projects` as workspace `Owner` → all projects including private returned

---

## Rollout Considerations

This is a breaking behavior change. Coordinate with the Dashboard team to ensure:

1. The UI handles a reduced project list gracefully for lower-privileged users.
2. The Dashboard's temporary `public_only=true` fix continues to work during the transition.
3. A migration plan exists for existing private projects that may need retroactive access grants.
