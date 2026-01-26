export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Any: { input: any; output: any };
  Cursor: { input: any; output: any };
  DateTime: { input: any; output: any };
  FileSize: { input: any; output: any };
  Lang: { input: any; output: any };
  URL: { input: any; output: any };
  Upload: { input: any; output: any };
};

export type ApiKeyPayload = {
  __typename?: "APIKeyPayload";
  apiKey: ProjectApiKey;
  public: PublicationSettings;
};

export type AddCommentInput = {
  content: Scalars["String"]["input"];
  threadId: Scalars["ID"]["input"];
};

export type AddIntegrationToWorkspaceInput = {
  integrationId: Scalars["ID"]["input"];
  role: Role;
  workspaceId: Scalars["ID"]["input"];
};

export type AddUsersToWorkspaceInput = {
  users: Array<MemberInput>;
  workspaceId: Scalars["ID"]["input"];
};

export type AddUsersToWorkspacePayload = {
  __typename?: "AddUsersToWorkspacePayload";
  workspace: Workspace;
};

export type AndCondition = {
  __typename?: "AndCondition";
  conditions: Array<Condition>;
};

export type AndConditionInput = {
  conditions: Array<ConditionInput>;
};

export type ApproveRequestInput = {
  requestId: Scalars["ID"]["input"];
};

export enum ArchiveExtractionStatus {
  Done = "DONE",
  Failed = "FAILED",
  InProgress = "IN_PROGRESS",
  Pending = "PENDING",
  Skipped = "SKIPPED",
}

export type Asset = Node & {
  __typename?: "Asset";
  archiveExtractionStatus?: Maybe<ArchiveExtractionStatus>;
  contentEncoding?: Maybe<Scalars["String"]["output"]>;
  contentType?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  createdBy: Operator;
  createdById: Scalars["ID"]["output"];
  createdByType: OperatorType;
  fileName: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  items?: Maybe<Array<AssetItem>>;
  previewType?: Maybe<PreviewType>;
  project: Project;
  projectId: Scalars["ID"]["output"];
  public: Scalars["Boolean"]["output"];
  size: Scalars["FileSize"]["output"];
  thread?: Maybe<Thread>;
  threadId?: Maybe<Scalars["ID"]["output"]>;
  url: Scalars["String"]["output"];
  uuid: Scalars["String"]["output"];
};

export type AssetConnection = {
  __typename?: "AssetConnection";
  edges: Array<AssetEdge>;
  nodes: Array<Maybe<Asset>>;
  pageInfo: PageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type AssetEdge = {
  __typename?: "AssetEdge";
  cursor: Scalars["Cursor"]["output"];
  node?: Maybe<Asset>;
};

export type AssetFile = {
  __typename?: "AssetFile";
  contentEncoding?: Maybe<Scalars["String"]["output"]>;
  contentType?: Maybe<Scalars["String"]["output"]>;
  filePaths?: Maybe<Array<Scalars["String"]["output"]>>;
  name: Scalars["String"]["output"];
  path: Scalars["String"]["output"];
  size: Scalars["FileSize"]["output"];
};

export type AssetItem = {
  __typename?: "AssetItem";
  itemId: Scalars["ID"]["output"];
  modelId: Scalars["ID"]["output"];
};

export type AssetQueryInput = {
  contentTypes?: InputMaybe<Array<ContentTypesEnum>>;
  keyword?: InputMaybe<Scalars["String"]["input"]>;
  project: Scalars["ID"]["input"];
};

export type AssetSort = {
  direction?: InputMaybe<SortDirection>;
  sortBy: AssetSortType;
};

export enum AssetSortType {
  Date = "DATE",
  Name = "NAME",
  Size = "SIZE",
}

export type BasicFieldCondition = {
  __typename?: "BasicFieldCondition";
  fieldId: FieldSelector;
  operator: BasicOperator;
  value: Scalars["Any"]["output"];
};

export type BasicFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: BasicOperator;
  value: Scalars["Any"]["input"];
};

export enum BasicOperator {
  Equals = "EQUALS",
  NotEquals = "NOT_EQUALS",
}

export type BoolFieldCondition = {
  __typename?: "BoolFieldCondition";
  fieldId: FieldSelector;
  operator: BoolOperator;
  value: Scalars["Boolean"]["output"];
};

export type BoolFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: BoolOperator;
  value: Scalars["Boolean"]["input"];
};

export enum BoolOperator {
  Equals = "EQUALS",
  NotEquals = "NOT_EQUALS",
}

export type CesiumResourceProps = {
  __typename?: "CesiumResourceProps";
  cesiumIonAccessToken: Scalars["String"]["output"];
  cesiumIonAssetId: Scalars["String"]["output"];
  image: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  url: Scalars["String"]["output"];
};

export type CesiumResourcePropsInput = {
  cesiumIonAccessToken: Scalars["String"]["input"];
  cesiumIonAssetId: Scalars["String"]["input"];
  image: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  url: Scalars["String"]["input"];
};

export type Column = {
  __typename?: "Column";
  field: FieldSelector;
  visible: Scalars["Boolean"]["output"];
};

export type ColumnSelectionInput = {
  field: FieldSelectorInput;
  visible: Scalars["Boolean"]["input"];
};

export type Comment = {
  __typename?: "Comment";
  author?: Maybe<Operator>;
  authorId: Scalars["ID"]["output"];
  authorType: OperatorType;
  content: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  threadId: Scalars["ID"]["output"];
  workspaceId: Scalars["ID"]["output"];
};

export type CommentPayload = {
  __typename?: "CommentPayload";
  comment: Comment;
  thread: Thread;
};

export type Condition =
  | AndCondition
  | BasicFieldCondition
  | BoolFieldCondition
  | MultipleFieldCondition
  | NullableFieldCondition
  | NumberFieldCondition
  | OrCondition
  | StringFieldCondition
  | TimeFieldCondition;

export type ConditionInput = {
  and?: InputMaybe<AndConditionInput>;
  basic?: InputMaybe<BasicFieldConditionInput>;
  bool?: InputMaybe<BoolFieldConditionInput>;
  multiple?: InputMaybe<MultipleFieldConditionInput>;
  nullable?: InputMaybe<NullableFieldConditionInput>;
  number?: InputMaybe<NumberFieldConditionInput>;
  or?: InputMaybe<OrConditionInput>;
  string?: InputMaybe<StringFieldConditionInput>;
  time?: InputMaybe<TimeFieldConditionInput>;
};

export enum ContentTypesEnum {
  Csv = "CSV",
  Geojson = "GEOJSON",
  Html = "HTML",
  Json = "JSON",
  Pdf = "PDF",
  Plain = "PLAIN",
  Xml = "XML",
}

export type CorrespondingFieldInput = {
  description: Scalars["String"]["input"];
  fieldId?: InputMaybe<Scalars["ID"]["input"]>;
  key: Scalars["String"]["input"];
  required: Scalars["Boolean"]["input"];
  title: Scalars["String"]["input"];
};

export type CreateApiKeyInput = {
  description: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  projectId: Scalars["ID"]["input"];
  publication: UpdatePublicationSettingsInput;
};

export type CreateAssetInput = {
  contentEncoding?: InputMaybe<Scalars["String"]["input"]>;
  file?: InputMaybe<Scalars["Upload"]["input"]>;
  projectId: Scalars["ID"]["input"];
  skipDecompression?: InputMaybe<Scalars["Boolean"]["input"]>;
  token?: InputMaybe<Scalars["String"]["input"]>;
  url?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateAssetPayload = {
  __typename?: "CreateAssetPayload";
  asset: Asset;
};

export type CreateAssetUploadInput = {
  contentEncoding?: InputMaybe<Scalars["String"]["input"]>;
  contentLength?: InputMaybe<Scalars["Int"]["input"]>;
  cursor?: InputMaybe<Scalars["String"]["input"]>;
  filename?: InputMaybe<Scalars["String"]["input"]>;
  projectId: Scalars["ID"]["input"];
};

export type CreateAssetUploadPayload = {
  __typename?: "CreateAssetUploadPayload";
  contentEncoding?: Maybe<Scalars["String"]["output"]>;
  contentLength: Scalars["Int"]["output"];
  contentType?: Maybe<Scalars["String"]["output"]>;
  next?: Maybe<Scalars["String"]["output"]>;
  token: Scalars["String"]["output"];
  url: Scalars["String"]["output"];
};

export type CreateFieldInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  groupId?: InputMaybe<Scalars["ID"]["input"]>;
  isTitle: Scalars["Boolean"]["input"];
  key: Scalars["String"]["input"];
  metadata?: InputMaybe<Scalars["Boolean"]["input"]>;
  modelId?: InputMaybe<Scalars["ID"]["input"]>;
  multiple: Scalars["Boolean"]["input"];
  required: Scalars["Boolean"]["input"];
  title: Scalars["String"]["input"];
  type: SchemaFieldType;
  typeProperty: SchemaFieldTypePropertyInput;
  unique: Scalars["Boolean"]["input"];
};

export type CreateGroupInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  key: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  projectId: Scalars["ID"]["input"];
};

export type CreateIntegrationInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  logoUrl: Scalars["URL"]["input"];
  name: Scalars["String"]["input"];
  type: IntegrationType;
};

export type CreateItemInput = {
  fields: Array<ItemFieldInput>;
  metadataId?: InputMaybe<Scalars["ID"]["input"]>;
  modelId: Scalars["ID"]["input"];
  originalId?: InputMaybe<Scalars["ID"]["input"]>;
  schemaId: Scalars["ID"]["input"];
};

export type CreateModelInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  projectId: Scalars["ID"]["input"];
};

export type CreateProjectInput = {
  alias?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  license?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  readme?: InputMaybe<Scalars["String"]["input"]>;
  requestRoles?: InputMaybe<Array<Role>>;
  visibility?: InputMaybe<ProjectVisibility>;
  workspaceId: Scalars["ID"]["input"];
};

export type CreateRequestInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  items: Array<RequestItemInput>;
  projectId: Scalars["ID"]["input"];
  reviewersId?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  state?: InputMaybe<RequestState>;
  title: Scalars["String"]["input"];
};

export type CreateThreadWithCommentInput = {
  content: Scalars["String"]["input"];
  resourceId: Scalars["ID"]["input"];
  resourceType: ResourceType;
  workspaceId: Scalars["ID"]["input"];
};

export type CreateViewInput = {
  columns?: InputMaybe<Array<ColumnSelectionInput>>;
  filter?: InputMaybe<ConditionInput>;
  modelId: Scalars["ID"]["input"];
  name: Scalars["String"]["input"];
  projectId: Scalars["ID"]["input"];
  sort?: InputMaybe<ItemSortInput>;
};

export type CreateWebhookInput = {
  active: Scalars["Boolean"]["input"];
  integrationId: Scalars["ID"]["input"];
  name: Scalars["String"]["input"];
  secret: Scalars["String"]["input"];
  trigger: WebhookTriggerInput;
  url: Scalars["URL"]["input"];
};

export type CreateWorkspaceInput = {
  name: Scalars["String"]["input"];
};

export type CreateWorkspacePayload = {
  __typename?: "CreateWorkspacePayload";
  workspace: Workspace;
};

export type DecompressAssetInput = {
  assetId: Scalars["ID"]["input"];
};

export type DecompressAssetPayload = {
  __typename?: "DecompressAssetPayload";
  asset: Asset;
};

export type DeleteApiKeyInput = {
  id: Scalars["ID"]["input"];
  projectId: Scalars["ID"]["input"];
};

export type DeleteApiKeyPayload = {
  __typename?: "DeleteAPIKeyPayload";
  apiKeyId: Scalars["ID"]["output"];
};

export type DeleteAssetInput = {
  assetId: Scalars["ID"]["input"];
};

export type DeleteAssetPayload = {
  __typename?: "DeleteAssetPayload";
  assetId: Scalars["ID"]["output"];
};

export type DeleteAssetsInput = {
  assetIds: Array<Scalars["ID"]["input"]>;
};

export type DeleteAssetsPayload = {
  __typename?: "DeleteAssetsPayload";
  assetIds?: Maybe<Array<Scalars["ID"]["output"]>>;
};

export type DeleteCommentInput = {
  commentId: Scalars["ID"]["input"];
  threadId: Scalars["ID"]["input"];
};

export type DeleteCommentPayload = {
  __typename?: "DeleteCommentPayload";
  commentId: Scalars["ID"]["output"];
  thread: Thread;
};

export type DeleteFieldInput = {
  fieldId: Scalars["ID"]["input"];
  groupId?: InputMaybe<Scalars["ID"]["input"]>;
  metadata?: InputMaybe<Scalars["Boolean"]["input"]>;
  modelId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteFieldPayload = {
  __typename?: "DeleteFieldPayload";
  fieldId: Scalars["ID"]["output"];
};

export type DeleteGroupInput = {
  groupId: Scalars["ID"]["input"];
};

export type DeleteGroupPayload = {
  __typename?: "DeleteGroupPayload";
  groupId: Scalars["ID"]["output"];
};

export type DeleteIntegrationInput = {
  integrationId: Scalars["ID"]["input"];
};

export type DeleteIntegrationPayload = {
  __typename?: "DeleteIntegrationPayload";
  integrationId: Scalars["ID"]["output"];
};

export type DeleteIntegrationsInput = {
  integrationIDs: Array<Scalars["ID"]["input"]>;
};

export type DeleteIntegrationsPayload = {
  __typename?: "DeleteIntegrationsPayload";
  integrationIDs?: Maybe<Array<Scalars["ID"]["output"]>>;
};

export type DeleteItemInput = {
  itemId: Scalars["ID"]["input"];
};

export type DeleteItemPayload = {
  __typename?: "DeleteItemPayload";
  itemId: Scalars["ID"]["output"];
};

export type DeleteItemsInput = {
  itemIds: Array<Scalars["ID"]["input"]>;
};

export type DeleteItemsPayload = {
  __typename?: "DeleteItemsPayload";
  itemIds: Array<Scalars["ID"]["output"]>;
};

export type DeleteMeInput = {
  userId: Scalars["ID"]["input"];
};

export type DeleteMePayload = {
  __typename?: "DeleteMePayload";
  userId: Scalars["ID"]["output"];
};

export type DeleteModelInput = {
  modelId: Scalars["ID"]["input"];
};

export type DeleteModelPayload = {
  __typename?: "DeleteModelPayload";
  modelId: Scalars["ID"]["output"];
};

export type DeleteProjectInput = {
  projectId: Scalars["ID"]["input"];
};

export type DeleteProjectPayload = {
  __typename?: "DeleteProjectPayload";
  projectId: Scalars["ID"]["output"];
};

export type DeleteRequestInput = {
  projectId: Scalars["ID"]["input"];
  requestsId: Array<Scalars["ID"]["input"]>;
};

export type DeleteRequestPayload = {
  __typename?: "DeleteRequestPayload";
  requests: Array<Scalars["ID"]["output"]>;
};

export type DeleteViewInput = {
  viewId: Scalars["ID"]["input"];
};

export type DeleteViewPayload = {
  __typename?: "DeleteViewPayload";
  viewId: Scalars["ID"]["output"];
};

export type DeleteWebhookInput = {
  integrationId: Scalars["ID"]["input"];
  webhookId: Scalars["ID"]["input"];
};

export type DeleteWebhookPayload = {
  __typename?: "DeleteWebhookPayload";
  webhookId: Scalars["ID"]["output"];
};

export type DeleteWorkspaceInput = {
  workspaceId: Scalars["ID"]["input"];
};

export type DeleteWorkspacePayload = {
  __typename?: "DeleteWorkspacePayload";
  workspaceId: Scalars["ID"]["output"];
};

export enum ExportFormat {
  Csv = "CSV",
  Geojson = "GEOJSON",
  Json = "JSON",
}

export type ExportModelInput = {
  format: ExportFormat;
  modelId: Scalars["ID"]["input"];
};

export type ExportModelPayload = {
  __typename?: "ExportModelPayload";
  modelId: Scalars["ID"]["output"];
  url: Scalars["URL"]["output"];
};

export type ExportModelSchemaInput = {
  modelId: Scalars["ID"]["input"];
};

export type ExportModelSchemaPayload = {
  __typename?: "ExportModelSchemaPayload";
  modelId: Scalars["ID"]["output"];
  url: Scalars["URL"]["output"];
};

export type FieldPayload = {
  __typename?: "FieldPayload";
  field: SchemaField;
};

export type FieldSelector = {
  __typename?: "FieldSelector";
  id?: Maybe<Scalars["ID"]["output"]>;
  type: FieldType;
};

export type FieldSelectorInput = {
  id?: InputMaybe<Scalars["ID"]["input"]>;
  type: FieldType;
};

export enum FieldType {
  CreationDate = "CREATION_DATE",
  CreationUser = "CREATION_USER",
  Field = "FIELD",
  Id = "ID",
  MetaField = "META_FIELD",
  ModificationDate = "MODIFICATION_DATE",
  ModificationUser = "MODIFICATION_USER",
  Status = "STATUS",
}

export type FieldsPayload = {
  __typename?: "FieldsPayload";
  fields: Array<SchemaField>;
};

export enum GeometryEditorSupportedType {
  Any = "ANY",
  Linestring = "LINESTRING",
  Point = "POINT",
  Polygon = "POLYGON",
}

export enum GeometryObjectSupportedType {
  Geometrycollection = "GEOMETRYCOLLECTION",
  Linestring = "LINESTRING",
  Multilinestring = "MULTILINESTRING",
  Multipoint = "MULTIPOINT",
  Multipolygon = "MULTIPOLYGON",
  Point = "POINT",
  Polygon = "POLYGON",
}

export type Group = Node & {
  __typename?: "Group";
  description: Scalars["String"]["output"];
  fields: Array<SchemaField>;
  id: Scalars["ID"]["output"];
  key: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  order: Scalars["Int"]["output"];
  project: Project;
  projectId: Scalars["ID"]["output"];
  schema: Schema;
  schemaId: Scalars["ID"]["output"];
};

export type GroupPayload = {
  __typename?: "GroupPayload";
  group: Group;
};

export type GroupsPayload = {
  __typename?: "GroupsPayload";
  groups: Array<Group>;
};

export type GuessSchemaField = {
  __typename?: "GuessSchemaField";
  key: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  type: Scalars["String"]["output"];
};

export type GuessSchemaFieldResult = {
  __typename?: "GuessSchemaFieldResult";
  fields: Array<GuessSchemaField>;
  total_count: Scalars["Int"]["output"];
};

export type GuessSchemaFieldsInput = {
  assetId: Scalars["ID"]["input"];
  modelId: Scalars["ID"]["input"];
};

export type ImportItemsInput = {
  file: Scalars["Upload"]["input"];
  geoField?: InputMaybe<Scalars["String"]["input"]>;
  modelId: Scalars["ID"]["input"];
};

export type ImportItemsPayload = {
  __typename?: "ImportItemsPayload";
  ignoredCount: Scalars["Int"]["output"];
  insertedCount: Scalars["Int"]["output"];
  modelId: Scalars["ID"]["output"];
  totalCount: Scalars["Int"]["output"];
  updatedCount: Scalars["Int"]["output"];
};

export type Integration = Node & {
  __typename?: "Integration";
  config?: Maybe<IntegrationConfig>;
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  developer: User;
  developerId: Scalars["ID"]["output"];
  iType: IntegrationType;
  id: Scalars["ID"]["output"];
  logoUrl: Scalars["URL"]["output"];
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type IntegrationConfig = {
  __typename?: "IntegrationConfig";
  token: Scalars["String"]["output"];
  webhooks: Array<Webhook>;
};

export type IntegrationPayload = {
  __typename?: "IntegrationPayload";
  integration: Integration;
};

export enum IntegrationType {
  Private = "Private",
  Public = "Public",
}

export type Item = Node & {
  __typename?: "Item";
  assets: Array<Maybe<Asset>>;
  createdAt: Scalars["DateTime"]["output"];
  createdBy?: Maybe<Operator>;
  fields: Array<ItemField>;
  id: Scalars["ID"]["output"];
  integrationId?: Maybe<Scalars["ID"]["output"]>;
  isMetadata: Scalars["Boolean"]["output"];
  metadata?: Maybe<Item>;
  metadataId?: Maybe<Scalars["ID"]["output"]>;
  model: Model;
  modelId: Scalars["ID"]["output"];
  original?: Maybe<Item>;
  originalId?: Maybe<Scalars["ID"]["output"]>;
  project: Project;
  projectId: Scalars["ID"]["output"];
  referencedItems?: Maybe<Array<Item>>;
  requests?: Maybe<Array<Request>>;
  schema: Schema;
  schemaId: Scalars["ID"]["output"];
  status: ItemStatus;
  thread?: Maybe<Thread>;
  threadId?: Maybe<Scalars["ID"]["output"]>;
  title?: Maybe<Scalars["String"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
  updatedBy?: Maybe<Operator>;
  updatedByIntegrationId?: Maybe<Scalars["ID"]["output"]>;
  updatedByUserId?: Maybe<Scalars["ID"]["output"]>;
  userId?: Maybe<Scalars["ID"]["output"]>;
  version: Scalars["String"]["output"];
};

export type ItemConnection = {
  __typename?: "ItemConnection";
  edges: Array<ItemEdge>;
  nodes: Array<Maybe<Item>>;
  pageInfo: PageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type ItemEdge = {
  __typename?: "ItemEdge";
  cursor: Scalars["Cursor"]["output"];
  node?: Maybe<Item>;
};

export type ItemField = {
  __typename?: "ItemField";
  itemGroupId?: Maybe<Scalars["ID"]["output"]>;
  schemaFieldId: Scalars["ID"]["output"];
  type: SchemaFieldType;
  value?: Maybe<Scalars["Any"]["output"]>;
};

export type ItemFieldInput = {
  itemGroupId?: InputMaybe<Scalars["ID"]["input"]>;
  schemaFieldId: Scalars["ID"]["input"];
  type: SchemaFieldType;
  value: Scalars["Any"]["input"];
};

export type ItemPayload = {
  __typename?: "ItemPayload";
  item: Item;
};

export type ItemQueryInput = {
  model: Scalars["ID"]["input"];
  project: Scalars["ID"]["input"];
  q?: InputMaybe<Scalars["String"]["input"]>;
  schema?: InputMaybe<Scalars["ID"]["input"]>;
};

export type ItemSort = {
  __typename?: "ItemSort";
  direction?: Maybe<SortDirection>;
  field: FieldSelector;
};

export type ItemSortInput = {
  direction?: InputMaybe<SortDirection>;
  field: FieldSelectorInput;
};

export enum ItemStatus {
  Draft = "DRAFT",
  Public = "PUBLIC",
  PublicDraft = "PUBLIC_DRAFT",
  PublicReview = "PUBLIC_REVIEW",
  Review = "REVIEW",
}

export type KeyAvailability = {
  __typename?: "KeyAvailability";
  available: Scalars["Boolean"]["output"];
  key: Scalars["String"]["output"];
};

export type Me = {
  __typename?: "Me";
  auths: Array<Scalars["String"]["output"]>;
  email: Scalars["String"]["output"];
  host?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  integrations: Array<Integration>;
  lang: Scalars["Lang"]["output"];
  myWorkspace?: Maybe<Workspace>;
  myWorkspaceId: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  profilePictureUrl?: Maybe<Scalars["String"]["output"]>;
  theme: Theme;
  workspaces: Array<Workspace>;
};

export type MemberInput = {
  role: Role;
  userId: Scalars["ID"]["input"];
};

export type Model = Node & {
  __typename?: "Model";
  createdAt: Scalars["DateTime"]["output"];
  description: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  key: Scalars["String"]["output"];
  metadataSchema?: Maybe<Schema>;
  metadataSchemaId?: Maybe<Scalars["ID"]["output"]>;
  name: Scalars["String"]["output"];
  order?: Maybe<Scalars["Int"]["output"]>;
  project: Project;
  projectId: Scalars["ID"]["output"];
  schema: Schema;
  schemaId: Scalars["ID"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type ModelConnection = {
  __typename?: "ModelConnection";
  edges: Array<ModelEdge>;
  nodes: Array<Maybe<Model>>;
  pageInfo: PageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type ModelEdge = {
  __typename?: "ModelEdge";
  cursor: Scalars["Cursor"]["output"];
  node?: Maybe<Model>;
};

export type ModelPayload = {
  __typename?: "ModelPayload";
  model: Model;
};

export type ModelsPayload = {
  __typename?: "ModelsPayload";
  models: Array<Model>;
};

export type MultipleFieldCondition = {
  __typename?: "MultipleFieldCondition";
  fieldId: FieldSelector;
  operator: MultipleOperator;
  value: Array<Scalars["Any"]["output"]>;
};

export type MultipleFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: MultipleOperator;
  value: Array<Scalars["Any"]["input"]>;
};

export enum MultipleOperator {
  IncludesAll = "INCLUDES_ALL",
  IncludesAny = "INCLUDES_ANY",
  NotIncludesAll = "NOT_INCLUDES_ALL",
  NotIncludesAny = "NOT_INCLUDES_ANY",
}

export type Mutation = {
  __typename?: "Mutation";
  addComment?: Maybe<CommentPayload>;
  addIntegrationToWorkspace?: Maybe<AddUsersToWorkspacePayload>;
  addUsersToWorkspace?: Maybe<AddUsersToWorkspacePayload>;
  approveRequest?: Maybe<RequestPayload>;
  createAPIKey?: Maybe<ApiKeyPayload>;
  createAsset?: Maybe<CreateAssetPayload>;
  createAssetUpload?: Maybe<CreateAssetUploadPayload>;
  createField?: Maybe<FieldPayload>;
  createFields?: Maybe<FieldsPayload>;
  createGroup?: Maybe<GroupPayload>;
  createIntegration?: Maybe<IntegrationPayload>;
  createItem?: Maybe<ItemPayload>;
  createModel?: Maybe<ModelPayload>;
  createProject?: Maybe<ProjectPayload>;
  createRequest?: Maybe<RequestPayload>;
  createThreadWithComment?: Maybe<CommentPayload>;
  createView?: Maybe<ViewPayload>;
  createWebhook?: Maybe<WebhookPayload>;
  createWorkspace?: Maybe<CreateWorkspacePayload>;
  decompressAsset?: Maybe<DecompressAssetPayload>;
  deleteAPIKey?: Maybe<DeleteApiKeyPayload>;
  deleteAsset?: Maybe<DeleteAssetPayload>;
  deleteAssets?: Maybe<DeleteAssetsPayload>;
  deleteComment?: Maybe<DeleteCommentPayload>;
  deleteField?: Maybe<DeleteFieldPayload>;
  deleteGroup?: Maybe<DeleteGroupPayload>;
  deleteIntegration?: Maybe<DeleteIntegrationPayload>;
  deleteIntegrations?: Maybe<DeleteIntegrationsPayload>;
  deleteItem?: Maybe<DeleteItemPayload>;
  deleteItems?: Maybe<DeleteItemsPayload>;
  deleteMe?: Maybe<DeleteMePayload>;
  deleteModel?: Maybe<DeleteModelPayload>;
  deleteProject?: Maybe<DeleteProjectPayload>;
  deleteRequest?: Maybe<DeleteRequestPayload>;
  deleteView?: Maybe<DeleteViewPayload>;
  deleteWebhook?: Maybe<DeleteWebhookPayload>;
  deleteWorkspace?: Maybe<DeleteWorkspacePayload>;
  exportModel?: Maybe<ExportModelPayload>;
  exportModelSchema?: Maybe<ExportModelSchemaPayload>;
  importItems?: Maybe<ImportItemsPayload>;
  publishItem?: Maybe<PublishItemPayload>;
  regenerateAPIKey?: Maybe<ApiKeyPayload>;
  regenerateIntegrationToken?: Maybe<IntegrationPayload>;
  removeIntegrationFromWorkspace?: Maybe<RemoveIntegrationFromWorkspacePayload>;
  removeIntegrationsFromWorkspace?: Maybe<RemoveIntegrationsFromWorkspacePayload>;
  removeMultipleMembersFromWorkspace?: Maybe<RemoveMultipleMembersFromWorkspacePayload>;
  removeMyAuth?: Maybe<UpdateMePayload>;
  unpublishItem?: Maybe<UnpublishItemPayload>;
  updateAPIKey?: Maybe<ApiKeyPayload>;
  updateAsset?: Maybe<UpdateAssetPayload>;
  updateComment?: Maybe<CommentPayload>;
  updateField?: Maybe<FieldPayload>;
  updateFields?: Maybe<FieldsPayload>;
  updateGroup?: Maybe<GroupPayload>;
  updateGroupsOrder?: Maybe<GroupsPayload>;
  updateIntegration?: Maybe<IntegrationPayload>;
  updateIntegrationOfWorkspace?: Maybe<UpdateMemberOfWorkspacePayload>;
  updateItem?: Maybe<ItemPayload>;
  updateMe?: Maybe<UpdateMePayload>;
  updateModel?: Maybe<ModelPayload>;
  updateModelsOrder?: Maybe<ModelsPayload>;
  updateProject?: Maybe<ProjectPayload>;
  updateRequest?: Maybe<RequestPayload>;
  updateUserOfWorkspace?: Maybe<UpdateMemberOfWorkspacePayload>;
  updateView?: Maybe<ViewPayload>;
  updateViewsOrder?: Maybe<ViewsPayload>;
  updateWebhook?: Maybe<WebhookPayload>;
  updateWorkspace?: Maybe<UpdateWorkspacePayload>;
  updateWorkspaceSettings?: Maybe<UpdateWorkspaceSettingsPayload>;
};

export type MutationAddCommentArgs = {
  input: AddCommentInput;
};

export type MutationAddIntegrationToWorkspaceArgs = {
  input: AddIntegrationToWorkspaceInput;
};

export type MutationAddUsersToWorkspaceArgs = {
  input: AddUsersToWorkspaceInput;
};

export type MutationApproveRequestArgs = {
  input: ApproveRequestInput;
};

export type MutationCreateApiKeyArgs = {
  input: CreateApiKeyInput;
};

export type MutationCreateAssetArgs = {
  input: CreateAssetInput;
};

export type MutationCreateAssetUploadArgs = {
  input: CreateAssetUploadInput;
};

export type MutationCreateFieldArgs = {
  input: CreateFieldInput;
};

export type MutationCreateFieldsArgs = {
  input: Array<CreateFieldInput>;
};

export type MutationCreateGroupArgs = {
  input: CreateGroupInput;
};

export type MutationCreateIntegrationArgs = {
  input: CreateIntegrationInput;
};

export type MutationCreateItemArgs = {
  input: CreateItemInput;
};

export type MutationCreateModelArgs = {
  input: CreateModelInput;
};

export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};

export type MutationCreateRequestArgs = {
  input: CreateRequestInput;
};

export type MutationCreateThreadWithCommentArgs = {
  input: CreateThreadWithCommentInput;
};

export type MutationCreateViewArgs = {
  input: CreateViewInput;
};

export type MutationCreateWebhookArgs = {
  input: CreateWebhookInput;
};

export type MutationCreateWorkspaceArgs = {
  input: CreateWorkspaceInput;
};

export type MutationDecompressAssetArgs = {
  input: DecompressAssetInput;
};

export type MutationDeleteApiKeyArgs = {
  input: DeleteApiKeyInput;
};

export type MutationDeleteAssetArgs = {
  input: DeleteAssetInput;
};

export type MutationDeleteAssetsArgs = {
  input: DeleteAssetsInput;
};

export type MutationDeleteCommentArgs = {
  input: DeleteCommentInput;
};

export type MutationDeleteFieldArgs = {
  input: DeleteFieldInput;
};

export type MutationDeleteGroupArgs = {
  input: DeleteGroupInput;
};

export type MutationDeleteIntegrationArgs = {
  input: DeleteIntegrationInput;
};

export type MutationDeleteIntegrationsArgs = {
  input: DeleteIntegrationsInput;
};

export type MutationDeleteItemArgs = {
  input: DeleteItemInput;
};

export type MutationDeleteItemsArgs = {
  input: DeleteItemsInput;
};

export type MutationDeleteMeArgs = {
  input: DeleteMeInput;
};

export type MutationDeleteModelArgs = {
  input: DeleteModelInput;
};

export type MutationDeleteProjectArgs = {
  input: DeleteProjectInput;
};

export type MutationDeleteRequestArgs = {
  input: DeleteRequestInput;
};

export type MutationDeleteViewArgs = {
  input: DeleteViewInput;
};

export type MutationDeleteWebhookArgs = {
  input: DeleteWebhookInput;
};

export type MutationDeleteWorkspaceArgs = {
  input: DeleteWorkspaceInput;
};

export type MutationExportModelArgs = {
  input: ExportModelInput;
};

export type MutationExportModelSchemaArgs = {
  input: ExportModelSchemaInput;
};

export type MutationImportItemsArgs = {
  input: ImportItemsInput;
};

export type MutationPublishItemArgs = {
  input: PublishItemInput;
};

export type MutationRegenerateApiKeyArgs = {
  input: RegenerateApiKeyInput;
};

export type MutationRegenerateIntegrationTokenArgs = {
  input: RegenerateIntegrationTokenInput;
};

export type MutationRemoveIntegrationFromWorkspaceArgs = {
  input: RemoveIntegrationFromWorkspaceInput;
};

export type MutationRemoveIntegrationsFromWorkspaceArgs = {
  input: RemoveIntegrationsFromWorkspaceInput;
};

export type MutationRemoveMultipleMembersFromWorkspaceArgs = {
  input: RemoveMultipleMembersFromWorkspaceInput;
};

export type MutationRemoveMyAuthArgs = {
  input: RemoveMyAuthInput;
};

export type MutationUnpublishItemArgs = {
  input: UnpublishItemInput;
};

export type MutationUpdateApiKeyArgs = {
  input: UpdateApiKeyInput;
};

export type MutationUpdateAssetArgs = {
  input: UpdateAssetInput;
};

export type MutationUpdateCommentArgs = {
  input: UpdateCommentInput;
};

export type MutationUpdateFieldArgs = {
  input: UpdateFieldInput;
};

export type MutationUpdateFieldsArgs = {
  input: Array<UpdateFieldInput>;
};

export type MutationUpdateGroupArgs = {
  input: UpdateGroupInput;
};

export type MutationUpdateGroupsOrderArgs = {
  input: UpdateGroupsOrderInput;
};

export type MutationUpdateIntegrationArgs = {
  input: UpdateIntegrationInput;
};

export type MutationUpdateIntegrationOfWorkspaceArgs = {
  input: UpdateIntegrationOfWorkspaceInput;
};

export type MutationUpdateItemArgs = {
  input: UpdateItemInput;
};

export type MutationUpdateMeArgs = {
  input: UpdateMeInput;
};

export type MutationUpdateModelArgs = {
  input: UpdateModelInput;
};

export type MutationUpdateModelsOrderArgs = {
  input: UpdateModelsOrderInput;
};

export type MutationUpdateProjectArgs = {
  input: UpdateProjectInput;
};

export type MutationUpdateRequestArgs = {
  input: UpdateRequestInput;
};

export type MutationUpdateUserOfWorkspaceArgs = {
  input: UpdateUserOfWorkspaceInput;
};

export type MutationUpdateViewArgs = {
  input: UpdateViewInput;
};

export type MutationUpdateViewsOrderArgs = {
  input: UpdateViewsOrderInput;
};

export type MutationUpdateWebhookArgs = {
  input: UpdateWebhookInput;
};

export type MutationUpdateWorkspaceArgs = {
  input: UpdateWorkspaceInput;
};

export type MutationUpdateWorkspaceSettingsArgs = {
  input: UpdateWorkspaceSettingsInput;
};

export type Node = {
  id: Scalars["ID"]["output"];
};

export enum NodeType {
  Asset = "ASSET",
  Group = "Group",
  Integration = "Integration",
  Item = "Item",
  Model = "Model",
  Project = "PROJECT",
  Request = "REQUEST",
  Schema = "Schema",
  User = "USER",
  View = "View",
  Workspace = "WORKSPACE",
  WorkspaceSettings = "WorkspaceSettings",
}

export type NullableFieldCondition = {
  __typename?: "NullableFieldCondition";
  fieldId: FieldSelector;
  operator: NullableOperator;
};

export type NullableFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: NullableOperator;
};

export enum NullableOperator {
  Empty = "EMPTY",
  NotEmpty = "NOT_EMPTY",
}

export type NumberFieldCondition = {
  __typename?: "NumberFieldCondition";
  fieldId: FieldSelector;
  operator: NumberOperator;
  value: Scalars["Float"]["output"];
};

export type NumberFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: NumberOperator;
  value: Scalars["Float"]["input"];
};

export enum NumberOperator {
  GreaterThan = "GREATER_THAN",
  GreaterThanOrEqualTo = "GREATER_THAN_OR_EQUAL_TO",
  LessThan = "LESS_THAN",
  LessThanOrEqualTo = "LESS_THAN_OR_EQUAL_TO",
}

export type Operator = Integration | User;

export type OperatorInput = {
  basic?: InputMaybe<BasicOperator>;
  bool?: InputMaybe<BoolOperator>;
  nullable?: InputMaybe<NullableOperator>;
  number?: InputMaybe<NumberOperator>;
  string?: InputMaybe<StringOperator>;
  time?: InputMaybe<TimeOperator>;
};

export enum OperatorType {
  Integration = "Integration",
  User = "User",
}

export type OrCondition = {
  __typename?: "OrCondition";
  conditions: Array<Condition>;
};

export type OrConditionInput = {
  conditions: Array<ConditionInput>;
};

export type PageInfo = {
  __typename?: "PageInfo";
  endCursor?: Maybe<Scalars["Cursor"]["output"]>;
  hasNextPage: Scalars["Boolean"]["output"];
  hasPreviousPage: Scalars["Boolean"]["output"];
  startCursor?: Maybe<Scalars["Cursor"]["output"]>;
};

export type Pagination = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

export enum PreviewType {
  Csv = "CSV",
  Geo = "GEO",
  Geo_3DTiles = "GEO_3D_TILES",
  GeoMvt = "GEO_MVT",
  Image = "IMAGE",
  ImageSvg = "IMAGE_SVG",
  Model_3D = "MODEL_3D",
  Unknown = "UNKNOWN",
}

export type Project = Node & {
  __typename?: "Project";
  accessibility: ProjectAccessibility;
  alias: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  description: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  license: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  readme: Scalars["String"]["output"];
  requestRoles?: Maybe<Array<Role>>;
  updatedAt: Scalars["DateTime"]["output"];
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars["ID"]["output"];
};

export type ProjectApiKey = {
  __typename?: "ProjectAPIKey";
  description: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  key: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  publication: PublicationSettings;
};

export type ProjectAccessibility = {
  __typename?: "ProjectAccessibility";
  apiKeys?: Maybe<Array<ProjectApiKey>>;
  publication?: Maybe<PublicationSettings>;
  visibility: ProjectVisibility;
};

export type ProjectAliasAvailability = {
  __typename?: "ProjectAliasAvailability";
  alias: Scalars["String"]["output"];
  available: Scalars["Boolean"]["output"];
};

export type ProjectConnection = {
  __typename?: "ProjectConnection";
  edges: Array<ProjectEdge>;
  nodes: Array<Maybe<Project>>;
  pageInfo: PageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type ProjectEdge = {
  __typename?: "ProjectEdge";
  cursor: Scalars["Cursor"]["output"];
  node?: Maybe<Project>;
};

export type ProjectPayload = {
  __typename?: "ProjectPayload";
  project: Project;
};

export enum ProjectVisibility {
  Private = "PRIVATE",
  Public = "PUBLIC",
}

export type PublicationSettings = {
  __typename?: "PublicationSettings";
  publicAssets: Scalars["Boolean"]["output"];
  publicModels: Array<Scalars["ID"]["output"]>;
};

export type PublishItemInput = {
  itemIds: Array<Scalars["ID"]["input"]>;
};

export type PublishItemPayload = {
  __typename?: "PublishItemPayload";
  items: Array<Item>;
};

export type Query = {
  __typename?: "Query";
  assetFile: AssetFile;
  assets: AssetConnection;
  checkGroupKeyAvailability: KeyAvailability;
  checkModelKeyAvailability: KeyAvailability;
  checkProjectAlias: ProjectAliasAvailability;
  checkWorkspaceProjectLimits: WorkspaceProjectLimits;
  groups: Array<Maybe<Group>>;
  guessSchemaFields: GuessSchemaFieldResult;
  isItemReferenced: Scalars["Boolean"]["output"];
  me?: Maybe<Me>;
  models: ModelConnection;
  modelsByGroup: Array<Maybe<Model>>;
  node?: Maybe<Node>;
  nodes: Array<Maybe<Node>>;
  projects: ProjectConnection;
  requests: RequestConnection;
  searchItem: ItemConnection;
  userByNameOrEmail?: Maybe<User>;
  userSearch: Array<User>;
  versionsByItem: Array<VersionedItem>;
  view: Array<View>;
};

export type QueryAssetFileArgs = {
  assetId: Scalars["ID"]["input"];
};

export type QueryAssetsArgs = {
  input: SearchAssetsInput;
};

export type QueryCheckGroupKeyAvailabilityArgs = {
  key: Scalars["String"]["input"];
  projectId: Scalars["ID"]["input"];
};

export type QueryCheckModelKeyAvailabilityArgs = {
  key: Scalars["String"]["input"];
  projectId: Scalars["ID"]["input"];
};

export type QueryCheckProjectAliasArgs = {
  alias: Scalars["String"]["input"];
  workspaceId: Scalars["ID"]["input"];
};

export type QueryCheckWorkspaceProjectLimitsArgs = {
  workspaceId: Scalars["ID"]["input"];
};

export type QueryGroupsArgs = {
  modelID?: InputMaybe<Scalars["ID"]["input"]>;
  projectId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryGuessSchemaFieldsArgs = {
  input: GuessSchemaFieldsInput;
};

export type QueryIsItemReferencedArgs = {
  correspondingFieldId: Scalars["ID"]["input"];
  itemId: Scalars["ID"]["input"];
};

export type QueryModelsArgs = {
  keyword?: InputMaybe<Scalars["String"]["input"]>;
  pagination?: InputMaybe<Pagination>;
  projectId: Scalars["ID"]["input"];
  sort?: InputMaybe<Sort>;
};

export type QueryModelsByGroupArgs = {
  groupId: Scalars["ID"]["input"];
};

export type QueryNodeArgs = {
  id: Scalars["ID"]["input"];
  type: NodeType;
};

export type QueryNodesArgs = {
  id: Array<Scalars["ID"]["input"]>;
  type: NodeType;
};

export type QueryProjectsArgs = {
  keyword?: InputMaybe<Scalars["String"]["input"]>;
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<Sort>;
  workspaceId: Scalars["ID"]["input"];
};

export type QueryRequestsArgs = {
  createdBy?: InputMaybe<Scalars["ID"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  pagination?: InputMaybe<Pagination>;
  projectId: Scalars["ID"]["input"];
  reviewer?: InputMaybe<Scalars["ID"]["input"]>;
  sort?: InputMaybe<Sort>;
  state?: InputMaybe<Array<RequestState>>;
};

export type QuerySearchItemArgs = {
  input: SearchItemInput;
};

export type QueryUserByNameOrEmailArgs = {
  nameOrEmail: Scalars["String"]["input"];
};

export type QueryUserSearchArgs = {
  keyword: Scalars["String"]["input"];
};

export type QueryVersionsByItemArgs = {
  itemId: Scalars["ID"]["input"];
};

export type QueryViewArgs = {
  modelId: Scalars["ID"]["input"];
};

export type RegenerateApiKeyInput = {
  id: Scalars["ID"]["input"];
  projectId: Scalars["ID"]["input"];
};

export type RegenerateIntegrationTokenInput = {
  integrationId: Scalars["ID"]["input"];
};

export type RemoveIntegrationFromWorkspaceInput = {
  integrationId: Scalars["ID"]["input"];
  workspaceId: Scalars["ID"]["input"];
};

export type RemoveIntegrationFromWorkspacePayload = {
  __typename?: "RemoveIntegrationFromWorkspacePayload";
  workspace: Workspace;
};

export type RemoveIntegrationsFromWorkspaceInput = {
  integrationIds: Array<Scalars["ID"]["input"]>;
  workspaceId: Scalars["ID"]["input"];
};

export type RemoveIntegrationsFromWorkspacePayload = {
  __typename?: "RemoveIntegrationsFromWorkspacePayload";
  workspace: Workspace;
};

export type RemoveMultipleMembersFromWorkspaceInput = {
  userIds: Array<Scalars["ID"]["input"]>;
  workspaceId: Scalars["ID"]["input"];
};

export type RemoveMultipleMembersFromWorkspacePayload = {
  __typename?: "RemoveMultipleMembersFromWorkspacePayload";
  workspace: Workspace;
};

export type RemoveMyAuthInput = {
  auth: Scalars["String"]["input"];
};

export type Request = Node & {
  __typename?: "Request";
  approvedAt?: Maybe<Scalars["DateTime"]["output"]>;
  closedAt?: Maybe<Scalars["DateTime"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  createdBy?: Maybe<User>;
  createdById: Scalars["ID"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  items: Array<RequestItem>;
  project?: Maybe<Project>;
  projectId: Scalars["ID"]["output"];
  reviewers: Array<User>;
  reviewersId: Array<Scalars["ID"]["output"]>;
  state: RequestState;
  thread?: Maybe<Thread>;
  threadId?: Maybe<Scalars["ID"]["output"]>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars["ID"]["output"];
};

export type RequestConnection = {
  __typename?: "RequestConnection";
  edges: Array<RequestEdge>;
  nodes: Array<Maybe<Request>>;
  pageInfo: PageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type RequestEdge = {
  __typename?: "RequestEdge";
  cursor: Scalars["Cursor"]["output"];
  node?: Maybe<Request>;
};

export type RequestItem = {
  __typename?: "RequestItem";
  item?: Maybe<VersionedItem>;
  itemId: Scalars["ID"]["output"];
  ref?: Maybe<Scalars["String"]["output"]>;
  version?: Maybe<Scalars["String"]["output"]>;
};

export type RequestItemInput = {
  itemId: Scalars["ID"]["input"];
  version?: InputMaybe<Scalars["String"]["input"]>;
};

export type RequestPayload = {
  __typename?: "RequestPayload";
  request: Request;
};

export enum RequestState {
  Approved = "APPROVED",
  Closed = "CLOSED",
  Draft = "DRAFT",
  Waiting = "WAITING",
}

export type Resource = TerrainResource | TileResource;

export type ResourceInput = {
  terrain?: InputMaybe<TerrainResourceInput>;
  tile?: InputMaybe<TileResourceInput>;
};

export type ResourceList = {
  __typename?: "ResourceList";
  enabled?: Maybe<Scalars["Boolean"]["output"]>;
  resources: Array<Resource>;
  selectedResource?: Maybe<Scalars["ID"]["output"]>;
};

export enum ResourceType {
  Asset = "ASSET",
  Item = "ITEM",
  Request = "REQUEST",
}

export type ResourcesListInput = {
  enabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  resources: Array<ResourceInput>;
  selectedResource?: InputMaybe<Scalars["ID"]["input"]>;
};

export enum Role {
  Maintainer = "MAINTAINER",
  Owner = "OWNER",
  Reader = "READER",
  Writer = "WRITER",
}

export type Schema = Node & {
  __typename?: "Schema";
  fields: Array<SchemaField>;
  id: Scalars["ID"]["output"];
  project: Project;
  projectId: Scalars["ID"]["output"];
  titleField?: Maybe<SchemaField>;
  titleFieldId?: Maybe<Scalars["ID"]["output"]>;
};

export type SchemaField = {
  __typename?: "SchemaField";
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  group?: Maybe<Group>;
  groupId?: Maybe<Scalars["ID"]["output"]>;
  id: Scalars["ID"]["output"];
  isTitle: Scalars["Boolean"]["output"];
  key: Scalars["String"]["output"];
  model?: Maybe<Model>;
  modelId?: Maybe<Scalars["ID"]["output"]>;
  multiple: Scalars["Boolean"]["output"];
  order?: Maybe<Scalars["Int"]["output"]>;
  required: Scalars["Boolean"]["output"];
  title: Scalars["String"]["output"];
  type: SchemaFieldType;
  typeProperty?: Maybe<SchemaFieldTypeProperty>;
  unique: Scalars["Boolean"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type SchemaFieldAsset = {
  __typename?: "SchemaFieldAsset";
  defaultValue?: Maybe<Scalars["Any"]["output"]>;
};

export type SchemaFieldAssetInput = {
  defaultValue?: InputMaybe<Scalars["Any"]["input"]>;
};

export type SchemaFieldBool = {
  __typename?: "SchemaFieldBool";
  defaultValue?: Maybe<Scalars["Any"]["output"]>;
};

export type SchemaFieldBoolInput = {
  defaultValue?: InputMaybe<Scalars["Any"]["input"]>;
};

export type SchemaFieldCheckbox = {
  __typename?: "SchemaFieldCheckbox";
  defaultValue?: Maybe<Scalars["Any"]["output"]>;
};

export type SchemaFieldCheckboxInput = {
  defaultValue?: InputMaybe<Scalars["Any"]["input"]>;
};

export type SchemaFieldDate = {
  __typename?: "SchemaFieldDate";
  defaultValue?: Maybe<Scalars["Any"]["output"]>;
};

export type SchemaFieldDateInput = {
  defaultValue?: InputMaybe<Scalars["Any"]["input"]>;
};

export type SchemaFieldGeometryEditor = {
  __typename?: "SchemaFieldGeometryEditor";
  defaultValue?: Maybe<Scalars["Any"]["output"]>;
  supportedTypes: Array<GeometryEditorSupportedType>;
};

export type SchemaFieldGeometryEditorInput = {
  defaultValue?: InputMaybe<Scalars["Any"]["input"]>;
  supportedTypes: Array<GeometryEditorSupportedType>;
};

export type SchemaFieldGeometryObject = {
  __typename?: "SchemaFieldGeometryObject";
  defaultValue?: Maybe<Scalars["Any"]["output"]>;
  supportedTypes: Array<GeometryObjectSupportedType>;
};

export type SchemaFieldGeometryObjectInput = {
  defaultValue?: InputMaybe<Scalars["Any"]["input"]>;
  supportedTypes: Array<GeometryObjectSupportedType>;
};

export type SchemaFieldGroup = {
  __typename?: "SchemaFieldGroup";
  groupId: Scalars["ID"]["output"];
};

export type SchemaFieldGroupInput = {
  groupId: Scalars["ID"]["input"];
};

export type SchemaFieldInteger = {
  __typename?: "SchemaFieldInteger";
  defaultValue?: Maybe<Scalars["Any"]["output"]>;
  max?: Maybe<Scalars["Int"]["output"]>;
  min?: Maybe<Scalars["Int"]["output"]>;
};

export type SchemaFieldIntegerInput = {
  defaultValue?: InputMaybe<Scalars["Any"]["input"]>;
  max?: InputMaybe<Scalars["Int"]["input"]>;
  min?: InputMaybe<Scalars["Int"]["input"]>;
};

export type SchemaFieldLineStringInput = {
  defaultValue?: InputMaybe<Scalars["Any"]["input"]>;
};

export type SchemaFieldMarkdown = {
  __typename?: "SchemaFieldMarkdown";
  defaultValue?: Maybe<Scalars["Any"]["output"]>;
  maxLength?: Maybe<Scalars["Int"]["output"]>;
};

export type SchemaFieldNumber = {
  __typename?: "SchemaFieldNumber";
  defaultValue?: Maybe<Scalars["Any"]["output"]>;
  max?: Maybe<Scalars["Float"]["output"]>;
  min?: Maybe<Scalars["Float"]["output"]>;
};

export type SchemaFieldNumberInput = {
  defaultValue?: InputMaybe<Scalars["Any"]["input"]>;
  max?: InputMaybe<Scalars["Float"]["input"]>;
  min?: InputMaybe<Scalars["Float"]["input"]>;
};

export type SchemaFieldReference = {
  __typename?: "SchemaFieldReference";
  correspondingField?: Maybe<SchemaField>;
  correspondingFieldId?: Maybe<Scalars["ID"]["output"]>;
  modelId: Scalars["ID"]["output"];
  schema: Schema;
  schemaId: Scalars["ID"]["output"];
};

export type SchemaFieldReferenceInput = {
  correspondingField?: InputMaybe<CorrespondingFieldInput>;
  modelId: Scalars["ID"]["input"];
  schemaId: Scalars["ID"]["input"];
};

export type SchemaFieldRichText = {
  __typename?: "SchemaFieldRichText";
  defaultValue?: Maybe<Scalars["Any"]["output"]>;
  maxLength?: Maybe<Scalars["Int"]["output"]>;
};

export type SchemaFieldRichTextInput = {
  defaultValue?: InputMaybe<Scalars["Any"]["input"]>;
  maxLength?: InputMaybe<Scalars["Int"]["input"]>;
};

export type SchemaFieldSelect = {
  __typename?: "SchemaFieldSelect";
  defaultValue?: Maybe<Scalars["Any"]["output"]>;
  values: Array<Scalars["String"]["output"]>;
};

export type SchemaFieldSelectInput = {
  defaultValue?: InputMaybe<Scalars["Any"]["input"]>;
  values: Array<Scalars["String"]["input"]>;
};

export type SchemaFieldTag = {
  __typename?: "SchemaFieldTag";
  defaultValue?: Maybe<Scalars["Any"]["output"]>;
  tags: Array<SchemaFieldTagValue>;
};

export enum SchemaFieldTagColor {
  Blue = "BLUE",
  Cyan = "CYAN",
  Geekblue = "GEEKBLUE",
  Gold = "GOLD",
  Green = "GREEN",
  Lime = "LIME",
  Magenta = "MAGENTA",
  Orange = "ORANGE",
  Purple = "PURPLE",
  Red = "RED",
  Volcano = "VOLCANO",
}

export type SchemaFieldTagInput = {
  defaultValue?: InputMaybe<Scalars["Any"]["input"]>;
  tags: Array<SchemaFieldTagValueInput>;
};

export type SchemaFieldTagValue = {
  __typename?: "SchemaFieldTagValue";
  color: SchemaFieldTagColor;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
};

export type SchemaFieldTagValueInput = {
  color?: InputMaybe<SchemaFieldTagColor>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type SchemaFieldText = {
  __typename?: "SchemaFieldText";
  defaultValue?: Maybe<Scalars["Any"]["output"]>;
  maxLength?: Maybe<Scalars["Int"]["output"]>;
};

export type SchemaFieldTextArea = {
  __typename?: "SchemaFieldTextArea";
  defaultValue?: Maybe<Scalars["Any"]["output"]>;
  maxLength?: Maybe<Scalars["Int"]["output"]>;
};

export type SchemaFieldTextAreaInput = {
  defaultValue?: InputMaybe<Scalars["Any"]["input"]>;
  maxLength?: InputMaybe<Scalars["Int"]["input"]>;
};

export type SchemaFieldTextInput = {
  defaultValue?: InputMaybe<Scalars["Any"]["input"]>;
  maxLength?: InputMaybe<Scalars["Int"]["input"]>;
};

export enum SchemaFieldType {
  Asset = "Asset",
  Bool = "Bool",
  Checkbox = "Checkbox",
  Date = "Date",
  GeometryEditor = "GeometryEditor",
  GeometryObject = "GeometryObject",
  Group = "Group",
  Integer = "Integer",
  MarkdownText = "MarkdownText",
  Number = "Number",
  Reference = "Reference",
  RichText = "RichText",
  Select = "Select",
  Tag = "Tag",
  Text = "Text",
  TextArea = "TextArea",
  Url = "URL",
}

export type SchemaFieldTypeProperty =
  | SchemaFieldAsset
  | SchemaFieldBool
  | SchemaFieldCheckbox
  | SchemaFieldDate
  | SchemaFieldGeometryEditor
  | SchemaFieldGeometryObject
  | SchemaFieldGroup
  | SchemaFieldInteger
  | SchemaFieldMarkdown
  | SchemaFieldNumber
  | SchemaFieldReference
  | SchemaFieldRichText
  | SchemaFieldSelect
  | SchemaFieldTag
  | SchemaFieldText
  | SchemaFieldTextArea
  | SchemaFieldUrl;

export type SchemaFieldTypePropertyInput = {
  asset?: InputMaybe<SchemaFieldAssetInput>;
  bool?: InputMaybe<SchemaFieldBoolInput>;
  checkbox?: InputMaybe<SchemaFieldCheckboxInput>;
  date?: InputMaybe<SchemaFieldDateInput>;
  geometryEditor?: InputMaybe<SchemaFieldGeometryEditorInput>;
  geometryObject?: InputMaybe<SchemaFieldGeometryObjectInput>;
  group?: InputMaybe<SchemaFieldGroupInput>;
  integer?: InputMaybe<SchemaFieldIntegerInput>;
  markdownText?: InputMaybe<SchemaMarkdownTextInput>;
  number?: InputMaybe<SchemaFieldNumberInput>;
  reference?: InputMaybe<SchemaFieldReferenceInput>;
  richText?: InputMaybe<SchemaFieldRichTextInput>;
  select?: InputMaybe<SchemaFieldSelectInput>;
  tag?: InputMaybe<SchemaFieldTagInput>;
  text?: InputMaybe<SchemaFieldTextInput>;
  textArea?: InputMaybe<SchemaFieldTextAreaInput>;
  url?: InputMaybe<SchemaFieldUrlInput>;
};

export type SchemaFieldUrl = {
  __typename?: "SchemaFieldURL";
  defaultValue?: Maybe<Scalars["Any"]["output"]>;
};

export type SchemaFieldUrlInput = {
  defaultValue?: InputMaybe<Scalars["Any"]["input"]>;
};

export type SchemaMarkdownTextInput = {
  defaultValue?: InputMaybe<Scalars["Any"]["input"]>;
  maxLength?: InputMaybe<Scalars["Int"]["input"]>;
};

export type SearchAssetsInput = {
  pagination?: InputMaybe<Pagination>;
  query: AssetQueryInput;
  sort?: InputMaybe<AssetSort>;
};

export type SearchItemInput = {
  filter?: InputMaybe<ConditionInput>;
  pagination?: InputMaybe<Pagination>;
  query: ItemQueryInput;
  sort?: InputMaybe<ItemSortInput>;
};

export type Sort = {
  key: Scalars["String"]["input"];
  reverted?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export enum SortDirection {
  Asc = "ASC",
  Desc = "DESC",
}

export type StringFieldCondition = {
  __typename?: "StringFieldCondition";
  fieldId: FieldSelector;
  operator: StringOperator;
  value: Scalars["String"]["output"];
};

export type StringFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: StringOperator;
  value: Scalars["String"]["input"];
};

export enum StringOperator {
  Contains = "CONTAINS",
  EndsWith = "ENDS_WITH",
  NotContains = "NOT_CONTAINS",
  NotEndsWith = "NOT_ENDS_WITH",
  NotStartsWith = "NOT_STARTS_WITH",
  StartsWith = "STARTS_WITH",
}

export type TerrainResource = {
  __typename?: "TerrainResource";
  id: Scalars["ID"]["output"];
  props?: Maybe<CesiumResourceProps>;
  type: TerrainType;
};

export type TerrainResourceInput = {
  id: Scalars["ID"]["input"];
  props?: InputMaybe<CesiumResourcePropsInput>;
  type: TerrainType;
};

export enum TerrainType {
  ArcGisTerrain = "ARC_GIS_TERRAIN",
  CesiumIon = "CESIUM_ION",
  CesiumWorldTerrain = "CESIUM_WORLD_TERRAIN",
}

export enum Theme {
  Dark = "DARK",
  Default = "DEFAULT",
  Light = "LIGHT",
}

export type Thread = {
  __typename?: "Thread";
  comments: Array<Comment>;
  id: Scalars["ID"]["output"];
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars["ID"]["output"];
};

export type TileResource = {
  __typename?: "TileResource";
  id: Scalars["ID"]["output"];
  props?: Maybe<UrlResourceProps>;
  type: TileType;
};

export type TileResourceInput = {
  id: Scalars["ID"]["input"];
  props?: InputMaybe<UrlResourcePropsInput>;
  type: TileType;
};

export enum TileType {
  Default = "DEFAULT",
  EarthAtNight = "EARTH_AT_NIGHT",
  EsriTopography = "ESRI_TOPOGRAPHY",
  JapanGsiStandardMap = "JAPAN_GSI_STANDARD_MAP",
  Labelled = "LABELLED",
  OpenStreetMap = "OPEN_STREET_MAP",
  RoadMap = "ROAD_MAP",
  Url = "URL",
}

export type TimeFieldCondition = {
  __typename?: "TimeFieldCondition";
  fieldId: FieldSelector;
  operator: TimeOperator;
  value: Scalars["DateTime"]["output"];
};

export type TimeFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: TimeOperator;
  value: Scalars["DateTime"]["input"];
};

export enum TimeOperator {
  After = "AFTER",
  AfterOrOn = "AFTER_OR_ON",
  Before = "BEFORE",
  BeforeOrOn = "BEFORE_OR_ON",
  OfThisMonth = "OF_THIS_MONTH",
  OfThisWeek = "OF_THIS_WEEK",
  OfThisYear = "OF_THIS_YEAR",
}

export type UnpublishItemInput = {
  itemIds: Array<Scalars["ID"]["input"]>;
};

export type UnpublishItemPayload = {
  __typename?: "UnpublishItemPayload";
  items: Array<Item>;
};

export type UpdateApiKeyInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["ID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  projectId: Scalars["ID"]["input"];
  publication?: InputMaybe<UpdatePublicationSettingsInput>;
};

export type UpdateAssetInput = {
  id: Scalars["ID"]["input"];
  previewType?: InputMaybe<PreviewType>;
};

export type UpdateAssetPayload = {
  __typename?: "UpdateAssetPayload";
  asset: Asset;
};

export type UpdateCommentInput = {
  commentId: Scalars["ID"]["input"];
  content: Scalars["String"]["input"];
  threadId: Scalars["ID"]["input"];
};

export type UpdateFieldInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  fieldId: Scalars["ID"]["input"];
  groupId?: InputMaybe<Scalars["ID"]["input"]>;
  isTitle?: InputMaybe<Scalars["Boolean"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  metadata?: InputMaybe<Scalars["Boolean"]["input"]>;
  modelId?: InputMaybe<Scalars["ID"]["input"]>;
  multiple?: InputMaybe<Scalars["Boolean"]["input"]>;
  order?: InputMaybe<Scalars["Int"]["input"]>;
  required?: InputMaybe<Scalars["Boolean"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  typeProperty?: InputMaybe<SchemaFieldTypePropertyInput>;
  unique?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateGroupInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  groupId: Scalars["ID"]["input"];
  key?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateGroupsOrderInput = {
  groupIds: Array<Scalars["ID"]["input"]>;
};

export type UpdateIntegrationInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  integrationId: Scalars["ID"]["input"];
  logoUrl?: InputMaybe<Scalars["URL"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateIntegrationOfWorkspaceInput = {
  integrationId: Scalars["ID"]["input"];
  role: Role;
  workspaceId: Scalars["ID"]["input"];
};

export type UpdateItemInput = {
  fields: Array<ItemFieldInput>;
  itemId: Scalars["ID"]["input"];
  metadataId?: InputMaybe<Scalars["ID"]["input"]>;
  originalId?: InputMaybe<Scalars["ID"]["input"]>;
  version?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateMeInput = {
  email?: InputMaybe<Scalars["String"]["input"]>;
  lang?: InputMaybe<Scalars["Lang"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  password?: InputMaybe<Scalars["String"]["input"]>;
  passwordConfirmation?: InputMaybe<Scalars["String"]["input"]>;
  theme?: InputMaybe<Theme>;
};

export type UpdateMePayload = {
  __typename?: "UpdateMePayload";
  me: Me;
};

export type UpdateMemberOfWorkspacePayload = {
  __typename?: "UpdateMemberOfWorkspacePayload";
  workspace: Workspace;
};

export type UpdateModelInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  modelId: Scalars["ID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateModelsOrderInput = {
  modelIds: Array<Scalars["ID"]["input"]>;
};

export type UpdateProjectAccessibilityInput = {
  publication?: InputMaybe<UpdatePublicationSettingsInput>;
  visibility?: InputMaybe<ProjectVisibility>;
};

export type UpdateProjectInput = {
  accessibility?: InputMaybe<UpdateProjectAccessibilityInput>;
  alias?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  license?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  projectId: Scalars["ID"]["input"];
  readme?: InputMaybe<Scalars["String"]["input"]>;
  requestRoles?: InputMaybe<Array<Role>>;
};

export type UpdatePublicationSettingsInput = {
  publicAssets: Scalars["Boolean"]["input"];
  publicModels: Array<Scalars["ID"]["input"]>;
};

export type UpdateRequestInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  items?: InputMaybe<Array<RequestItemInput>>;
  requestId: Scalars["ID"]["input"];
  reviewersId?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  state?: InputMaybe<RequestState>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateUserOfWorkspaceInput = {
  role: Role;
  userId: Scalars["ID"]["input"];
  workspaceId: Scalars["ID"]["input"];
};

export type UpdateViewInput = {
  columns?: InputMaybe<Array<ColumnSelectionInput>>;
  filter?: InputMaybe<ConditionInput>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  sort?: InputMaybe<ItemSortInput>;
  viewId: Scalars["ID"]["input"];
};

export type UpdateViewsOrderInput = {
  viewIds: Array<Scalars["ID"]["input"]>;
};

export type UpdateWebhookInput = {
  active?: InputMaybe<Scalars["Boolean"]["input"]>;
  integrationId: Scalars["ID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  secret?: InputMaybe<Scalars["String"]["input"]>;
  trigger?: InputMaybe<WebhookTriggerInput>;
  url?: InputMaybe<Scalars["URL"]["input"]>;
  webhookId: Scalars["ID"]["input"];
};

export type UpdateWorkspaceInput = {
  name: Scalars["String"]["input"];
  workspaceId: Scalars["ID"]["input"];
};

export type UpdateWorkspacePayload = {
  __typename?: "UpdateWorkspacePayload";
  workspace: Workspace;
};

export type UpdateWorkspaceSettingsInput = {
  id: Scalars["ID"]["input"];
  terrains?: InputMaybe<ResourcesListInput>;
  tiles?: InputMaybe<ResourcesListInput>;
};

export type UpdateWorkspaceSettingsPayload = {
  __typename?: "UpdateWorkspaceSettingsPayload";
  workspaceSettings: WorkspaceSettings;
};

export type UrlResourceProps = {
  __typename?: "UrlResourceProps";
  image: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  url: Scalars["String"]["output"];
};

export type UrlResourcePropsInput = {
  image: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  url: Scalars["String"]["input"];
};

export type User = Node & {
  __typename?: "User";
  email: Scalars["String"]["output"];
  host?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
};

export type VersionedItem = {
  __typename?: "VersionedItem";
  parents?: Maybe<Array<Scalars["String"]["output"]>>;
  refs: Array<Scalars["String"]["output"]>;
  value: Item;
  version: Scalars["String"]["output"];
};

export type View = Node & {
  __typename?: "View";
  columns?: Maybe<Array<Column>>;
  filter?: Maybe<Condition>;
  id: Scalars["ID"]["output"];
  modelId: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  order: Scalars["Int"]["output"];
  projectId: Scalars["ID"]["output"];
  sort?: Maybe<ItemSort>;
};

export type ViewPayload = {
  __typename?: "ViewPayload";
  view: View;
};

export type ViewsPayload = {
  __typename?: "ViewsPayload";
  views: Array<View>;
};

export type Webhook = {
  __typename?: "Webhook";
  active: Scalars["Boolean"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  secret: Scalars["String"]["output"];
  trigger: WebhookTrigger;
  updatedAt: Scalars["DateTime"]["output"];
  url: Scalars["URL"]["output"];
};

export type WebhookPayload = {
  __typename?: "WebhookPayload";
  webhook: Webhook;
};

export type WebhookTrigger = {
  __typename?: "WebhookTrigger";
  onAssetDecompress?: Maybe<Scalars["Boolean"]["output"]>;
  onAssetDelete?: Maybe<Scalars["Boolean"]["output"]>;
  onAssetUpload?: Maybe<Scalars["Boolean"]["output"]>;
  onItemCreate?: Maybe<Scalars["Boolean"]["output"]>;
  onItemDelete?: Maybe<Scalars["Boolean"]["output"]>;
  onItemPublish?: Maybe<Scalars["Boolean"]["output"]>;
  onItemUnPublish?: Maybe<Scalars["Boolean"]["output"]>;
  onItemUpdate?: Maybe<Scalars["Boolean"]["output"]>;
};

export type WebhookTriggerInput = {
  onAssetDecompress?: InputMaybe<Scalars["Boolean"]["input"]>;
  onAssetDelete?: InputMaybe<Scalars["Boolean"]["input"]>;
  onAssetUpload?: InputMaybe<Scalars["Boolean"]["input"]>;
  onItemCreate?: InputMaybe<Scalars["Boolean"]["input"]>;
  onItemDelete?: InputMaybe<Scalars["Boolean"]["input"]>;
  onItemPublish?: InputMaybe<Scalars["Boolean"]["input"]>;
  onItemUnPublish?: InputMaybe<Scalars["Boolean"]["input"]>;
  onItemUpdate?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type Workspace = Node & {
  __typename?: "Workspace";
  alias?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  members: Array<WorkspaceMember>;
  name: Scalars["String"]["output"];
  personal: Scalars["Boolean"]["output"];
};

export type WorkspaceIntegrationMember = {
  __typename?: "WorkspaceIntegrationMember";
  active: Scalars["Boolean"]["output"];
  integration?: Maybe<Integration>;
  integrationId: Scalars["ID"]["output"];
  invitedBy?: Maybe<User>;
  invitedById: Scalars["ID"]["output"];
  role: Role;
};

export type WorkspaceMember = WorkspaceIntegrationMember | WorkspaceUserMember;

export type WorkspaceProjectLimits = {
  __typename?: "WorkspaceProjectLimits";
  privateProjectsAllowed: Scalars["Boolean"]["output"];
  publicProjectsAllowed: Scalars["Boolean"]["output"];
};

export type WorkspaceSettings = Node & {
  __typename?: "WorkspaceSettings";
  id: Scalars["ID"]["output"];
  terrains?: Maybe<ResourceList>;
  tiles?: Maybe<ResourceList>;
};

export type WorkspaceUserMember = {
  __typename?: "WorkspaceUserMember";
  host?: Maybe<Scalars["String"]["output"]>;
  role: Role;
  user?: Maybe<User>;
  userId: Scalars["ID"]["output"];
};
