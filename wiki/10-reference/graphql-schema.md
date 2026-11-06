# GraphQL Schema Reference

This page documents the key types, enums, and operations in the Re:Earth CMS GraphQL schema. The full schema is defined in `server/schemas/gql/`.

## Scalar Types

| Scalar | Description |
|---|---|
| `ID` | Unique identifier (ULID-based) |
| `DateTime` | ISO 8601 datetime string |
| `URL` | URL string |
| `Cursor` | Pagination cursor |
| `FileSize` | File size in bytes |
| `Any` | Any JSON value (used for field values) |
| `Upload` | File upload (multipart) |
| `Lang` | Language code (e.g. `en`, `ja`) |

---

## Core Types

### Item

```graphql
type Item implements Node {
  id: ID!
  schemaId: ID!
  modelId: ID!
  projectId: ID!
  userId: ID
  integrationId: ID
  metadataId: ID
  originalId: ID
  isMetadata: Boolean!
  createdBy: Operator
  updatedBy: Operator
  updatedByUserId: ID
  updatedByIntegrationId: ID
  schema: Schema!
  model: Model!
  project: Project!
  status: ItemStatus!
  fields: [ItemField!]!
  assets: [Asset]!
  referencedItems: [Item!]
  requests: [Request!]
  thread: Thread
  threadId: ID
  metadata: Item
  original: Item
  title: String
  version: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ItemField {
  schemaFieldId: ID!
  itemGroupId: ID       # Non-null for fields inside a Group
  type: SchemaFieldType!
  value: Any            # The field's value (type depends on SchemaFieldType)
}

type VersionedItem {
  version: String!
  parents: [String!]
  refs: [String!]!     # e.g. ["latest", "public"]
  value: Item!
}

enum ItemStatus {
  DRAFT
  PUBLIC
  REVIEW
  PUBLIC_REVIEW
  PUBLIC_DRAFT
}
```

### Asset

```graphql
type Asset implements Node {
  id: ID!
  projectId: ID!
  project: Project!
  fileName: String!
  size: FileSize!
  url: String!
  uuid: String!
  previewType: PreviewType
  contentType: String
  contentEncoding: String
  public: Boolean!
  archiveExtractionStatus: ArchiveExtractionStatus
  thread: Thread
  threadId: ID
  items: [AssetItem!]
  createdAt: DateTime!
  createdBy: Operator!
  createdByType: OperatorType!
  createdById: ID!
}

enum PreviewType {
  IMAGE
  IMAGE_SVG
  GEO
  GEO_3D_TILES
  GEO_MVT
  MODEL_3D
  CSV
  UNKNOWN
}

enum ArchiveExtractionStatus {
  PENDING
  IN_PROGRESS
  DONE
  FAILED
  SKIPPED
}
```

### Schema and Fields

```graphql
type Schema implements Node {
  id: ID!
  projectId: ID!
  fields: [SchemaField!]!
  titleFieldId: ID
}

type SchemaField {
  id: ID!
  modelId: ID
  model: Model
  schemaId: ID!
  type: SchemaFieldType!
  typeProperty: SchemaFieldTypeProperty
  dbKey: String!      # Internal key
  key: String!        # API key
  title: Boolean!
  unique: Boolean!
  multiple: Boolean!
  required: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  order: Int
  description: String
  groupId: ID
}

enum SchemaFieldType {
  Text
  TextArea
  RichText
  MarkdownText
  Asset
  Date
  Bool
  Select
  Tag
  Integer
  Reference
  Checkbox
  URL
  Group
  GeometryObject
  GeometryEditor
  Number
}
```

### Model

```graphql
type Model implements Node {
  id: ID!
  projectId: ID!
  project: Project!
  name: String!
  description: String
  public: Boolean!
  key: String!
  schema: Schema!
  metadataSchema: Schema
  schemaId: ID!
  metadataSchemaId: ID
  createdAt: DateTime!
  updatedAt: DateTime!
  order: Int
}
```

### Project

```graphql
type Project implements Node {
  id: ID!
  workspaceId: ID!
  workspace: Workspace
  name: String!
  description: String
  alias: String!
  publication: ProjectPublication
  requestRoles: [Role]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ProjectPublication {
  scope: ProjectPublicationScope!
  assetPublic: Boolean!
  models: [Model!]
}

enum ProjectPublicationScope {
  PUBLIC
  PRIVATE
  LIMITED
}
```

### Workspace

```graphql
type Workspace implements Node {
  id: ID!
  name: String!
  personal: Boolean!
  members: [WorkspaceMember!]!
}

type WorkspaceMember {
  userId: ID!
  user: User
  integrationId: ID
  integration: Integration
  role: Role!
}

enum Role {
  READER
  WRITER
  MAINTAINER
  OWNER
}
```

### Request

```graphql
type Request implements Node {
  id: ID!
  workspaceId: ID!
  projectId: ID!
  title: String!
  description: String
  createdBy: User
  reviewers: [User!]!
  state: RequestState!
  items: [RequestItem!]!
  thread: Thread!
  createdAt: DateTime!
  updatedAt: DateTime!
  approvedAt: DateTime
  closedAt: DateTime
}

type RequestItem {
  itemId: ID!
  item: VersionedItem!
  version: String!
}

enum RequestState {
  DRAFT
  WAITING
  APPROVED
  CLOSED
}
```

### Thread and Comments

```graphql
type Thread implements Node {
  id: ID!
  workspaceId: ID!
  comments: [Comment!]!
}

type Comment {
  id: ID!
  author: Operator
  authorId: ID!
  authorType: OperatorType!
  content: String!
  createdAt: DateTime!
}
```

### Integration

```graphql
type Integration implements Node {
  id: ID!
  name: String!
  description: String
  logoUrl: URL
  type: IntegrationType!
  developer: User!
  developerId: ID!
  webhooks: [Webhook!]!
  createdAt: DateTime!
  updatedAt: DateTime!
  iType: IntegrationType!
}

enum IntegrationType {
  Public
  Private
}

type Webhook {
  id: ID!
  name: String!
  url: URL!
  active: Boolean!
  secret: String!
  trigger: WebhookTrigger!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type WebhookTrigger {
  onItemCreate: Boolean
  onItemUpdate: Boolean
  onItemDelete: Boolean
  onItemPublish: Boolean
  onItemUnPublish: Boolean
  onAssetUpload: Boolean
  onAssetDecompress: Boolean
  onAssetDelete: Boolean
}
```

### View

```graphql
type View implements Node {
  id: ID!
  projectId: ID!
  modelId: ID!
  name: String!
  columns: ViewColumn
  sort: ItemSortInput
  filter: ConditionInput
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Job

```graphql
type Job implements Node {
  id: ID!
  workspaceId: ID!
  status: JobStatus!
  debug: String
}

enum JobStatus {
  RUNNING
  COMPLETED
  FAILED
}
```

---

## Filter Types

Used in the `filter` argument of `items(...)` and `searchItem(...)`:

```graphql
input ConditionInput {
  and: AndConditionInput
  or: OrConditionInput
  basic: BasicFieldConditionInput
  nullable: NullableFieldConditionInput
  multiple: MultipleFieldConditionInput
  bool: BoolFieldConditionInput
  string: StringConditionInput
  number: NumberConditionInput
  time: TimeConditionInput
}

input AndConditionInput {
  conditions: [ConditionInput!]!
}

input OrConditionInput {
  conditions: [ConditionInput!]!
}
```

---

## Shared Enums

```graphql
enum OperatorType {
  User
  Integration
}

union Operator = User | Integration

enum NodeType {
  USER
  WORKSPACE
  PROJECT
  ASSET
  REQUEST
  Model
  Schema
  Item
  View
  Integration
  Group
  WorkspaceSettings
}
```

---

## Pagination

```graphql
input Pagination {
  first: Int
  last: Int
  offset: Int
  after: Cursor
  before: Cursor
}

type PageInfo {
  startCursor: Cursor
  endCursor: Cursor
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}
```

Most list types return a Connection type:

```graphql
type ItemConnection {
  edges: [ItemEdge!]!
  nodes: [Item]!
  pageInfo: PageInfo!
  totalCount: Int!
}
```

---

## Schema Files

| File | Contents |
|---|---|
| `_shared.graphql` | Scalars, directives, base types, pagination |
| `item.graphql` | Item types, mutations, queries |
| `asset.graphql` | Asset types, mutations, queries |
| `schema.graphql` | Schema type references |
| `field.graphql` | Field types, type properties |
| `model.graphql` | Model types, mutations |
| `project.graphql` | Project types, mutations |
| `workspace.graphql` | Workspace types, mutations |
| `request.graphql` | Request types, mutations |
| `integration.graphql` | Integration types, mutations |
| `integration_webhook.graphql` | Webhook types, mutations |
| `thread.graphql` | Thread and comment types, mutations |
| `item_filter.graphql` | Filter condition types |
| `item_view.graphql` | View types, mutations |
| `group.graphql` | Group types, mutations |
| `job.graphql` | Job types |
| `user.graphql` | User types |
| `workspacesettings.graphql` | Workspace settings types |
