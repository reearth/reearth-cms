---
name: add-feature
description: Step-by-step workflow for adding a new feature or entity to the reearth-cms server end to end across clean-architecture layers. Use when asked to add a new domain model, repository, use case, GraphQL or public API endpoint, or to wire a new capability through the server (server/). Covers the canonical domain → repo interface → interactor → mongo+memory → GraphQL schema → resolver → codegen order.
---

# Adding a feature to the reearth-cms server

Build features **inside-out** so the dependency rule is never violated. Follow this order; each step has a real reference file to copy from.

## 1. Domain model — `pkg/<feature>/`

Create the entity with a builder. Reference: `pkg/group/`.

```go
// pkg/myfeature/myfeature.go
type MyFeature struct { id ID; name string }
// pkg/myfeature/builder.go — New().NewID().Name(..).Build() with validation
```

Add `pkg/myfeature/id.go` re-exporting the typed ID from `pkg/id` if needed. Write domain unit tests here (`write-go-tests`).

## 2. Repository interface — `internal/usecase/repo/myfeature.go`

```go
type MyFeature interface {
    FindByID(context.Context, id.MyFeatureID) (*myfeature.MyFeature, error)
    Save(context.Context, *myfeature.MyFeature) error
}
```

Register it in the repo container: `internal/usecase/repo/container.go`.

## 3. Interactor — `internal/usecase/interactor/myfeature.go`

Use the transaction + permission pattern. See the `interactor-pattern` skill and `internal/usecase/interactor/group.go` for a complete `Create`/`Update`/`Delete` example. Define params in `internal/usecase/interfaces/myfeature.go` and wire the interactor in `internal/usecase/interactor/common.go`.

## 4. Implementations — mongo AND memory

You must implement **both**, or interactor tests won't compile:

- `internal/infrastructure/mongo/myfeature.go` — real persistence. Reference an existing repo + its `*_document` mapping.
- `internal/infrastructure/memory/myfeature.go` — in-memory, used by tests. Reference `internal/infrastructure/memory/group.go` (note the `data *util.SyncMap`, `now`, injectable `err` for failure tests, and `Filtered`).

Wire both into their container constructors.

## 5. GraphQL schema — `schemas/myfeature.graphql`

Define the type, inputs, payload, and `extend type Query/Mutation`. Reference an existing `schemas/*.graphql`.

## 6. Resolver + conversions — `internal/adapter/gql/`

- `resolver_myfeature.go` — thin: convert input → call `r.usecases.MyFeature.X(...)` → convert domain → gqlmodel.
- `gqlmodel/convert_myfeature.go` — `ToMyFeature(...)` and `ToXInput(...)`.

Get the operator with `getOperator(ctx)`. Keep all logic in the interactor.

## 7. Generate code

```bash
make gql     # if you touched schemas/ or gqlgen
make oapi    # if you touched the public/integration OpenAPI specs
go generate ./...   # regenerates mocks for new repo interfaces too
```

(For a public REST endpoint instead of GraphQL, edit the OpenAPI spec and run `make oapi`; resolver work moves to `internal/adapter/publicapi` or `internal/adapter/integration`.)

## 8. Verify

```bash
make check && make test
```

Add e2e coverage in `e2e/gql_myfeature_test.go` (needs `REEARTH_CMS_DB`).

## Checklist

- [ ] Domain builder + validation + unit tests
- [ ] repo interface + container entry
- [ ] interfaces param structs
- [ ] interactor (transaction + permission) + common.go wiring
- [ ] mongo impl + memory impl (both!)
- [ ] GraphQL schema + resolver + convert
- [ ] codegen ran, `make check && make test` green
- [ ] e2e test
