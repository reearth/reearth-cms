---
name: interactor-pattern
description: The transaction, permission-check, and event-publishing pattern for use case interactors in the reearth-cms server (internal/usecase/interactor/). Use when writing or editing an interactor method (Create/Update/Delete/etc.), wiring permission checks, wrapping logic in a transaction, or choosing between Run0/Run1/Run2/Run3. Explains Usecase().WithWritableWorkspaces().Transaction() and operator-based checks.
---

# Interactor pattern — reearth-cms server

Every interactor method that mutates state wraps its body in a `Run` helper. The helper checks permissions, opens a transaction (commit on success, rollback on error), and retries on transient failure.

## The shape

```go
func (i Group) Create(ctx context.Context, param interfaces.CreateGroupParam, operator *usecase.Operator) (*group.Group, error) {
    return Run1(ctx, operator, i.repos, Usecase().Transaction(),
        func(ctx context.Context) (*group.Group, error) {
            // 1. permission
            if !operator.IsMaintainingProject(param.ProjectId) {
                return nil, interfaces.ErrOperationDenied
            }
            // 2. fetch dependencies (use the tx ctx!)
            p, err := i.repos.Project.FindByID(ctx, param.ProjectId)
            if err != nil { return nil, err }
            // 3. domain build (validation lives in the builder)
            g, err := group.New().NewID().Schema(s.ID()).Project(p.ID()).Name(param.Name).Build()
            if err != nil { return nil, err }
            // 4. persist within the transaction
            if err := i.repos.Group.Save(ctx, g); err != nil { return nil, err }
            return g, nil
        })
}
```

Reference: `internal/usecase/interactor/group.go`. The helpers live in `internal/usecase/interactor/usecase.go`.

## Choosing Run0/1/2/3

Pick by number of non-error return values: `Run0` (error only), `Run1` (one value), `Run2`, `Run3`. They're generic and type-safe; `Run0/1/2` just delegate to `Run3`.

## Permission checks — two equivalent styles

**Builder style** — declarative, checked before the tx opens:
```go
Run1(ctx, operator, i.repos,
    Usecase().WithWritableWorkspaces(workspaceID).Transaction(),
    func(ctx context.Context) (*project.Project, error) { ... })
```
Builders: `WithReadableWorkspaces`, `WithWritableWorkspaces`, `WithMaintainableWorkspaces`, `WithOwnableWorkspaces`. Chain with `.Transaction()`.

**Operator style** — imperative, inside the func, for project-level or conditional checks:
```go
if !operator.IsMaintainingProject(param.ProjectId) {
    return nil, interfaces.ErrOperationDenied
}
```

Use the builder when the gate is a workspace role known up front; use operator checks for project-scoped or data-dependent gates. Always return `interfaces.ErrOperationDenied` on failure.

## Transactions

- `Usecase().Transaction()` enables the tx; omit it for read-only methods (most `FindBy*` don't wrap at all).
- Everything inside the func uses the **transaction-scoped `ctx`** — all `i.repos.*.Save/Find` calls within one func commit or roll back atomically.
- Auto-retry: `transactionRetry = 2` on transient failures. Keep the func **idempotent** — it may run more than once. No side effects (HTTP calls, emails) before commit.
- A returned error rolls back. Don't manually commit.

## Events & gateways

Publish domain events / call gateways **after** the domain change is saved, inside the func, via `i.gateways.*` or the event repo. Reference how `internal/usecase/interactor/item.go` publishes `event.*`.

## Don'ts

- ❌ No business validation in the interactor — it belongs in the domain `Build()`.
- ❌ No direct mongo/echo/gql imports — only `i.repos` / `i.gateways` interfaces.
- ❌ Don't ignore the tx `ctx`; never use a background ctx inside the func.
