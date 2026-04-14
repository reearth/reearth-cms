# API Overview

Re:Earth CMS exposes three APIs for different use cases:

| API | Protocol | Base Path | Use Case |
|---|---|---|---|
| **GraphQL API** | HTTP POST + WebSocket | `/api/graphql` | Used by the web frontend; full read/write access |
| **Integration REST API** | HTTP (OpenAPI 3.0) | `/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/...` | External integrations, data pipelines, programmatic access |
| **Public Read API** | HTTP | `/api/p/{workspaceIdOrAlias}/{projectIdOrAlias}/...` | Unauthenticated read access to published content in public projects |
| **Internal gRPC API** | gRPC | port `50051` | Machine-to-machine (worker ↔ server) |

Most developers and integrators use the **Integration REST API**, **Public Read API**, or **GraphQL API**.

---

## Choosing an API

### GraphQL API
- Best for: building custom frontends, advanced queries with flexible field selection, real-time subscriptions
- Authentication: user JWT or integration token
- All operations (create, read, update, delete, publish)
- Supports complex filtering, pagination, and nested field fetching

### Integration REST API
- Best for: external integrations, data pipelines, simple CRUD, language-agnostic access
- Authentication: integration secret token or API key
- OpenAPI 3.0 spec — generate client code in any language
- Includes GeoJSON and CSV export endpoints
- Returns `404` (not `401`) for inaccessible resources to avoid leaking resource existence

### Public Read API
- Best for: delivering published content to websites, dashboards, and apps without authentication
- Authentication: none required (public projects only)
- Read-only (`GET` endpoints only)
- Returns only items with `PUBLIC` status and assets marked public
- Returns `404` for private or unpublished resources

### Internal gRPC API
- For internal service communication only (worker → server)
- Not intended for external use

---

## Authentication Overview

All APIs use **Bearer token** authentication via the `Authorization` HTTP header:

```
Authorization: Bearer <token>
```

Three types of tokens are accepted:

| Token Type | Issued By | Use Case |
|---|---|---|
| **User JWT** | Auth0 / Firebase / Cognito | Web UI, user-facing apps |
| **Integration Token** | Re:Earth CMS (when creating an integration) | Server-to-server, integrations |
| **API Key** | Re:Earth CMS (project settings) | Simple project-level access |

See [Authentication](./authentication.md) for full details.

---

## Pagination

Both APIs use **offset-based pagination**.

### GraphQL

```graphql
query {
  items(modelId: "...", pagination: { page: 1, perPage: 50 }) {
    nodes { id }
    pageInfo { totalCount page perPage }
  }
}
```

### REST API

Query parameters: `?page=1&perPage=50`

Default: `page=1`, `perPage=50`. Maximum: `perPage=100`.

---

## Rate Limits

Rate limits are enforced by the policy checker (if configured). In the default `permissive` mode (open source / self-hosted), no rate limits are applied.

---

## API Versioning

- The GraphQL API does not use explicit versioning — it evolves backward-compatibly.
- The REST API is at version `1.0.0` and uses path-based versioning.

---

## Quick Reference

| Resource | GraphQL | REST |
|---|---|---|
| Items | `items(...)`, `createItem(...)` | `GET/POST /api/{ws}/projects/{proj}/models/{model}/items` |
| Assets | `assets(...)`, `createAsset(...)` | `GET/POST /api/{ws}/projects/{proj}/assets` |
| Models | `models(...)`, `createModel(...)` | `GET/POST /api/{ws}/projects/{proj}/models` |
| Schema | `schema(...)`, `createField(...)` | `GET /api/{ws}/projects/{proj}/models/{model}/schema.json` |
| Projects | `projects(...)` | `GET/POST /api/{ws}/projects` |
| Comments | `addComment(...)` | `GET/POST /api/{ws}/projects/{proj}/models/{model}/items/{id}/comments` |

For detailed operation documentation:
- [GraphQL API](./graphql-api.md)
- [Public REST API](./public-rest-api.md)
- [Authentication](./authentication.md)
- [Webhooks](./webhooks.md)
