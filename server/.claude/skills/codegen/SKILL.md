---
name: codegen
description: How and when to run code generation in the reearth-cms server (server/) — gqlgen (GraphQL), oapi-codegen (OpenAPI/integration API), mockgen (repo/gateway mocks), and protoc (internal gRPC). Use whenever you edit a *.graphql schema, an OpenAPI yml spec, a .proto file, or add/change a repo or gateway interface, or when generated files (generated.go, models_gen.go, *mock*) are stale or out of sync.
---

# Code generation — reearth-cms server

Generated files are checked in. After editing a source-of-truth (schema/spec/proto/interface), regenerate and commit the result. Run all commands from `server/`.

## What to run after editing what

| You edited… | Run | Regenerates |
|---|---|---|
| `schemas/*.graphql` or gqlgen config | `make gql` | `internal/adapter/gql/generated.go`, `gqlmodel/models_gen.go` |
| `schemas/integration/integration.yml` (OpenAPI) | `make oapi` | `pkg/integrationapi/*` + `internal/adapter/integration/*` |
| A repo/gateway interface with `//go:generate mockgen` | `go generate ./...` | mocks (e.g. `internal/usecase/gateway/gatewaymock/*`) |
| `schemas/internalapi/v1/schema.proto` | `make grpc` | gRPC Go stubs under `internal/adapter/internalapi/` (needs `protoc`) |
| i18n message keys | `make i18n` | `i18n/` translation files |
| anything with a `//go:generate` directive | `go generate ./...` | everything |

The Makefile targets (`server/Makefile`):

```bash
make gql   # go generate ./internal/adapter/gql
make oapi  # go generate ./pkg/integrationapi && go generate ./internal/adapter/integration
make grpc  # protoc ... (requires protoc + plugins installed)
```

`go generate ./...` runs all `//go:generate` directives at once — the catch-all. Use the specific Make target when you only touched one area and want a fast loop.

## Workflow

1. Edit the source-of-truth (schema / spec / proto / interface).
2. Run the matching command above.
3. For GraphQL: implement the new resolver methods that gqlgen stubs out (it appends unimplemented methods to `resolver_*.go` / panics until you fill them). Keep resolvers thin — delegate to interactors.
4. `make check` to confirm everything compiles, then `make test`.

## Notes

- Do **not** hand-edit generated files (`generated.go`, `models_gen.go`, `*mock*.go`, oapi `*.gen.go`, proto `*.pb.go`). Change the source and regenerate.
- gqlgen config: `gqlgen.yml`. oapi configs: `*.cfg.yml` next to the `//go:generate` directive.
- If generation fails, the schema/spec usually has an error — read the generator output; don't patch generated output to compensate.
- Commit the regenerated files together with the source change so CI's "generated code is up to date" check passes.
