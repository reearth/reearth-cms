# GraphQL API

Re:Earth CMS exposes a full-featured GraphQL API used by the web frontend and available to developers building custom applications.

## Endpoint

```
POST /api/graphql
```

For WebSocket subscriptions:
```
wss://<host>/api/graphql
```

## Authentication

Include a Bearer token in the `Authorization` header:
```
Authorization: Bearer <token>
```

See [Authentication](./authentication.md) for token types.

## GraphQL Playground

When `REEARTH_CMS_DEV=true`, a GraphQL Playground (or GraphiQL) is available at `GET /api/graphql` for interactive query exploration with built-in schema documentation.

---

## Schema Overview

The GraphQL schema is organized into the following types and operations:

### Query Operations

#### Workspace & User
```graphql
me {
  id, name, email
  myWorkspace { id, name }
  workspaces { id, name, members { ... } }
}

node(id: ID!, type: NodeType!): Node
nodes(ids: [ID!]!, type: NodeType!): [Node]!
```

#### Projects
```graphql
projects(workspaceId: ID!, pagination: Pagination): ProjectConnection!
checkProjectAlias(alias: String!): ProjectAliasAvailability!
```

#### Models
```graphql
models(projectId: ID!, pagination: Pagination): ModelConnection!
model(id: ID!): Model
```

#### Schema & Fields
```graphql
schema(id: ID!): Schema
node(id: ID!, type: NodeType!): Node  # for Field nodes
```

#### Items
```graphql
items(
  modelId: ID!
  query: ItemQuery
  pagination: Pagination
  sort: ItemSort
  filter: ConditionInput
): ItemConnection!

item(id: ID!): VersionedItem
itemsByIDs(ids: [ID!]!): [VersionedItem]!

searchItem(
  modelId: ID!
  query: ItemQuery
  pagination: Pagination
  sort: ItemSort
  filter: ConditionInput
): ItemConnection!
```

#### Assets
```graphql
assets(
  projectId: ID!
  keyword: String
  sort: AssetSort
  pagination: Pagination
): AssetConnection!

asset(id: ID!): Asset
```

#### Requests
```graphql
requests(
  projectId: ID!
  state: [RequestState]
  reviewer: ID
  pagination: Pagination
): RequestConnection!

request(id: ID!): Request
```

#### Views
```graphql
views(modelId: ID!): [View]!
```

#### Integrations
```graphql
integrations(workspaceId: ID!): [Integration]!
integration(id: ID!): Integration
```

---

### Mutation Operations

#### Workspace
```graphql
createWorkspace(input: CreateWorkspaceInput!): WorkspacePayload
updateWorkspace(input: UpdateWorkspaceInput!): WorkspacePayload
deleteWorkspace(input: DeleteWorkspaceInput!): DeleteWorkspacePayload
addMemberToWorkspace(input: AddMemberToWorkspaceInput!): AddMemberToWorkspacePayload
updateMemberOfWorkspace(input: UpdateMemberOfWorkspaceInput!): UpdateMemberOfWorkspacePayload
removeMemberFromWorkspace(input: RemoveMemberFromWorkspaceInput!): RemoveMemberFromWorkspacePayload
```

#### Project
```graphql
createProject(input: CreateProjectInput!): ProjectPayload
updateProject(input: UpdateProjectInput!): ProjectPayload
deleteProject(input: DeleteProjectInput!): DeleteProjectPayload
publishProject(input: PublishProjectInput!): ProjectPayload
```

#### Model
```graphql
createModel(input: CreateModelInput!): ModelPayload
updateModel(input: UpdateModelInput!): ModelPayload
deleteModel(input: DeleteModelInput!): DeleteModelPayload
updateModelsOrder(input: UpdateModelsOrderInput!): ModelsPayload
```

#### Schema / Fields
```graphql
createField(input: CreateFieldInput!): FieldPayload
updateField(input: UpdateFieldInput!): FieldPayload
deleteField(input: DeleteFieldInput!): DeleteFieldPayload
updateFieldsOrder(input: UpdateFieldsOrderInput!): FieldsPayload
```

#### Items
```graphql
createItem(input: CreateItemInput!): ItemPayload
updateItem(input: UpdateItemInput!): ItemPayload
deleteItem(input: DeleteItemInput!): DeleteItemPayload
deleteItems(input: DeleteItemsInput!): DeleteItemsPayload
publishItem(input: PublishItemInput!): PublishItemPayload
unpublishItem(input: UnpublishItemInput!): UnpublishItemPayload
```

#### Assets
```graphql
createAsset(input: CreateAssetInput!): CreateAssetPayload
createAssetUpload(input: CreateAssetUploadInput!): CreateAssetUploadPayload
updateAsset(input: UpdateAssetInput!): AssetPayload
deleteAsset(input: DeleteAssetInput!): DeleteAssetPayload
```

#### Requests
```graphql
createRequest(input: CreateRequestInput!): RequestPayload
updateRequest(input: UpdateRequestInput!): RequestPayload
approveRequest(requestId: ID!): RequestPayload
deleteRequest(requestId: ID!): DeleteRequestPayload
```

#### Comments
```graphql
addComment(input: AddCommentInput!): CommentPayload
updateComment(input: UpdateCommentInput!): CommentPayload
deleteComment(input: DeleteCommentInput!): DeleteCommentPayload
```

#### Views
```graphql
createView(input: CreateViewInput!): ViewPayload
updateView(input: UpdateViewInput!): ViewPayload
deleteView(input: DeleteViewInput!): DeleteViewPayload
```

#### Integrations & Webhooks
```graphql
createIntegration(input: CreateIntegrationInput!): IntegrationPayload
updateIntegration(input: UpdateIntegrationInput!): IntegrationPayload
deleteIntegration(input: DeleteIntegrationInput!): DeleteIntegrationPayload
createWebhook(input: CreateWebhookInput!): WebhookPayload
updateWebhook(input: UpdateWebhookInput!): WebhookPayload
deleteWebhook(input: DeleteWebhookInput!): DeleteWebhookPayload
```

---

## Example Queries

### List items in a model

```graphql
query GetItems($modelId: ID!) {
  items(modelId: $modelId, pagination: { page: 1, perPage: 20 }) {
    nodes {
      id
      fields {
        schemaFieldId
        value
        type
      }
      status
      createdAt
      updatedAt
    }
    pageInfo {
      totalCount
      page
      perPage
    }
  }
}
```

### Create an item

```graphql
mutation CreateItem($modelId: ID!, $schemaId: ID!, $fields: [ItemFieldInput!]!) {
  createItem(input: {
    modelId: $modelId
    schemaId: $schemaId
    fields: $fields
  }) {
    item {
      id
      status
    }
  }
}
```

### Filter items

```graphql
query FilteredItems($modelId: ID!) {
  items(
    modelId: $modelId
    filter: {
      and: {
        conditions: [
          { basicFieldCondition: { fieldId: { id: "status-field" }, operator: TEXT_EQUALS, value: "active" } }
          { basicFieldCondition: { fieldId: { id: "date-field" }, operator: AFTER, value: "2024-01-01" } }
        ]
      }
    }
  ) {
    nodes { id }
  }
}
```

### Upload an asset

```graphql
mutation UploadAsset($projectId: ID!, $file: Upload!) {
  createAsset(input: { projectId: $projectId, file: $file }) {
    asset {
      id
      url
      fileName
      size
      previewType
    }
  }
}
```

---

## File Upload

For file uploads, use `multipart/form-data` with the GraphQL multipart request spec. Apollo Client handles this automatically when you pass a `File` object as a variable.

```javascript
const [createAsset] = useMutation(CREATE_ASSET_MUTATION);
await createAsset({
  variables: { projectId, file: selectedFile },
});
```

---

## Subscriptions

GraphQL subscriptions are supported over WebSocket (graphql-ws protocol). Available subscriptions include item and asset change events.

---

## Error Handling

Errors follow the GraphQL spec — errors are returned in the `errors` array alongside any partial `data`:

```json
{
  "errors": [
    {
      "message": "item not found",
      "locations": [...],
      "path": ["item"],
      "extensions": { "code": "NOT_FOUND" }
    }
  ],
  "data": { "item": null }
}
```

Common error codes:
- `NOT_FOUND` — resource does not exist or you do not have access
- `UNAUTHORIZED` — missing or invalid token
- `FORBIDDEN` — insufficient permissions
- `BAD_REQUEST` — invalid input
- `COMPLEXITY_LIMIT` — query exceeds the complexity limit (default: 6000)
