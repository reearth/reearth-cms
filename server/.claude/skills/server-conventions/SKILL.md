---
name: server-conventions
description: Core conventions and MUST-follow rules for the reearth-cms Go server (server/). Use whenever writing, editing, or reviewing Go code under server/ — covers clean-architecture layer boundaries, import paths, domain builders, error handling, IDs, and the verification commands. Read this before touching pkg/, internal/usecase/, internal/adapter/, or internal/infrastructure/.
---

# reearth-cms server conventions

Authoritative rules for code under `server/`. These OVERRIDE general Go habits. See `server/CLAUDE.md` for the full architecture narrative; this file is the enforceable checklist.

## Layer boundaries (dependency rule)

Dependencies point **inward** only:

```
internal/adapter  →  internal/usecase  →  pkg
internal/infrastructure  →  internal/usecase  →  pkg
```

- ❌ NEVER import `internal/` from `pkg/`. The domain layer is framework-free.
- ❌ NEVER import `internal/adapter/*` from `internal/usecase/*`.
- ❌ NEVER import a concrete infra type (`internal/infrastructure/mongo`) from an interactor. Depend on the interface in `internal/usecase/repo` or `internal/usecase/gateway`.
- ❌ NEVER import a DB/transport library (`go.mongodb.org/...`, `echo`, `gqlgen`) inside `pkg/`.

## Imports

Always full module paths from the root — no relative imports:

```go
import "github.com/reearth/reearth-cms/server/pkg/item"
```

Shared helpers come from `reearthx`: `rerror`, `usecasex`, `util`, `accountdomain`. Prefer these over hand-rolling. `github.com/samber/lo` is the standard functional helper.

## Domain layer (`pkg/`)

- Construct entities with the **builder + `NewID()`** pattern, never struct literals:
  ```go
  g, err := group.New().NewID().Schema(s.ID()).Key(id.NewKey(key)).Project(pid).Name(name).Build()
  ```
- Validation lives in the domain (`Build()` / `New()`), not in interactors.
- Use type-safe IDs from `pkg/id` (`id.GroupID`, `id.NewKey`, etc.) — never raw strings.
- Domain errors are sentinel/typed values (e.g. `id.ErrDuplicatedKey`, `rerror.ErrNotFound`). Compare with `errors.Is`.

## Use case layer (`internal/usecase/`)

- Every mutating use case runs through `Run1`/`Run2`/`Run3` with `Usecase().Transaction()` — see the `interactor-pattern` skill.
- Check permissions inside the run func, either via the `Usecase().WithWritableWorkspaces(...)` builder or `operator.IsMaintainingProject(...)`, returning `interfaces.ErrOperationDenied`.
- Repository/gateway access is via the interface containers `i.repos.*` / `i.gateways.*`.

## Error handling

- Wrap with `fmt.Errorf("...: %w", err)` to preserve the chain.
- Use `rerror.ErrNotFound` for not-found; check with `errors.Is(err, rerror.ErrNotFound)`.
- Return `interfaces.ErrOperationDenied` for permission failures.
- Don't swallow errors; don't `log.Fatal` outside `cmd/`.

## Testing (see `write-go-tests`)

- Table-driven, `t.Parallel()` on both the parent and each subtest, capture `tt := tt`.
- Interactor tests use `internal/infrastructure/memory` repos.
- e2e tests need `REEARTH_CMS_DB` set or they skip (`testing.Short()`).

## After any change — verify

```bash
make check   # builds all packages + checks test compilation (fast)
make test    # go test -race -v ./...   (full)
make lint    # golangci-lint run --fix
```

If you changed GraphQL schema, proto, or interfaces with `//go:generate`, regenerate (see `codegen`) before building.
