# Public REST API

Re:Earth CMS provides a REST API for external integrations and programmatic access. It is defined using OpenAPI 3.0 and covers the most common content operations.

## Base URL

All endpoints are relative to the server's base URL, using the workspace and project identifiers as path prefixes:

```
https://<host>/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/...
```

Both IDs and human-readable aliases are accepted in path parameters.

## Authentication

```
Authorization: Bearer <integration-token-or-api-key>
```

For public projects, read endpoints work without authentication. Private resources return `404` (not `401`) to avoid leaking resource existence.

---

## Projects

| Method | Path | Description |
|---|---|---|
| `GET` | `/{ws}/projects` | List projects in a workspace |
| `POST` | `/{ws}/projects` | Create a project |
| `GET` | `/{ws}/projects/{proj}` | Get a project |
| `PATCH` | `/{ws}/projects/{proj}` | Update a project |
| `DELETE` | `/{ws}/projects/{proj}` | Delete a project |

---

## Models

| Method | Path | Description |
|---|---|---|
| `GET` | `/{ws}/{proj}/models` | List models in a project |
| `POST` | `/{ws}/{proj}/models` | Create a model |
| `GET` | `/{ws}/{proj}/models/{model}` | Get a model |
| `PATCH` | `/{ws}/{proj}/models/{model}` | Update a model |
| `DELETE` | `/{ws}/{proj}/models/{model}` | Delete a model |
| `GET` | `/{ws}/{proj}/models/{model}/schema.json` | Get model schema as JSON |
| `GET` | `/{ws}/{proj}/models/{model}/metadata_schema.json` | Get metadata schema as JSON |

---

## Schema Fields

| Method | Path | Description |
|---|---|---|
| `GET` | `/{ws}/{proj}/schemata/{schemaId}/fields` | List fields in a schema |
| `POST` | `/{ws}/{proj}/schemata/{schemaId}/fields` | Add a field |
| `PATCH` | `/{ws}/{proj}/schemata/{schemaId}/fields/{field}` | Update a field |
| `DELETE` | `/{ws}/{proj}/schemata/{schemaId}/fields/{field}` | Delete a field |

---

## Items

| Method | Path | Description |
|---|---|---|
| `GET` | `/{ws}/{proj}/models/{model}/items` | List items (paginated) |
| `POST` | `/{ws}/{proj}/models/{model}/items` | Create an item |
| `POST` | `/{ws}/{proj}/models/{model}/items/filter` | Filter items with a request body |
| `GET` | `/{ws}/{proj}/models/{model}/items/{id}` | Get a single item |
| `PATCH` | `/{ws}/{proj}/models/{model}/items/{id}` | Update an item |
| `DELETE` | `/{ws}/{proj}/models/{model}/items/{id}` | Delete an item |
| `POST` | `/{ws}/{proj}/models/{model}/items/{id}/publish` | Publish/unpublish an item |

### Export Formats

| Method | Path | Description |
|---|---|---|
| `GET` | `/{ws}/{proj}/models/{model}/items.geojson` | Export items as GeoJSON |
| `GET` | `/{ws}/{proj}/models/{model}/items.csv` | Export items as CSV |

### Import

| Method | Path | Description |
|---|---|---|
| `POST` | `/{ws}/{proj}/models/{model}/import` | Bulk import items (JSON, CSV, GeoJSON) |

---

## Assets

| Method | Path | Description |
|---|---|---|
| `GET` | `/{ws}/{proj}/assets` | List assets |
| `POST` | `/{ws}/{proj}/assets` | Upload an asset |
| `POST` | `/{ws}/{proj}/assets/uploads` | Get a presigned upload URL |
| `GET` | `/{ws}/{proj}/assets/{id}` | Get asset metadata |
| `PATCH` | `/{ws}/{proj}/assets/{id}` | Update asset metadata |
| `DELETE` | `/{ws}/{proj}/assets/{id}` | Delete an asset |
| `POST` | `/{ws}/{proj}/assets/{id}/publish` | Publish an asset |
| `POST` | `/{ws}/{proj}/assets/{id}/unpublish` | Unpublish an asset |
| `GET` | `/{ws}/{proj}/assets/{uuid1}/{uuid2}/{filename}` | Download asset file directly |

---

## Comments

| Method | Path | Description |
|---|---|---|
| `GET` | `/{ws}/{proj}/models/{model}/items/{id}/comments` | List comments on an item |
| `POST` | `/{ws}/{proj}/models/{model}/items/{id}/comments` | Post a comment |
| `PATCH` | `/{ws}/{proj}/models/{model}/items/{id}/comments/{commentId}` | Edit a comment |
| `DELETE` | `/{ws}/{proj}/models/{model}/items/{id}/comments/{commentId}` | Delete a comment |
| `GET` | `/{ws}/{proj}/assets/{id}/comments` | List comments on an asset |
| `POST` | `/{ws}/{proj}/assets/{id}/comments` | Post a comment on an asset |

---

## Groups

| Method | Path | Description |
|---|---|---|
| `GET` | `/{ws}/{proj}/groups` | List groups in a project |
| `POST` | `/{ws}/{proj}/groups` | Create a group |
| `GET` | `/{ws}/{proj}/groups/{group}` | Get a group |
| `PATCH` | `/{ws}/{proj}/groups/{group}` | Update a group |
| `DELETE` | `/{ws}/{proj}/groups/{group}` | Delete a group |

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
| `sortDir` | Sort direction: `asc` or `desc` |
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
