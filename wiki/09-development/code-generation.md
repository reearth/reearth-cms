# Code Generation

Re:Earth CMS relies on code generation to maintain type safety across the GraphQL and REST APIs without manual boilerplate.

## Overview

| Generator | Input | Output | Tool |
|---|---|---|---|
| GraphQL (server) | `schemas/gql/*.graphql` | `internal/adapter/gql/generated.go`, `gqlmodel/models_gen.go` | `gqlgen` |
| OpenAPI (server) | `schemas/integration/integration.yml` | `internal/adapter/publicapi/` | `oapi-codegen` |
| Mocks (server) | Interface definitions | `*_mock.go` files | `mockgen` |
| GraphQL (frontend) | `schemas/gql/*.graphql` + `web/src/gql/**/*.graphql` | `web/src/gql/__generated__/` | `graphql-codegen` |

---

## Running All Generators

### Backend

```bash
cd server
go generate ./...
```

This runs all three generators (gqlgen, oapi-codegen, mockgen) based on `//go:generate` directives in the source files.

Or use specific make targets:

```bash
make gql    # GraphQL only
make oapi   # OpenAPI only
```

### Frontend

```bash
cd web
yarn gql
```

---

## GraphQL Code Generation (Backend — gqlgen)

### Configuration

`server/gqlgen.yml` controls the generation:

```yaml
schema:
  - schemas/gql/*.graphql       # Input: GraphQL schema files

exec:
  filename: internal/adapter/gql/generated.go    # Generated resolver plumbing

model:
  filename: internal/adapter/gql/gqlmodel/models_gen.go  # Generated Go types

resolver:
  layout: follow-schema
  dir: internal/adapter/gql
  filename_template: resolver_{name}.go
  type: Resolver
```

### What Gets Generated

1. **`models_gen.go`** — Go structs for all GraphQL types (`Item`, `Asset`, `Schema`, etc.)
2. **`generated.go`** — The resolver interface and HTTP handler plumbing
3. **Resolver stubs** (if a new resolver file is needed) — skeletal resolver files with `// TODO: implement` stubs

### Workflow After Schema Changes

1. Modify `schemas/gql/*.graphql`
2. Run `go generate ./...`
3. Implement any new resolver stubs created in `internal/adapter/gql/resolver_*.go`
4. Add model conversions in `internal/adapter/gql/gqlmodel/convert_*.go`

---

## OpenAPI Code Generation (Backend — oapi-codegen)

### Configuration

```bash
oapi-codegen \
  -generate types,server \
  -package publicapi \
  schemas/integration/integration.yml \
  > internal/adapter/publicapi/oapi_gen.go
```

### What Gets Generated

- Go interface `StrictServerInterface` with one method per API endpoint
- Go structs for all request/response body types
- HTTP handler plumbing that routes requests to the interface methods

### Workflow

1. Modify `schemas/integration/integration.yml`
2. Run `go generate ./...`
3. Implement any new methods in `internal/adapter/publicapi/`

---

## Mock Generation (Backend — mockgen)

Mocks are generated for all repository and gateway interfaces, enabling unit tests that don't require a real MongoDB connection.

### Example

```go
// internal/usecase/repo/item.go
//go:generate go run github.com/golang/mock/mockgen -source=item.go -destination=mock_item.go -package=mock_repo
type Item interface {
    FindByID(ctx context.Context, id item.ID, ref *version.Ref) (item.Versioned, error)
    // ...
}
```

After running `go generate ./...`, a `mock_item.go` file is created:

```go
// internal/usecase/repo/mock_item.go (auto-generated)
type MockItem struct { ctrl *gomock.Controller }
func (m *MockItem) FindByID(...) (item.Versioned, error) { ... }
```

---

## GraphQL Code Generation (Frontend — graphql-codegen)

### Configuration

`web/codegen.ts` controls the frontend generation:

```typescript
// Reads: GraphQL schema + operation files
// Generates: TypeScript types and React hooks
```

### What Gets Generated

For every `.graphql` operation file, the following are generated in `web/src/gql/__generated__/`:
- TypeScript types for all input/output shapes
- React hooks: `useXxxQuery`, `useXxxMutation`, `useXxxLazyQuery`
- Fragment types for reusable GraphQL fragments

### Workflow

1. Add a new query/mutation in `web/src/gql/queries/` or `web/src/gql/mutations/`
2. Run `yarn gql`
3. Use the generated hook in your component

```typescript
// web/src/gql/queries/items.graphql
query GetItems($modelId: ID!) {
  items(modelId: $modelId) {
    nodes { id }
  }
}

// After yarn gql, this hook is available:
import { useGetItemsQuery } from "@reearth-cms/gql/__generated__/graphql";
```

---

## Important Notes

- **Never edit generated files** — they are overwritten on every `go generate` / `yarn gql` run
- Generated files include a header comment: `// Code generated ... DO NOT EDIT`
- If a generated file is out of date (e.g. after a schema change), the build may fail with type errors — this is intentional to force regeneration
- Commit generated files to the repository so that CI doesn't need to regenerate on every build
