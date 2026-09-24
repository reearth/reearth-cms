# REST APIs

Re:Earth CMS exposes two distinct REST APIs:

| API | Base path | Purpose | Auth required |
|---|---|---|---|
| **Integration API** | `/api/{ws}/projects/{proj}/...` | Full CRUD for integrations and API key users | Yes (token/API key) |
| **Public Read API** | `/api/p/{ws}/{proj}/...` | Read-only access to published content | No (public projects) |

---

## Integration API

The Integration API is the primary REST interface for programmatic access. It is defined using OpenAPI 3.0 (`server/schemas/integration/integration.yml`) and supports full CRUD operations.

### Base URL

```
https://<host>/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/...
```

Both IDs and human-readable aliases are accepted in path parameters.

### Authentication

```
Authorization: Bearer <integration-token-or-api-key>
```

Private resources return `404` (not `401`) to avoid leaking resource existence.

---

## Public Read API

The Public Read API provides unauthenticated read access to published content in public projects. It is mounted at `/api/p` and exposes only `GET` endpoints.

```
https://<host>/api/p/{workspace}/{project}/...
```

This API is intended for consuming published content in front-end applications without requiring authentication.

---

---

## Projects

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/{ws}/projects` | List projects in a workspace |
| `POST` | `/api/{ws}/projects` | Create a project |
| `GET` | `/api/{ws}/projects/{proj}` | Get a project |
| `PATCH` | `/api/{ws}/projects/{proj}` | Update a project |
| `DELETE` | `/api/{ws}/projects/{proj}` | Delete a project |

---

## Models

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/{ws}/projects/{proj}/models` | List models in a project |
| `POST` | `/api/{ws}/projects/{proj}/models` | Create a model |
| `GET` | `/api/{ws}/projects/{proj}/models/{model}` | Get a model |
| `PATCH` | `/api/{ws}/projects/{proj}/models/{model}` | Update a model |
| `DELETE` | `/api/{ws}/projects/{proj}/models/{model}` | Delete a model |
| `GET` | `/api/{ws}/projects/{proj}/models/{model}/schema.json` | Get model schema as JSON |
| `GET` | `/api/{ws}/projects/{proj}/models/{model}/metadata_schema.json` | Get metadata schema as JSON |

---

## Schema Fields

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/{ws}/projects/{proj}/schemata/{schemaId}/fields` | List fields in a schema |
| `POST` | `/api/{ws}/projects/{proj}/schemata/{schemaId}/fields` | Add a field |
| `PATCH` | `/api/{ws}/projects/{proj}/schemata/{schemaId}/fields/{field}` | Update a field |
| `DELETE` | `/api/{ws}/projects/{proj}/schemata/{schemaId}/fields/{field}` | Delete a field |

---

## Items

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/{ws}/projects/{proj}/models/{model}/items` | List items (paginated) |
| `POST` | `/api/{ws}/projects/{proj}/models/{model}/items` | Create an item |
| `POST` | `/api/{ws}/projects/{proj}/models/{model}/items/filter` | Filter items with a request body |
| `GET` | `/api/{ws}/projects/{proj}/models/{model}/items/{id}` | Get a single item |
| `PATCH` | `/api/{ws}/projects/{proj}/models/{model}/items/{id}` | Update an item |
| `DELETE` | `/api/{ws}/projects/{proj}/models/{model}/items/{id}` | Delete an item |
| `POST` | `/api/{ws}/projects/{proj}/models/{model}/items/{id}/publish` | Publish/unpublish an item |

### Export Formats

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/{ws}/projects/{proj}/models/{model}/items.geojson` | Export items as GeoJSON |
| `GET` | `/api/{ws}/projects/{proj}/models/{model}/items.csv` | Export items as CSV |

### Import

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/{ws}/projects/{proj}/models/{model}/import` | Bulk import items (JSON, CSV, GeoJSON) |

---

## Assets

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/{ws}/projects/{proj}/assets` | List assets |
| `POST` | `/api/{ws}/projects/{proj}/assets` | Upload an asset |
| `POST` | `/api/{ws}/projects/{proj}/assets/uploads` | Get a presigned upload URL |
| `GET` | `/api/{ws}/projects/{proj}/assets/{id}` | Get asset metadata |
| `PATCH` | `/api/{ws}/projects/{proj}/assets/{id}` | Update asset metadata |
| `DELETE` | `/api/{ws}/projects/{proj}/assets/{id}` | Delete an asset |
| `POST` | `/api/{ws}/projects/{proj}/assets/{id}/publish` | Publish an asset |
| `POST` | `/api/{ws}/projects/{proj}/assets/{id}/unpublish` | Unpublish an asset |
| `GET` | `/api/{ws}/projects/{proj}/assets/{uuid1}/{uuid2}/{filename}` | Download asset file directly |

---

## Comments

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/{ws}/projects/{proj}/models/{model}/items/{id}/comments` | List comments on an item |
| `POST` | `/api/{ws}/projects/{proj}/models/{model}/items/{id}/comments` | Post a comment |
| `PATCH` | `/api/{ws}/projects/{proj}/models/{model}/items/{id}/comments/{commentId}` | Edit a comment |
| `DELETE` | `/api/{ws}/projects/{proj}/models/{model}/items/{id}/comments/{commentId}` | Delete a comment |
| `GET` | `/api/{ws}/projects/{proj}/assets/{id}/comments` | List comments on an asset |
| `POST` | `/api/{ws}/projects/{proj}/assets/{id}/comments` | Post a comment on an asset |

---

## Groups

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/{ws}/projects/{proj}/groups` | List groups in a project |
| `POST` | `/api/{ws}/projects/{proj}/groups` | Create a group |
| `GET` | `/api/{ws}/projects/{proj}/groups/{group}` | Get a group |
| `PATCH` | `/api/{ws}/projects/{proj}/groups/{group}` | Update a group |
| `DELETE` | `/api/{ws}/projects/{proj}/groups/{group}` | Delete a group |

---

## Response Format

### Item Object

```json
{
  "id": "item-id",
  "modelId": "model-id",
  "schemaId": "schema-id",
  "fields": [
    {
      "id": "field-id",
      "type": "text",
      "key": "title",
      "value": "My Article"
    },
    {
      "id": "field-id-2",
      "type": "asset",
      "key": "cover",
      "value": {
        "id": "asset-id",
        "url": "https://storage.example.com/...",
        "fileName": "cover.jpg"
      }
    }
  ],
  "createdAt": "2024-03-15T09:30:00Z",
  "updatedAt": "2024-03-15T10:00:00Z",
  "status": "PUBLIC"
}
```

### Paginated List Response

```json
{
  "items": [...],
  "totalCount": 142,
  "page": 1,
  "perPage": 50
}
```

---

## Query Parameters

Common query parameters for list endpoints:

| Parameter | Description |
|---|---|
| `page` | Page number (default: 1) |
| `perPage` | Items per page (default: 50, max: 100) |
| `sort` | Sort field (e.g. `createdAt`, `updatedAt`) |
| `dir` | Sort direction: `asc` or `desc` (default: `desc`) |
| `keyword` | Keyword search |

---

## Item Create / Update Body

```json
{
  "fields": [
    { "key": "title", "value": "My Article" },
    { "key": "status", "value": "active" },
    { "key": "published-date", "value": "2024-03-15T00:00:00Z" }
  ]
}
```

Fields can be specified by `key` (field API key) or `id` (field ID).

---

## OpenAPI Spec

The full OpenAPI 3.0 specification is available at:
```
server/schemas/integration/integration.yml
```

You can use this spec to generate client code in any language using tools like [openapi-generator](https://openapi-generator.tech/) or [swagger-codegen](https://swagger.io/tools/swagger-codegen/).

```bash
# Example: generate a TypeScript client
openapi-generator-cli generate \
  -i server/schemas/integration/integration.yml \
  -g typescript-axios \
  -o ./clients/typescript
```
