import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Any: { input: any; output: any; }
  Cursor: { input: string; output: string; }
  DateTime: { input: Date; output: Date; }
  FileSize: { input: number; output: number; }
  Lang: { input: string; output: string; }
  URL: { input: string; output: string; }
  Upload: { input: any; output: any; }
};

export type AddCommentInput = {
  content: Scalars['String']['input'];
  threadId: Scalars['ID']['input'];
};

export type AddIntegrationToWorkspaceInput = {
  integrationId: Scalars['ID']['input'];
  role: Role;
  workspaceId: Scalars['ID']['input'];
};

export type AddUsersToWorkspaceInput = {
  users: Array<MemberInput>;
  workspaceId: Scalars['ID']['input'];
};

export type AddUsersToWorkspacePayload = {
  __typename?: 'AddUsersToWorkspacePayload';
  workspace: Workspace;
};

export type AndCondition = {
  __typename?: 'AndCondition';
  conditions: Array<Condition>;
};

export type AndConditionInput = {
  conditions: Array<ConditionInput>;
};

export type ApproveRequestInput = {
  requestId: Scalars['ID']['input'];
};

export enum ArchiveExtractionStatus {
  Done = 'DONE',
  Failed = 'FAILED',
  InProgress = 'IN_PROGRESS',
  Pending = 'PENDING',
  Skipped = 'SKIPPED'
}

export type Asset = Node & {
  __typename?: 'Asset';
  archiveExtractionStatus?: Maybe<ArchiveExtractionStatus>;
  contentEncoding?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdBy: Operator;
  createdById: Scalars['ID']['output'];
  createdByType: OperatorType;
  fileName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  items?: Maybe<Array<AssetItem>>;
  previewType?: Maybe<PreviewType>;
  project: Project;
  projectId: Scalars['ID']['output'];
  size: Scalars['FileSize']['output'];
  thread?: Maybe<Thread>;
  threadId?: Maybe<Scalars['ID']['output']>;
  url: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
};

export type AssetConnection = {
  __typename?: 'AssetConnection';
  edges: Array<AssetEdge>;
  nodes: Array<Maybe<Asset>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type AssetEdge = {
  __typename?: 'AssetEdge';
  cursor: Scalars['Cursor']['output'];
  node?: Maybe<Asset>;
};

export type AssetFile = {
  __typename?: 'AssetFile';
  contentEncoding?: Maybe<Scalars['String']['output']>;
  contentType?: Maybe<Scalars['String']['output']>;
  filePaths?: Maybe<Array<Scalars['String']['output']>>;
  name: Scalars['String']['output'];
  path: Scalars['String']['output'];
  size: Scalars['FileSize']['output'];
};

export type AssetItem = {
  __typename?: 'AssetItem';
  itemId: Scalars['ID']['output'];
  modelId: Scalars['ID']['output'];
};

export type AssetSort = {
  direction?: InputMaybe<SortDirection>;
  sortBy: AssetSortType;
};

export enum AssetSortType {
  Date = 'DATE',
  Name = 'NAME',
  Size = 'SIZE'
}

export type BasicFieldCondition = {
  __typename?: 'BasicFieldCondition';
  fieldId: FieldSelector;
  operator: BasicOperator;
  value: Scalars['Any']['output'];
};

export type BasicFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: BasicOperator;
  value: Scalars['Any']['input'];
};

export enum BasicOperator {
  Equals = 'EQUALS',
  NotEquals = 'NOT_EQUALS'
}

export type BoolFieldCondition = {
  __typename?: 'BoolFieldCondition';
  fieldId: FieldSelector;
  operator: BoolOperator;
  value: Scalars['Boolean']['output'];
};

export type BoolFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: BoolOperator;
  value: Scalars['Boolean']['input'];
};

export enum BoolOperator {
  Equals = 'EQUALS',
  NotEquals = 'NOT_EQUALS'
}

export type CesiumResourceProps = {
  __typename?: 'CesiumResourceProps';
  cesiumIonAccessToken: Scalars['String']['output'];
  cesiumIonAssetId: Scalars['String']['output'];
  image: Scalars['String']['output'];
  name: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type CesiumResourcePropsInput = {
  cesiumIonAccessToken: Scalars['String']['input'];
  cesiumIonAssetId: Scalars['String']['input'];
  image: Scalars['String']['input'];
  name: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export type Column = {
  __typename?: 'Column';
  field: FieldSelector;
  visible: Scalars['Boolean']['output'];
};

export type ColumnSelectionInput = {
  field: FieldSelectorInput;
  visible: Scalars['Boolean']['input'];
};

export type Comment = {
  __typename?: 'Comment';
  author?: Maybe<Operator>;
  authorId: Scalars['ID']['output'];
  authorType: OperatorType;
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  threadId: Scalars['ID']['output'];
  workspaceId: Scalars['ID']['output'];
};

export type CommentPayload = {
  __typename?: 'CommentPayload';
  comment: Comment;
  thread: Thread;
};

export type Condition = AndCondition | BasicFieldCondition | BoolFieldCondition | MultipleFieldCondition | NullableFieldCondition | NumberFieldCondition | OrCondition | StringFieldCondition | TimeFieldCondition;

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

export type CorrespondingFieldInput = {
  description: Scalars['String']['input'];
  fieldId?: InputMaybe<Scalars['ID']['input']>;
  key: Scalars['String']['input'];
  required: Scalars['Boolean']['input'];
  title: Scalars['String']['input'];
};

export type CreateAssetInput = {
  contentEncoding?: InputMaybe<Scalars['String']['input']>;
  file?: InputMaybe<Scalars['Upload']['input']>;
  projectId: Scalars['ID']['input'];
  skipDecompression?: InputMaybe<Scalars['Boolean']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type CreateAssetPayload = {
  __typename?: 'CreateAssetPayload';
  asset: Asset;
};

export type CreateAssetUploadInput = {
  contentEncoding?: InputMaybe<Scalars['String']['input']>;
  contentLength?: InputMaybe<Scalars['Int']['input']>;
  cursor?: InputMaybe<Scalars['String']['input']>;
  filename?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['ID']['input'];
};

export type CreateAssetUploadPayload = {
  __typename?: 'CreateAssetUploadPayload';
  contentEncoding?: Maybe<Scalars['String']['output']>;
  contentLength: Scalars['Int']['output'];
  contentType?: Maybe<Scalars['String']['output']>;
  next?: Maybe<Scalars['String']['output']>;
  token: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type CreateFieldInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  groupId?: InputMaybe<Scalars['ID']['input']>;
  isTitle: Scalars['Boolean']['input'];
  key: Scalars['String']['input'];
  metadata?: InputMaybe<Scalars['Boolean']['input']>;
  modelId?: InputMaybe<Scalars['ID']['input']>;
  multiple: Scalars['Boolean']['input'];
  required: Scalars['Boolean']['input'];
  title: Scalars['String']['input'];
  type: SchemaFieldType;
  typeProperty: SchemaFieldTypePropertyInput;
  unique: Scalars['Boolean']['input'];
};

export type CreateGroupInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  key: Scalars['String']['input'];
  name: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};

export type CreateIntegrationInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  logoUrl: Scalars['URL']['input'];
  name: Scalars['String']['input'];
  type: IntegrationType;
};

export type CreateItemInput = {
  fields: Array<ItemFieldInput>;
  metadataId?: InputMaybe<Scalars['ID']['input']>;
  modelId: Scalars['ID']['input'];
  originalId?: InputMaybe<Scalars['ID']['input']>;
  schemaId: Scalars['ID']['input'];
};

export type CreateModelInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['ID']['input'];
};

export type CreateProjectInput = {
  alias?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  requestRoles?: InputMaybe<Array<Role>>;
  workspaceId: Scalars['ID']['input'];
};

export type CreateRequestInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  items: Array<RequestItemInput>;
  projectId: Scalars['ID']['input'];
  reviewersId?: InputMaybe<Array<Scalars['ID']['input']>>;
  state?: InputMaybe<RequestState>;
  title: Scalars['String']['input'];
};

export type CreateThreadWithCommentInput = {
  content: Scalars['String']['input'];
  resourceId: Scalars['ID']['input'];
  resourceType: ResourceType;
  workspaceId: Scalars['ID']['input'];
};

export type CreateViewInput = {
  columns?: InputMaybe<Array<ColumnSelectionInput>>;
  filter?: InputMaybe<ConditionInput>;
  modelId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
  sort?: InputMaybe<ItemSortInput>;
};

export type CreateWebhookInput = {
  active: Scalars['Boolean']['input'];
  integrationId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  secret: Scalars['String']['input'];
  trigger: WebhookTriggerInput;
  url: Scalars['URL']['input'];
};

export type CreateWorkspaceInput = {
  name: Scalars['String']['input'];
};

export type CreateWorkspacePayload = {
  __typename?: 'CreateWorkspacePayload';
  workspace: Workspace;
};

export type DecompressAssetInput = {
  assetId: Scalars['ID']['input'];
};

export type DecompressAssetPayload = {
  __typename?: 'DecompressAssetPayload';
  asset: Asset;
};

export type DeleteAssetInput = {
  assetId: Scalars['ID']['input'];
};

export type DeleteAssetPayload = {
  __typename?: 'DeleteAssetPayload';
  assetId: Scalars['ID']['output'];
};

export type DeleteAssetsInput = {
  assetIds: Array<Scalars['ID']['input']>;
};

export type DeleteAssetsPayload = {
  __typename?: 'DeleteAssetsPayload';
  assetIds?: Maybe<Array<Scalars['ID']['output']>>;
};

export type DeleteCommentInput = {
  commentId: Scalars['ID']['input'];
  threadId: Scalars['ID']['input'];
};

export type DeleteCommentPayload = {
  __typename?: 'DeleteCommentPayload';
  commentId: Scalars['ID']['output'];
  thread: Thread;
};

export type DeleteFieldInput = {
  fieldId: Scalars['ID']['input'];
  groupId?: InputMaybe<Scalars['ID']['input']>;
  metadata?: InputMaybe<Scalars['Boolean']['input']>;
  modelId?: InputMaybe<Scalars['ID']['input']>;
};

export type DeleteFieldPayload = {
  __typename?: 'DeleteFieldPayload';
  fieldId: Scalars['ID']['output'];
};

export type DeleteGroupInput = {
  groupId: Scalars['ID']['input'];
};

export type DeleteGroupPayload = {
  __typename?: 'DeleteGroupPayload';
  groupId: Scalars['ID']['output'];
};

export type DeleteIntegrationInput = {
  integrationId: Scalars['ID']['input'];
};

export type DeleteIntegrationPayload = {
  __typename?: 'DeleteIntegrationPayload';
  integrationId: Scalars['ID']['output'];
};

export type DeleteIntegrationsInput = {
  integrationIDs: Array<Scalars['ID']['input']>;
};

export type DeleteIntegrationsPayload = {
  __typename?: 'DeleteIntegrationsPayload';
  integrationIDs?: Maybe<Array<Scalars['ID']['output']>>;
};

export type DeleteItemInput = {
  itemId: Scalars['ID']['input'];
};

export type DeleteItemPayload = {
  __typename?: 'DeleteItemPayload';
  itemId: Scalars['ID']['output'];
};

export type DeleteMeInput = {
  userId: Scalars['ID']['input'];
};

export type DeleteMePayload = {
  __typename?: 'DeleteMePayload';
  userId: Scalars['ID']['output'];
};

export type DeleteModelInput = {
  modelId: Scalars['ID']['input'];
};

export type DeleteModelPayload = {
  __typename?: 'DeleteModelPayload';
  modelId: Scalars['ID']['output'];
};

export type DeleteProjectInput = {
  projectId: Scalars['ID']['input'];
};

export type DeleteProjectPayload = {
  __typename?: 'DeleteProjectPayload';
  projectId: Scalars['ID']['output'];
};

export type DeleteRequestInput = {
  projectId: Scalars['ID']['input'];
  requestsId: Array<Scalars['ID']['input']>;
};

export type DeleteRequestPayload = {
  __typename?: 'DeleteRequestPayload';
  requests: Array<Scalars['ID']['output']>;
};

export type DeleteViewInput = {
  viewId: Scalars['ID']['input'];
};

export type DeleteViewPayload = {
  __typename?: 'DeleteViewPayload';
  viewId: Scalars['ID']['output'];
};

export type DeleteWebhookInput = {
  integrationId: Scalars['ID']['input'];
  webhookId: Scalars['ID']['input'];
};

export type DeleteWebhookPayload = {
  __typename?: 'DeleteWebhookPayload';
  webhookId: Scalars['ID']['output'];
};

export type DeleteWorkspaceInput = {
  workspaceId: Scalars['ID']['input'];
};

export type DeleteWorkspacePayload = {
  __typename?: 'DeleteWorkspacePayload';
  workspaceId: Scalars['ID']['output'];
};

export type FieldPayload = {
  __typename?: 'FieldPayload';
  field: SchemaField;
};

export type FieldSelector = {
  __typename?: 'FieldSelector';
  id?: Maybe<Scalars['ID']['output']>;
  type: FieldType;
};

export type FieldSelectorInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  type: FieldType;
};

export enum FieldType {
  CreationDate = 'CREATION_DATE',
  CreationUser = 'CREATION_USER',
  Field = 'FIELD',
  Id = 'ID',
  MetaField = 'META_FIELD',
  ModificationDate = 'MODIFICATION_DATE',
  ModificationUser = 'MODIFICATION_USER',
  Status = 'STATUS'
}

export type FieldsPayload = {
  __typename?: 'FieldsPayload';
  fields: Array<SchemaField>;
};

export enum GeometryEditorSupportedType {
  Any = 'ANY',
  Linestring = 'LINESTRING',
  Point = 'POINT',
  Polygon = 'POLYGON'
}

export enum GeometryObjectSupportedType {
  Geometrycollection = 'GEOMETRYCOLLECTION',
  Linestring = 'LINESTRING',
  Multilinestring = 'MULTILINESTRING',
  Multipoint = 'MULTIPOINT',
  Multipolygon = 'MULTIPOLYGON',
  Point = 'POINT',
  Polygon = 'POLYGON'
}

export type Group = Node & {
  __typename?: 'Group';
  description: Scalars['String']['output'];
  fields: Array<SchemaField>;
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  project: Project;
  projectId: Scalars['ID']['output'];
  schema: Schema;
  schemaId: Scalars['ID']['output'];
};

export type GroupPayload = {
  __typename?: 'GroupPayload';
  group: Group;
};

export type GroupsPayload = {
  __typename?: 'GroupsPayload';
  groups: Array<Group>;
};

export type Integration = Node & {
  __typename?: 'Integration';
  config?: Maybe<IntegrationConfig>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  developer: User;
  developerId: Scalars['ID']['output'];
  iType: IntegrationType;
  id: Scalars['ID']['output'];
  logoUrl: Scalars['URL']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type IntegrationConfig = {
  __typename?: 'IntegrationConfig';
  token: Scalars['String']['output'];
  webhooks: Array<Webhook>;
};

export type IntegrationPayload = {
  __typename?: 'IntegrationPayload';
  integration: Integration;
};

export enum IntegrationType {
  Private = 'Private',
  Public = 'Public'
}

export type Item = Node & {
  __typename?: 'Item';
  assets: Array<Maybe<Asset>>;
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Operator>;
  fields: Array<ItemField>;
  id: Scalars['ID']['output'];
  integrationId?: Maybe<Scalars['ID']['output']>;
  isMetadata: Scalars['Boolean']['output'];
  metadata?: Maybe<Item>;
  metadataId?: Maybe<Scalars['ID']['output']>;
  model: Model;
  modelId: Scalars['ID']['output'];
  original?: Maybe<Item>;
  originalId?: Maybe<Scalars['ID']['output']>;
  project: Project;
  projectId: Scalars['ID']['output'];
  referencedItems?: Maybe<Array<Item>>;
  requests?: Maybe<Array<Request>>;
  schema: Schema;
  schemaId: Scalars['ID']['output'];
  status: ItemStatus;
  thread?: Maybe<Thread>;
  threadId?: Maybe<Scalars['ID']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  updatedBy?: Maybe<Operator>;
  updatedByIntegrationId?: Maybe<Scalars['ID']['output']>;
  updatedByUserId?: Maybe<Scalars['ID']['output']>;
  userId?: Maybe<Scalars['ID']['output']>;
  version: Scalars['String']['output'];
};

export type ItemConnection = {
  __typename?: 'ItemConnection';
  edges: Array<ItemEdge>;
  nodes: Array<Maybe<Item>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ItemEdge = {
  __typename?: 'ItemEdge';
  cursor: Scalars['Cursor']['output'];
  node?: Maybe<Item>;
};

export type ItemField = {
  __typename?: 'ItemField';
  itemGroupId?: Maybe<Scalars['ID']['output']>;
  schemaFieldId: Scalars['ID']['output'];
  type: SchemaFieldType;
  value?: Maybe<Scalars['Any']['output']>;
};

export type ItemFieldInput = {
  itemGroupId?: InputMaybe<Scalars['ID']['input']>;
  schemaFieldId: Scalars['ID']['input'];
  type: SchemaFieldType;
  value: Scalars['Any']['input'];
};

export type ItemPayload = {
  __typename?: 'ItemPayload';
  item: Item;
};

export type ItemQueryInput = {
  model: Scalars['ID']['input'];
  project: Scalars['ID']['input'];
  q?: InputMaybe<Scalars['String']['input']>;
  schema?: InputMaybe<Scalars['ID']['input']>;
};

export type ItemSort = {
  __typename?: 'ItemSort';
  direction?: Maybe<SortDirection>;
  field: FieldSelector;
};

export type ItemSortInput = {
  direction?: InputMaybe<SortDirection>;
  field: FieldSelectorInput;
};

export enum ItemStatus {
  Draft = 'DRAFT',
  Public = 'PUBLIC',
  PublicDraft = 'PUBLIC_DRAFT',
  PublicReview = 'PUBLIC_REVIEW',
  Review = 'REVIEW'
}

export type KeyAvailability = {
  __typename?: 'KeyAvailability';
  available: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
};

export type Me = {
  __typename?: 'Me';
  auths: Array<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  host?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  integrations: Array<Integration>;
  lang: Scalars['Lang']['output'];
  myWorkspace?: Maybe<Workspace>;
  myWorkspaceId: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  theme: Theme;
  workspaces: Array<Workspace>;
};

export type MemberInput = {
  role: Role;
  userId: Scalars['ID']['input'];
};

export type Model = Node & {
  __typename?: 'Model';
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  metadataSchema?: Maybe<Schema>;
  metadataSchemaId?: Maybe<Scalars['ID']['output']>;
  name: Scalars['String']['output'];
  order?: Maybe<Scalars['Int']['output']>;
  project: Project;
  projectId: Scalars['ID']['output'];
  public: Scalars['Boolean']['output'];
  schema: Schema;
  schemaId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ModelConnection = {
  __typename?: 'ModelConnection';
  edges: Array<ModelEdge>;
  nodes: Array<Maybe<Model>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ModelEdge = {
  __typename?: 'ModelEdge';
  cursor: Scalars['Cursor']['output'];
  node?: Maybe<Model>;
};

export type ModelPayload = {
  __typename?: 'ModelPayload';
  model: Model;
};

export type ModelsPayload = {
  __typename?: 'ModelsPayload';
  models: Array<Model>;
};

export type MultipleFieldCondition = {
  __typename?: 'MultipleFieldCondition';
  fieldId: FieldSelector;
  operator: MultipleOperator;
  value: Array<Scalars['Any']['output']>;
};

export type MultipleFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: MultipleOperator;
  value: Array<Scalars['Any']['input']>;
};

export enum MultipleOperator {
  IncludesAll = 'INCLUDES_ALL',
  IncludesAny = 'INCLUDES_ANY',
  NotIncludesAll = 'NOT_INCLUDES_ALL',
  NotIncludesAny = 'NOT_INCLUDES_ANY'
}

export type Mutation = {
  __typename?: 'Mutation';
  addComment?: Maybe<CommentPayload>;
  addIntegrationToWorkspace?: Maybe<AddUsersToWorkspacePayload>;
  addUsersToWorkspace?: Maybe<AddUsersToWorkspacePayload>;
  approveRequest?: Maybe<RequestPayload>;
  createAsset?: Maybe<CreateAssetPayload>;
  createAssetUpload?: Maybe<CreateAssetUploadPayload>;
  createField?: Maybe<FieldPayload>;
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
  deleteAsset?: Maybe<DeleteAssetPayload>;
  deleteAssets?: Maybe<DeleteAssetsPayload>;
  deleteComment?: Maybe<DeleteCommentPayload>;
  deleteField?: Maybe<DeleteFieldPayload>;
  deleteGroup?: Maybe<DeleteGroupPayload>;
  deleteIntegration?: Maybe<DeleteIntegrationPayload>;
  deleteIntegrations?: Maybe<DeleteIntegrationsPayload>;
  deleteItem?: Maybe<DeleteItemPayload>;
  deleteMe?: Maybe<DeleteMePayload>;
  deleteModel?: Maybe<DeleteModelPayload>;
  deleteProject?: Maybe<DeleteProjectPayload>;
  deleteRequest?: Maybe<DeleteRequestPayload>;
  deleteView?: Maybe<DeleteViewPayload>;
  deleteWebhook?: Maybe<DeleteWebhookPayload>;
  deleteWorkspace?: Maybe<DeleteWorkspacePayload>;
  publishItem?: Maybe<PublishItemPayload>;
  publishModel?: Maybe<PublishModelPayload>;
  publishModels?: Maybe<PublishModelsPayload>;
  regenerateIntegrationToken?: Maybe<IntegrationPayload>;
  regeneratePublicApiToken?: Maybe<ProjectPayload>;
  removeIntegrationFromWorkspace?: Maybe<RemoveIntegrationFromWorkspacePayload>;
  removeMultipleMembersFromWorkspace?: Maybe<RemoveMultipleMembersFromWorkspacePayload>;
  removeMyAuth?: Maybe<UpdateMePayload>;
  unpublishItem?: Maybe<UnpublishItemPayload>;
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


export type MutationCreateAssetArgs = {
  input: CreateAssetInput;
};


export type MutationCreateAssetUploadArgs = {
  input: CreateAssetUploadInput;
};


export type MutationCreateFieldArgs = {
  input: CreateFieldInput;
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


export type MutationPublishItemArgs = {
  input: PublishItemInput;
};


export type MutationPublishModelArgs = {
  input: PublishModelInput;
};


export type MutationPublishModelsArgs = {
  input: PublishModelsInput;
};


export type MutationRegenerateIntegrationTokenArgs = {
  input: RegenerateIntegrationTokenInput;
};


export type MutationRegeneratePublicApiTokenArgs = {
  input: RegeneratePublicApiTokenInput;
};


export type MutationRemoveIntegrationFromWorkspaceArgs = {
  input: RemoveIntegrationFromWorkspaceInput;
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
  id: Scalars['ID']['output'];
};

export enum NodeType {
  Asset = 'ASSET',
  Group = 'Group',
  Integration = 'Integration',
  Item = 'Item',
  Model = 'Model',
  Project = 'PROJECT',
  Request = 'REQUEST',
  Schema = 'Schema',
  User = 'USER',
  View = 'View',
  Workspace = 'WORKSPACE',
  WorkspaceSettings = 'WorkspaceSettings'
}

export type NullableFieldCondition = {
  __typename?: 'NullableFieldCondition';
  fieldId: FieldSelector;
  operator: NullableOperator;
};

export type NullableFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: NullableOperator;
};

export enum NullableOperator {
  Empty = 'EMPTY',
  NotEmpty = 'NOT_EMPTY'
}

export type NumberFieldCondition = {
  __typename?: 'NumberFieldCondition';
  fieldId: FieldSelector;
  operator: NumberOperator;
  value: Scalars['Float']['output'];
};

export type NumberFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: NumberOperator;
  value: Scalars['Float']['input'];
};

export enum NumberOperator {
  GreaterThan = 'GREATER_THAN',
  GreaterThanOrEqualTo = 'GREATER_THAN_OR_EQUAL_TO',
  LessThan = 'LESS_THAN',
  LessThanOrEqualTo = 'LESS_THAN_OR_EQUAL_TO'
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
  Integration = 'Integration',
  User = 'User'
}

export type OrCondition = {
  __typename?: 'OrCondition';
  conditions: Array<Condition>;
};

export type OrConditionInput = {
  conditions: Array<ConditionInput>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['Cursor']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['Cursor']['output']>;
};

export type Pagination = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export enum PreviewType {
  Csv = 'CSV',
  Geo = 'GEO',
  Geo_3DTiles = 'GEO_3D_TILES',
  GeoMvt = 'GEO_MVT',
  Image = 'IMAGE',
  ImageSvg = 'IMAGE_SVG',
  Model_3D = 'MODEL_3D',
  Unknown = 'UNKNOWN'
}

export type Project = Node & {
  __typename?: 'Project';
  alias: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  publication?: Maybe<ProjectPublication>;
  requestRoles?: Maybe<Array<Role>>;
  updatedAt: Scalars['DateTime']['output'];
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars['ID']['output'];
};

export type ProjectAliasAvailability = {
  __typename?: 'ProjectAliasAvailability';
  alias: Scalars['String']['output'];
  available: Scalars['Boolean']['output'];
};

export type ProjectConnection = {
  __typename?: 'ProjectConnection';
  edges: Array<ProjectEdge>;
  nodes: Array<Maybe<Project>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ProjectEdge = {
  __typename?: 'ProjectEdge';
  cursor: Scalars['Cursor']['output'];
  node?: Maybe<Project>;
};

export type ProjectPayload = {
  __typename?: 'ProjectPayload';
  project: Project;
};

export type ProjectPublication = {
  __typename?: 'ProjectPublication';
  assetPublic: Scalars['Boolean']['output'];
  scope: ProjectPublicationScope;
  token?: Maybe<Scalars['String']['output']>;
};

export enum ProjectPublicationScope {
  Limited = 'LIMITED',
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export type PublishItemInput = {
  itemIds: Array<Scalars['ID']['input']>;
};

export type PublishItemPayload = {
  __typename?: 'PublishItemPayload';
  items: Array<Item>;
};

export type PublishModelInput = {
  modelId: Scalars['ID']['input'];
  status: Scalars['Boolean']['input'];
};

export type PublishModelPayload = {
  __typename?: 'PublishModelPayload';
  modelId: Scalars['ID']['output'];
  status: Scalars['Boolean']['output'];
};

export type PublishModelsInput = {
  models: Array<PublishModelInput>;
};

export type PublishModelsPayload = {
  __typename?: 'PublishModelsPayload';
  models: Array<PublishModelPayload>;
};

export type Query = {
  __typename?: 'Query';
  assetFile: AssetFile;
  assets: AssetConnection;
  checkGroupKeyAvailability: KeyAvailability;
  checkModelKeyAvailability: KeyAvailability;
  checkProjectAlias: ProjectAliasAvailability;
  groups: Array<Maybe<Group>>;
  isItemReferenced: Scalars['Boolean']['output'];
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
  assetId: Scalars['ID']['input'];
};


export type QueryAssetsArgs = {
  keyword?: InputMaybe<Scalars['String']['input']>;
  pagination?: InputMaybe<Pagination>;
  projectId: Scalars['ID']['input'];
  sort?: InputMaybe<AssetSort>;
};


export type QueryCheckGroupKeyAvailabilityArgs = {
  key: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};


export type QueryCheckModelKeyAvailabilityArgs = {
  key: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};


export type QueryCheckProjectAliasArgs = {
  alias: Scalars['String']['input'];
};


export type QueryGroupsArgs = {
  modelID?: InputMaybe<Scalars['ID']['input']>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryIsItemReferencedArgs = {
  correspondingFieldId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
};


export type QueryModelsArgs = {
  pagination?: InputMaybe<Pagination>;
  projectId: Scalars['ID']['input'];
};


export type QueryModelsByGroupArgs = {
  groupId: Scalars['ID']['input'];
};


export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
  type: NodeType;
};


export type QueryNodesArgs = {
  id: Array<Scalars['ID']['input']>;
  type: NodeType;
};


export type QueryProjectsArgs = {
  pagination?: InputMaybe<Pagination>;
  workspaceId: Scalars['ID']['input'];
};


export type QueryRequestsArgs = {
  createdBy?: InputMaybe<Scalars['ID']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  pagination?: InputMaybe<Pagination>;
  projectId: Scalars['ID']['input'];
  reviewer?: InputMaybe<Scalars['ID']['input']>;
  sort?: InputMaybe<Sort>;
  state?: InputMaybe<Array<RequestState>>;
};


export type QuerySearchItemArgs = {
  input: SearchItemInput;
};


export type QueryUserByNameOrEmailArgs = {
  nameOrEmail: Scalars['String']['input'];
};


export type QueryUserSearchArgs = {
  keyword: Scalars['String']['input'];
};


export type QueryVersionsByItemArgs = {
  itemId: Scalars['ID']['input'];
};


export type QueryViewArgs = {
  modelId: Scalars['ID']['input'];
};

export type RegenerateIntegrationTokenInput = {
  integrationId: Scalars['ID']['input'];
};

export type RegeneratePublicApiTokenInput = {
  projectId: Scalars['ID']['input'];
};

export type RemoveIntegrationFromWorkspaceInput = {
  integrationId: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type RemoveIntegrationFromWorkspacePayload = {
  __typename?: 'RemoveIntegrationFromWorkspacePayload';
  workspace: Workspace;
};

export type RemoveMultipleMembersFromWorkspaceInput = {
  userIds: Array<Scalars['ID']['input']>;
  workspaceId: Scalars['ID']['input'];
};

export type RemoveMultipleMembersFromWorkspacePayload = {
  __typename?: 'RemoveMultipleMembersFromWorkspacePayload';
  workspace: Workspace;
};

export type RemoveMyAuthInput = {
  auth: Scalars['String']['input'];
};

export type Request = Node & {
  __typename?: 'Request';
  approvedAt?: Maybe<Scalars['DateTime']['output']>;
  closedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<User>;
  createdById: Scalars['ID']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  items: Array<RequestItem>;
  project?: Maybe<Project>;
  projectId: Scalars['ID']['output'];
  reviewers: Array<User>;
  reviewersId: Array<Scalars['ID']['output']>;
  state: RequestState;
  thread?: Maybe<Thread>;
  threadId?: Maybe<Scalars['ID']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars['ID']['output'];
};

export type RequestConnection = {
  __typename?: 'RequestConnection';
  edges: Array<RequestEdge>;
  nodes: Array<Maybe<Request>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type RequestEdge = {
  __typename?: 'RequestEdge';
  cursor: Scalars['Cursor']['output'];
  node?: Maybe<Request>;
};

export type RequestItem = {
  __typename?: 'RequestItem';
  item?: Maybe<VersionedItem>;
  itemId: Scalars['ID']['output'];
  ref?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
};

export type RequestItemInput = {
  itemId: Scalars['ID']['input'];
  version?: InputMaybe<Scalars['String']['input']>;
};

export type RequestPayload = {
  __typename?: 'RequestPayload';
  request: Request;
};

export enum RequestState {
  Approved = 'APPROVED',
  Closed = 'CLOSED',
  Draft = 'DRAFT',
  Waiting = 'WAITING'
}

export type Resource = TerrainResource | TileResource;

export type ResourceInput = {
  terrain?: InputMaybe<TerrainResourceInput>;
  tile?: InputMaybe<TileResourceInput>;
};

export type ResourceList = {
  __typename?: 'ResourceList';
  enabled?: Maybe<Scalars['Boolean']['output']>;
  resources: Array<Resource>;
  selectedResource?: Maybe<Scalars['ID']['output']>;
};

export enum ResourceType {
  Asset = 'ASSET',
  Item = 'ITEM',
  Request = 'REQUEST'
}

export type ResourcesListInput = {
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  resources: Array<ResourceInput>;
  selectedResource?: InputMaybe<Scalars['ID']['input']>;
};

export enum Role {
  Maintainer = 'MAINTAINER',
  Owner = 'OWNER',
  Reader = 'READER',
  Writer = 'WRITER'
}

export type Schema = Node & {
  __typename?: 'Schema';
  fields: Array<SchemaField>;
  id: Scalars['ID']['output'];
  project: Project;
  projectId: Scalars['ID']['output'];
  titleField?: Maybe<SchemaField>;
  titleFieldId?: Maybe<Scalars['ID']['output']>;
};

export type SchemaField = {
  __typename?: 'SchemaField';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  group?: Maybe<Group>;
  groupId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  isTitle: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  model?: Maybe<Model>;
  modelId?: Maybe<Scalars['ID']['output']>;
  multiple: Scalars['Boolean']['output'];
  order?: Maybe<Scalars['Int']['output']>;
  required: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  type: SchemaFieldType;
  typeProperty?: Maybe<SchemaFieldTypeProperty>;
  unique: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type SchemaFieldAsset = {
  __typename?: 'SchemaFieldAsset';
  defaultValue?: Maybe<Scalars['Any']['output']>;
};

export type SchemaFieldAssetInput = {
  defaultValue?: InputMaybe<Scalars['Any']['input']>;
};

export type SchemaFieldBool = {
  __typename?: 'SchemaFieldBool';
  defaultValue?: Maybe<Scalars['Any']['output']>;
};

export type SchemaFieldBoolInput = {
  defaultValue?: InputMaybe<Scalars['Any']['input']>;
};

export type SchemaFieldCheckbox = {
  __typename?: 'SchemaFieldCheckbox';
  defaultValue?: Maybe<Scalars['Any']['output']>;
};

export type SchemaFieldCheckboxInput = {
  defaultValue?: InputMaybe<Scalars['Any']['input']>;
};

export type SchemaFieldDate = {
  __typename?: 'SchemaFieldDate';
  defaultValue?: Maybe<Scalars['Any']['output']>;
};

export type SchemaFieldDateInput = {
  defaultValue?: InputMaybe<Scalars['Any']['input']>;
};

export type SchemaFieldGeometryEditor = {
  __typename?: 'SchemaFieldGeometryEditor';
  defaultValue?: Maybe<Scalars['Any']['output']>;
  supportedTypes: Array<GeometryEditorSupportedType>;
};

export type SchemaFieldGeometryEditorInput = {
  defaultValue?: InputMaybe<Scalars['Any']['input']>;
  supportedTypes: Array<GeometryEditorSupportedType>;
};

export type SchemaFieldGeometryObject = {
  __typename?: 'SchemaFieldGeometryObject';
  defaultValue?: Maybe<Scalars['Any']['output']>;
  supportedTypes: Array<GeometryObjectSupportedType>;
};

export type SchemaFieldGeometryObjectInput = {
  defaultValue?: InputMaybe<Scalars['Any']['input']>;
  supportedTypes: Array<GeometryObjectSupportedType>;
};

export type SchemaFieldGroup = {
  __typename?: 'SchemaFieldGroup';
  groupId: Scalars['ID']['output'];
};

export type SchemaFieldGroupInput = {
  groupId: Scalars['ID']['input'];
};

export type SchemaFieldInteger = {
  __typename?: 'SchemaFieldInteger';
  defaultValue?: Maybe<Scalars['Any']['output']>;
  max?: Maybe<Scalars['Int']['output']>;
  min?: Maybe<Scalars['Int']['output']>;
};

export type SchemaFieldIntegerInput = {
  defaultValue?: InputMaybe<Scalars['Any']['input']>;
  max?: InputMaybe<Scalars['Int']['input']>;
  min?: InputMaybe<Scalars['Int']['input']>;
};

export type SchemaFieldLineStringInput = {
  defaultValue?: InputMaybe<Scalars['Any']['input']>;
};

export type SchemaFieldMarkdown = {
  __typename?: 'SchemaFieldMarkdown';
  defaultValue?: Maybe<Scalars['Any']['output']>;
  maxLength?: Maybe<Scalars['Int']['output']>;
};

export type SchemaFieldNumber = {
  __typename?: 'SchemaFieldNumber';
  defaultValue?: Maybe<Scalars['Any']['output']>;
  max?: Maybe<Scalars['Float']['output']>;
  min?: Maybe<Scalars['Float']['output']>;
};

export type SchemaFieldNumberInput = {
  defaultValue?: InputMaybe<Scalars['Any']['input']>;
  max?: InputMaybe<Scalars['Float']['input']>;
  min?: InputMaybe<Scalars['Float']['input']>;
};

export type SchemaFieldReference = {
  __typename?: 'SchemaFieldReference';
  correspondingField?: Maybe<SchemaField>;
  correspondingFieldId?: Maybe<Scalars['ID']['output']>;
  modelId: Scalars['ID']['output'];
  schema: Schema;
  schemaId: Scalars['ID']['output'];
};

export type SchemaFieldReferenceInput = {
  correspondingField?: InputMaybe<CorrespondingFieldInput>;
  modelId: Scalars['ID']['input'];
  schemaId: Scalars['ID']['input'];
};

export type SchemaFieldRichText = {
  __typename?: 'SchemaFieldRichText';
  defaultValue?: Maybe<Scalars['Any']['output']>;
  maxLength?: Maybe<Scalars['Int']['output']>;
};

export type SchemaFieldRichTextInput = {
  defaultValue?: InputMaybe<Scalars['Any']['input']>;
  maxLength?: InputMaybe<Scalars['Int']['input']>;
};

export type SchemaFieldSelect = {
  __typename?: 'SchemaFieldSelect';
  defaultValue?: Maybe<Scalars['Any']['output']>;
  values: Array<Scalars['String']['output']>;
};

export type SchemaFieldSelectInput = {
  defaultValue?: InputMaybe<Scalars['Any']['input']>;
  values: Array<Scalars['String']['input']>;
};

export type SchemaFieldTag = {
  __typename?: 'SchemaFieldTag';
  defaultValue?: Maybe<Scalars['Any']['output']>;
  tags: Array<SchemaFieldTagValue>;
};

export enum SchemaFieldTagColor {
  Blue = 'BLUE',
  Cyan = 'CYAN',
  Geekblue = 'GEEKBLUE',
  Gold = 'GOLD',
  Green = 'GREEN',
  Lime = 'LIME',
  Magenta = 'MAGENTA',
  Orange = 'ORANGE',
  Purple = 'PURPLE',
  Red = 'RED',
  Volcano = 'VOLCANO'
}

export type SchemaFieldTagInput = {
  defaultValue?: InputMaybe<Scalars['Any']['input']>;
  tags: Array<SchemaFieldTagValueInput>;
};

export type SchemaFieldTagValue = {
  __typename?: 'SchemaFieldTagValue';
  color: SchemaFieldTagColor;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type SchemaFieldTagValueInput = {
  color?: InputMaybe<SchemaFieldTagColor>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type SchemaFieldText = {
  __typename?: 'SchemaFieldText';
  defaultValue?: Maybe<Scalars['Any']['output']>;
  maxLength?: Maybe<Scalars['Int']['output']>;
};

export type SchemaFieldTextArea = {
  __typename?: 'SchemaFieldTextArea';
  defaultValue?: Maybe<Scalars['Any']['output']>;
  maxLength?: Maybe<Scalars['Int']['output']>;
};

export type SchemaFieldTextAreaInput = {
  defaultValue?: InputMaybe<Scalars['Any']['input']>;
  maxLength?: InputMaybe<Scalars['Int']['input']>;
};

export type SchemaFieldTextInput = {
  defaultValue?: InputMaybe<Scalars['Any']['input']>;
  maxLength?: InputMaybe<Scalars['Int']['input']>;
};

export enum SchemaFieldType {
  Asset = 'Asset',
  Bool = 'Bool',
  Checkbox = 'Checkbox',
  Date = 'Date',
  GeometryEditor = 'GeometryEditor',
  GeometryObject = 'GeometryObject',
  Group = 'Group',
  Integer = 'Integer',
  MarkdownText = 'MarkdownText',
  Number = 'Number',
  Reference = 'Reference',
  RichText = 'RichText',
  Select = 'Select',
  Tag = 'Tag',
  Text = 'Text',
  TextArea = 'TextArea',
  Url = 'URL'
}

export type SchemaFieldTypeProperty = SchemaFieldAsset | SchemaFieldBool | SchemaFieldCheckbox | SchemaFieldDate | SchemaFieldGeometryEditor | SchemaFieldGeometryObject | SchemaFieldGroup | SchemaFieldInteger | SchemaFieldMarkdown | SchemaFieldNumber | SchemaFieldReference | SchemaFieldRichText | SchemaFieldSelect | SchemaFieldTag | SchemaFieldText | SchemaFieldTextArea | SchemaFieldUrl;

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
  __typename?: 'SchemaFieldURL';
  defaultValue?: Maybe<Scalars['Any']['output']>;
};

export type SchemaFieldUrlInput = {
  defaultValue?: InputMaybe<Scalars['Any']['input']>;
};

export type SchemaMarkdownTextInput = {
  defaultValue?: InputMaybe<Scalars['Any']['input']>;
  maxLength?: InputMaybe<Scalars['Int']['input']>;
};

export type SearchItemInput = {
  filter?: InputMaybe<ConditionInput>;
  pagination?: InputMaybe<Pagination>;
  query: ItemQueryInput;
  sort?: InputMaybe<ItemSortInput>;
};

export type Sort = {
  key: Scalars['String']['input'];
  reverted?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type StringFieldCondition = {
  __typename?: 'StringFieldCondition';
  fieldId: FieldSelector;
  operator: StringOperator;
  value: Scalars['String']['output'];
};

export type StringFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: StringOperator;
  value: Scalars['String']['input'];
};

export enum StringOperator {
  Contains = 'CONTAINS',
  EndsWith = 'ENDS_WITH',
  NotContains = 'NOT_CONTAINS',
  NotEndsWith = 'NOT_ENDS_WITH',
  NotStartsWith = 'NOT_STARTS_WITH',
  StartsWith = 'STARTS_WITH'
}

export type TerrainResource = {
  __typename?: 'TerrainResource';
  id: Scalars['ID']['output'];
  props?: Maybe<CesiumResourceProps>;
  type: TerrainType;
};

export type TerrainResourceInput = {
  id: Scalars['ID']['input'];
  props?: InputMaybe<CesiumResourcePropsInput>;
  type: TerrainType;
};

export enum TerrainType {
  ArcGisTerrain = 'ARC_GIS_TERRAIN',
  CesiumIon = 'CESIUM_ION',
  CesiumWorldTerrain = 'CESIUM_WORLD_TERRAIN'
}

export enum Theme {
  Dark = 'DARK',
  Default = 'DEFAULT',
  Light = 'LIGHT'
}

export type Thread = {
  __typename?: 'Thread';
  comments: Array<Comment>;
  id: Scalars['ID']['output'];
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars['ID']['output'];
};

export type TileResource = {
  __typename?: 'TileResource';
  id: Scalars['ID']['output'];
  props?: Maybe<UrlResourceProps>;
  type: TileType;
};

export type TileResourceInput = {
  id: Scalars['ID']['input'];
  props?: InputMaybe<UrlResourcePropsInput>;
  type: TileType;
};

export enum TileType {
  Default = 'DEFAULT',
  EarthAtNight = 'EARTH_AT_NIGHT',
  EsriTopography = 'ESRI_TOPOGRAPHY',
  JapanGsiStandardMap = 'JAPAN_GSI_STANDARD_MAP',
  Labelled = 'LABELLED',
  OpenStreetMap = 'OPEN_STREET_MAP',
  RoadMap = 'ROAD_MAP',
  Url = 'URL'
}

export type TimeFieldCondition = {
  __typename?: 'TimeFieldCondition';
  fieldId: FieldSelector;
  operator: TimeOperator;
  value: Scalars['DateTime']['output'];
};

export type TimeFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: TimeOperator;
  value: Scalars['DateTime']['input'];
};

export enum TimeOperator {
  After = 'AFTER',
  AfterOrOn = 'AFTER_OR_ON',
  Before = 'BEFORE',
  BeforeOrOn = 'BEFORE_OR_ON',
  OfThisMonth = 'OF_THIS_MONTH',
  OfThisWeek = 'OF_THIS_WEEK',
  OfThisYear = 'OF_THIS_YEAR'
}

export type UnpublishItemInput = {
  itemIds: Array<Scalars['ID']['input']>;
};

export type UnpublishItemPayload = {
  __typename?: 'UnpublishItemPayload';
  items: Array<Item>;
};

export type UpdateAssetInput = {
  id: Scalars['ID']['input'];
  previewType?: InputMaybe<PreviewType>;
};

export type UpdateAssetPayload = {
  __typename?: 'UpdateAssetPayload';
  asset: Asset;
};

export type UpdateCommentInput = {
  commentId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
  threadId: Scalars['ID']['input'];
};

export type UpdateFieldInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  fieldId: Scalars['ID']['input'];
  groupId?: InputMaybe<Scalars['ID']['input']>;
  isTitle?: InputMaybe<Scalars['Boolean']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['Boolean']['input']>;
  modelId?: InputMaybe<Scalars['ID']['input']>;
  multiple?: InputMaybe<Scalars['Boolean']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  required?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  typeProperty?: InputMaybe<SchemaFieldTypePropertyInput>;
  unique?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateGroupInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  groupId: Scalars['ID']['input'];
  key?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateGroupsOrderInput = {
  groupIds: Array<Scalars['ID']['input']>;
};

export type UpdateIntegrationInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  integrationId: Scalars['ID']['input'];
  logoUrl?: InputMaybe<Scalars['URL']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateIntegrationOfWorkspaceInput = {
  integrationId: Scalars['ID']['input'];
  role: Role;
  workspaceId: Scalars['ID']['input'];
};

export type UpdateItemInput = {
  fields: Array<ItemFieldInput>;
  itemId: Scalars['ID']['input'];
  metadataId?: InputMaybe<Scalars['ID']['input']>;
  originalId?: InputMaybe<Scalars['ID']['input']>;
  version?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMeInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  lang?: InputMaybe<Scalars['Lang']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  passwordConfirmation?: InputMaybe<Scalars['String']['input']>;
  theme?: InputMaybe<Theme>;
};

export type UpdateMePayload = {
  __typename?: 'UpdateMePayload';
  me: Me;
};

export type UpdateMemberOfWorkspacePayload = {
  __typename?: 'UpdateMemberOfWorkspacePayload';
  workspace: Workspace;
};

export type UpdateModelInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  modelId: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  public: Scalars['Boolean']['input'];
};

export type UpdateModelsOrderInput = {
  modelIds: Array<Scalars['ID']['input']>;
};

export type UpdateProjectInput = {
  alias?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['ID']['input'];
  publication?: InputMaybe<UpdateProjectPublicationInput>;
  requestRoles?: InputMaybe<Array<Role>>;
};

export type UpdateProjectPublicationInput = {
  assetPublic?: InputMaybe<Scalars['Boolean']['input']>;
  scope?: InputMaybe<ProjectPublicationScope>;
};

export type UpdateRequestInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  items?: InputMaybe<Array<RequestItemInput>>;
  requestId: Scalars['ID']['input'];
  reviewersId?: InputMaybe<Array<Scalars['ID']['input']>>;
  state?: InputMaybe<RequestState>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserOfWorkspaceInput = {
  role: Role;
  userId: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type UpdateViewInput = {
  columns?: InputMaybe<Array<ColumnSelectionInput>>;
  filter?: InputMaybe<ConditionInput>;
  name?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<ItemSortInput>;
  viewId: Scalars['ID']['input'];
};

export type UpdateViewsOrderInput = {
  viewIds: Array<Scalars['ID']['input']>;
};

export type UpdateWebhookInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  integrationId: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  secret?: InputMaybe<Scalars['String']['input']>;
  trigger?: InputMaybe<WebhookTriggerInput>;
  url?: InputMaybe<Scalars['URL']['input']>;
  webhookId: Scalars['ID']['input'];
};

export type UpdateWorkspaceInput = {
  name: Scalars['String']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type UpdateWorkspacePayload = {
  __typename?: 'UpdateWorkspacePayload';
  workspace: Workspace;
};

export type UpdateWorkspaceSettingsInput = {
  id: Scalars['ID']['input'];
  terrains?: InputMaybe<ResourcesListInput>;
  tiles?: InputMaybe<ResourcesListInput>;
};

export type UpdateWorkspaceSettingsPayload = {
  __typename?: 'UpdateWorkspaceSettingsPayload';
  workspaceSettings: WorkspaceSettings;
};

export type UrlResourceProps = {
  __typename?: 'UrlResourceProps';
  image: Scalars['String']['output'];
  name: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type UrlResourcePropsInput = {
  image: Scalars['String']['input'];
  name: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export type User = Node & {
  __typename?: 'User';
  email: Scalars['String']['output'];
  host?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type VersionedItem = {
  __typename?: 'VersionedItem';
  parents?: Maybe<Array<Scalars['String']['output']>>;
  refs: Array<Scalars['String']['output']>;
  value: Item;
  version: Scalars['String']['output'];
};

export type View = Node & {
  __typename?: 'View';
  columns?: Maybe<Array<Column>>;
  filter?: Maybe<Condition>;
  id: Scalars['ID']['output'];
  modelId: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  projectId: Scalars['ID']['output'];
  sort?: Maybe<ItemSort>;
};

export type ViewPayload = {
  __typename?: 'ViewPayload';
  view: View;
};

export type ViewsPayload = {
  __typename?: 'ViewsPayload';
  views: Array<View>;
};

export type Webhook = {
  __typename?: 'Webhook';
  active: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  secret: Scalars['String']['output'];
  trigger: WebhookTrigger;
  updatedAt: Scalars['DateTime']['output'];
  url: Scalars['URL']['output'];
};

export type WebhookPayload = {
  __typename?: 'WebhookPayload';
  webhook: Webhook;
};

export type WebhookTrigger = {
  __typename?: 'WebhookTrigger';
  onAssetDecompress?: Maybe<Scalars['Boolean']['output']>;
  onAssetDelete?: Maybe<Scalars['Boolean']['output']>;
  onAssetUpload?: Maybe<Scalars['Boolean']['output']>;
  onItemCreate?: Maybe<Scalars['Boolean']['output']>;
  onItemDelete?: Maybe<Scalars['Boolean']['output']>;
  onItemPublish?: Maybe<Scalars['Boolean']['output']>;
  onItemUnPublish?: Maybe<Scalars['Boolean']['output']>;
  onItemUpdate?: Maybe<Scalars['Boolean']['output']>;
};

export type WebhookTriggerInput = {
  onAssetDecompress?: InputMaybe<Scalars['Boolean']['input']>;
  onAssetDelete?: InputMaybe<Scalars['Boolean']['input']>;
  onAssetUpload?: InputMaybe<Scalars['Boolean']['input']>;
  onItemCreate?: InputMaybe<Scalars['Boolean']['input']>;
  onItemDelete?: InputMaybe<Scalars['Boolean']['input']>;
  onItemPublish?: InputMaybe<Scalars['Boolean']['input']>;
  onItemUnPublish?: InputMaybe<Scalars['Boolean']['input']>;
  onItemUpdate?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Workspace = Node & {
  __typename?: 'Workspace';
  id: Scalars['ID']['output'];
  members: Array<WorkspaceMember>;
  name: Scalars['String']['output'];
  personal: Scalars['Boolean']['output'];
};

export type WorkspaceIntegrationMember = {
  __typename?: 'WorkspaceIntegrationMember';
  active: Scalars['Boolean']['output'];
  integration?: Maybe<Integration>;
  integrationId: Scalars['ID']['output'];
  invitedBy?: Maybe<User>;
  invitedById: Scalars['ID']['output'];
  role: Role;
};

export type WorkspaceMember = WorkspaceIntegrationMember | WorkspaceUserMember;

export type WorkspaceSettings = Node & {
  __typename?: 'WorkspaceSettings';
  id: Scalars['ID']['output'];
  terrains?: Maybe<ResourceList>;
  tiles?: Maybe<ResourceList>;
};

export type WorkspaceUserMember = {
  __typename?: 'WorkspaceUserMember';
  host?: Maybe<Scalars['String']['output']>;
  role: Role;
  user?: Maybe<User>;
  userId: Scalars['ID']['output'];
};

export type AssetFragmentFragment = { __typename?: 'Asset', id: string, fileName: string, projectId: string, createdAt: Date, size: number, previewType?: PreviewType | null, uuid: string, url: string, archiveExtractionStatus?: ArchiveExtractionStatus | null, createdBy: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | { __typename?: 'User', id: string, name: string, email: string }, thread?: { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> } | null };

export type AssetFileFragmentFragment = { __typename?: 'AssetFile', name: string, path: string, filePaths?: Array<string> | null };

export type IntegrationFragmentFragment = { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null };

export type RequestFragmentFragment = { __typename?: 'Request', id: string, title: string, description?: string | null, workspaceId: string, projectId: string, threadId?: string | null, reviewersId: Array<string>, state: RequestState, createdAt: Date, updatedAt: Date, approvedAt?: Date | null, closedAt?: Date | null, items: Array<{ __typename?: 'RequestItem', itemId: string, version?: string | null, ref?: string | null, item?: { __typename?: 'VersionedItem', version: string, parents?: Array<string> | null, refs: Array<string>, value: { __typename?: 'Item', id: string, title?: string | null, schemaId: string, modelId: string, model: { __typename?: 'Model', name: string }, fields: Array<{ __typename?: 'ItemField', schemaFieldId: string, type: SchemaFieldType, value?: any | null, itemGroupId?: string | null }>, referencedItems?: Array<{ __typename?: 'Item', id: string, title?: string | null, schemaId: string, status: ItemStatus, version: string, createdAt: Date, updatedAt: Date, createdBy?: { __typename?: 'Integration', name: string } | { __typename?: 'User', name: string } | null }> | null, schema: { __typename?: 'Schema', id: string, fields: Array<{ __typename?: 'SchemaField', id: string, type: SchemaFieldType, title: string, key: string, description?: string | null, required: boolean, unique: boolean, isTitle: boolean, multiple: boolean, typeProperty?: { __typename?: 'SchemaFieldAsset', assetDefaultValue?: any | null } | { __typename?: 'SchemaFieldBool', defaultValue?: any | null } | { __typename?: 'SchemaFieldCheckbox' } | { __typename?: 'SchemaFieldDate' } | { __typename?: 'SchemaFieldGeometryEditor' } | { __typename?: 'SchemaFieldGeometryObject' } | { __typename?: 'SchemaFieldGroup', groupId: string } | { __typename?: 'SchemaFieldInteger', min?: number | null, max?: number | null, integerDefaultValue?: any | null } | { __typename?: 'SchemaFieldMarkdown', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldNumber' } | { __typename?: 'SchemaFieldReference', modelId: string } | { __typename?: 'SchemaFieldRichText' } | { __typename?: 'SchemaFieldSelect', values: Array<string>, selectDefaultValue?: any | null } | { __typename?: 'SchemaFieldTag' } | { __typename?: 'SchemaFieldText', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldTextArea', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldURL', defaultValue?: any | null } | null }> } } } | null }>, createdBy?: { __typename?: 'User', id: string, name: string, email: string } | null, thread?: { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> } | null, project?: { __typename?: 'Project', id: string, name: string, createdAt: Date, updatedAt: Date } | null, reviewers: Array<{ __typename?: 'User', id: string, name: string, email: string }> };

export type ThreadFragmentFragment = { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> };

export type WorkspaceFragmentFragment = { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', integrationId: string, role: Role, active: boolean, invitedById: string, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> };

export type GetAssetsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<AssetSort>;
  pagination?: InputMaybe<Pagination>;
}>;


export type GetAssetsQuery = { __typename?: 'Query', assets: { __typename?: 'AssetConnection', totalCount: number, nodes: Array<{ __typename?: 'Asset', id: string, fileName: string, projectId: string, createdAt: Date, size: number, previewType?: PreviewType | null, uuid: string, url: string, archiveExtractionStatus?: ArchiveExtractionStatus | null, createdBy: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | { __typename?: 'User', id: string, name: string, email: string }, thread?: { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> } | null } | null>, pageInfo: { __typename?: 'PageInfo', startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetAssetsItemsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<AssetSort>;
  pagination?: InputMaybe<Pagination>;
}>;


export type GetAssetsItemsQuery = { __typename?: 'Query', assets: { __typename?: 'AssetConnection', totalCount: number, nodes: Array<{ __typename?: 'Asset', id: string, fileName: string, projectId: string, createdAt: Date, size: number, previewType?: PreviewType | null, uuid: string, url: string, archiveExtractionStatus?: ArchiveExtractionStatus | null, items?: Array<{ __typename?: 'AssetItem', itemId: string, modelId: string }> | null, createdBy: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | { __typename?: 'User', id: string, name: string, email: string }, thread?: { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> } | null } | null>, pageInfo: { __typename?: 'PageInfo', startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetAssetQueryVariables = Exact<{
  assetId: Scalars['ID']['input'];
}>;


export type GetAssetQuery = { __typename?: 'Query', node?: { __typename?: 'Asset', id: string, fileName: string, projectId: string, createdAt: Date, size: number, previewType?: PreviewType | null, uuid: string, url: string, archiveExtractionStatus?: ArchiveExtractionStatus | null, createdBy: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | { __typename?: 'User', id: string, name: string, email: string }, thread?: { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> } | null } | { __typename?: 'Group' } | { __typename?: 'Integration' } | { __typename?: 'Item' } | { __typename?: 'Model' } | { __typename?: 'Project' } | { __typename?: 'Request' } | { __typename?: 'Schema' } | { __typename?: 'User' } | { __typename?: 'View' } | { __typename?: 'Workspace' } | { __typename?: 'WorkspaceSettings' } | null };

export type GetAssetFileQueryVariables = Exact<{
  assetId: Scalars['ID']['input'];
}>;


export type GetAssetFileQuery = { __typename?: 'Query', assetFile: { __typename?: 'AssetFile', name: string, path: string, filePaths?: Array<string> | null } };

export type GetAssetItemQueryVariables = Exact<{
  assetId: Scalars['ID']['input'];
}>;


export type GetAssetItemQuery = { __typename?: 'Query', node?: { __typename?: 'Asset', id: string, fileName: string, projectId: string, createdAt: Date, size: number, previewType?: PreviewType | null, uuid: string, url: string, archiveExtractionStatus?: ArchiveExtractionStatus | null, items?: Array<{ __typename?: 'AssetItem', itemId: string, modelId: string }> | null, createdBy: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | { __typename?: 'User', id: string, name: string, email: string }, thread?: { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> } | null } | { __typename?: 'Group' } | { __typename?: 'Integration' } | { __typename?: 'Item' } | { __typename?: 'Model' } | { __typename?: 'Project' } | { __typename?: 'Request' } | { __typename?: 'Schema' } | { __typename?: 'User' } | { __typename?: 'View' } | { __typename?: 'Workspace' } | { __typename?: 'WorkspaceSettings' } | null };

export type CreateAssetMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
  file?: InputMaybe<Scalars['Upload']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  skipDecompression?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type CreateAssetMutation = { __typename?: 'Mutation', createAsset?: { __typename?: 'CreateAssetPayload', asset: { __typename?: 'Asset', id: string, fileName: string, projectId: string, createdAt: Date, size: number, previewType?: PreviewType | null, uuid: string, url: string, archiveExtractionStatus?: ArchiveExtractionStatus | null, createdBy: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | { __typename?: 'User', id: string, name: string, email: string }, thread?: { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> } | null } } | null };

export type UpdateAssetMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  previewType?: InputMaybe<PreviewType>;
}>;


export type UpdateAssetMutation = { __typename?: 'Mutation', updateAsset?: { __typename?: 'UpdateAssetPayload', asset: { __typename?: 'Asset', id: string, fileName: string, projectId: string, createdAt: Date, size: number, previewType?: PreviewType | null, uuid: string, url: string, archiveExtractionStatus?: ArchiveExtractionStatus | null, createdBy: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | { __typename?: 'User', id: string, name: string, email: string }, thread?: { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> } | null } } | null };

export type DeleteAssetMutationVariables = Exact<{
  assetId: Scalars['ID']['input'];
}>;


export type DeleteAssetMutation = { __typename?: 'Mutation', deleteAsset?: { __typename?: 'DeleteAssetPayload', assetId: string } | null };

export type DecompressAssetMutationVariables = Exact<{
  assetId: Scalars['ID']['input'];
}>;


export type DecompressAssetMutation = { __typename?: 'Mutation', decompressAsset?: { __typename?: 'DecompressAssetPayload', asset: { __typename?: 'Asset', id: string, fileName: string, projectId: string, createdAt: Date, size: number, previewType?: PreviewType | null, uuid: string, url: string, archiveExtractionStatus?: ArchiveExtractionStatus | null, createdBy: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | { __typename?: 'User', id: string, name: string, email: string }, thread?: { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> } | null } } | null };

export type CreateAssetUploadMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
  filename: Scalars['String']['input'];
  cursor: Scalars['String']['input'];
  contentLength: Scalars['Int']['input'];
  contentEncoding?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateAssetUploadMutation = { __typename?: 'Mutation', createAssetUpload?: { __typename?: 'CreateAssetUploadPayload', url: string, token: string, contentType?: string | null, contentLength: number, contentEncoding?: string | null, next?: string | null } | null };

export type AddCommentMutationVariables = Exact<{
  threadId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
}>;


export type AddCommentMutation = { __typename?: 'Mutation', addComment?: { __typename?: 'CommentPayload', comment: { __typename?: 'Comment', id: string, authorType: OperatorType, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null } } | null };

export type UpdateCommentMutationVariables = Exact<{
  commentId: Scalars['ID']['input'];
  threadId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
}>;


export type UpdateCommentMutation = { __typename?: 'Mutation', updateComment?: { __typename?: 'CommentPayload', comment: { __typename?: 'Comment', id: string, authorType: OperatorType, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null } } | null };

export type DeleteCommentMutationVariables = Exact<{
  commentId: Scalars['ID']['input'];
  threadId: Scalars['ID']['input'];
}>;


export type DeleteCommentMutation = { __typename?: 'Mutation', deleteComment?: { __typename?: 'DeleteCommentPayload', commentId: string } | null };

export type CreateFieldMutationVariables = Exact<{
  modelId?: InputMaybe<Scalars['ID']['input']>;
  groupId?: InputMaybe<Scalars['ID']['input']>;
  type: SchemaFieldType;
  title: Scalars['String']['input'];
  metadata?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  key: Scalars['String']['input'];
  multiple: Scalars['Boolean']['input'];
  unique: Scalars['Boolean']['input'];
  isTitle: Scalars['Boolean']['input'];
  required: Scalars['Boolean']['input'];
  typeProperty: SchemaFieldTypePropertyInput;
}>;


export type CreateFieldMutation = { __typename?: 'Mutation', createField?: { __typename?: 'FieldPayload', field: { __typename?: 'SchemaField', id: string } } | null };

export type UpdateFieldMutationVariables = Exact<{
  modelId?: InputMaybe<Scalars['ID']['input']>;
  groupId?: InputMaybe<Scalars['ID']['input']>;
  fieldId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
  metadata?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  key: Scalars['String']['input'];
  multiple: Scalars['Boolean']['input'];
  unique: Scalars['Boolean']['input'];
  isTitle: Scalars['Boolean']['input'];
  required: Scalars['Boolean']['input'];
  typeProperty: SchemaFieldTypePropertyInput;
}>;


export type UpdateFieldMutation = { __typename?: 'Mutation', updateField?: { __typename?: 'FieldPayload', field: { __typename?: 'SchemaField', id: string } } | null };

export type UpdateFieldsMutationVariables = Exact<{
  updateFieldInput: Array<UpdateFieldInput> | UpdateFieldInput;
}>;


export type UpdateFieldsMutation = { __typename?: 'Mutation', updateFields?: { __typename?: 'FieldsPayload', fields: Array<{ __typename?: 'SchemaField', id: string }> } | null };

export type DeleteFieldMutationVariables = Exact<{
  modelId?: InputMaybe<Scalars['ID']['input']>;
  groupId?: InputMaybe<Scalars['ID']['input']>;
  fieldId: Scalars['ID']['input'];
  metadata?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type DeleteFieldMutation = { __typename?: 'Mutation', deleteField?: { __typename?: 'DeleteFieldPayload', fieldId: string } | null };

export type GetGroupsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type GetGroupsQuery = { __typename?: 'Query', groups: Array<{ __typename?: 'Group', id: string, name: string, key: string, order: number } | null> };

export type GetGroupQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetGroupQuery = { __typename?: 'Query', node?: { __typename?: 'Asset' } | { __typename?: 'Group', id: string, schemaId: string, projectId: string, name: string, description: string, key: string, schema: { __typename?: 'Schema', id: string, fields: Array<{ __typename?: 'SchemaField', id: string, type: SchemaFieldType, title: string, key: string, description?: string | null, required: boolean, unique: boolean, isTitle: boolean, multiple: boolean, typeProperty?: { __typename?: 'SchemaFieldAsset', assetDefaultValue?: any | null } | { __typename?: 'SchemaFieldBool', defaultValue?: any | null } | { __typename?: 'SchemaFieldCheckbox' } | { __typename?: 'SchemaFieldDate', defaultValue?: any | null } | { __typename?: 'SchemaFieldGeometryEditor', defaultValue?: any | null, editorSupportedTypes: Array<GeometryEditorSupportedType> } | { __typename?: 'SchemaFieldGeometryObject', defaultValue?: any | null, objectSupportedTypes: Array<GeometryObjectSupportedType> } | { __typename?: 'SchemaFieldGroup' } | { __typename?: 'SchemaFieldInteger', min?: number | null, max?: number | null, integerDefaultValue?: any | null } | { __typename?: 'SchemaFieldMarkdown', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldNumber' } | { __typename?: 'SchemaFieldReference' } | { __typename?: 'SchemaFieldRichText' } | { __typename?: 'SchemaFieldSelect', values: Array<string>, selectDefaultValue?: any | null } | { __typename?: 'SchemaFieldTag' } | { __typename?: 'SchemaFieldText', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldTextArea', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldURL', defaultValue?: any | null } | null }> } } | { __typename?: 'Integration' } | { __typename?: 'Item' } | { __typename?: 'Model' } | { __typename?: 'Project' } | { __typename?: 'Request' } | { __typename?: 'Schema' } | { __typename?: 'User' } | { __typename?: 'View' } | { __typename?: 'Workspace' } | { __typename?: 'WorkspaceSettings' } | null };

export type CreateGroupMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  key: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateGroupMutation = { __typename?: 'Mutation', createGroup?: { __typename?: 'GroupPayload', group: { __typename?: 'Group', id: string } } | null };

export type UpdateGroupMutationVariables = Exact<{
  groupId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  key: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateGroupMutation = { __typename?: 'Mutation', updateGroup?: { __typename?: 'GroupPayload', group: { __typename?: 'Group', id: string } } | null };

export type DeleteGroupMutationVariables = Exact<{
  groupId: Scalars['ID']['input'];
}>;


export type DeleteGroupMutation = { __typename?: 'Mutation', deleteGroup?: { __typename?: 'DeleteGroupPayload', groupId: string } | null };

export type CheckGroupKeyAvailabilityQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  key: Scalars['String']['input'];
}>;


export type CheckGroupKeyAvailabilityQuery = { __typename?: 'Query', checkGroupKeyAvailability: { __typename?: 'KeyAvailability', key: string, available: boolean } };

export type ModelsByGroupQueryVariables = Exact<{
  groupId: Scalars['ID']['input'];
}>;


export type ModelsByGroupQuery = { __typename?: 'Query', modelsByGroup: Array<{ __typename?: 'Model', name: string } | null> };

export type UpdateGroupsOrderMutationVariables = Exact<{
  groupIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type UpdateGroupsOrderMutation = { __typename?: 'Mutation', updateGroupsOrder?: { __typename?: 'GroupsPayload', groups: Array<{ __typename?: 'Group', id: string }> } | null };

export type CreateIntegrationMutationVariables = Exact<{
  name: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  logoUrl: Scalars['URL']['input'];
  type: IntegrationType;
}>;


export type CreateIntegrationMutation = { __typename?: 'Mutation', createIntegration?: { __typename?: 'IntegrationPayload', integration: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType } } | null };

export type UpdateIntegrationMutationVariables = Exact<{
  integrationId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  logoUrl: Scalars['URL']['input'];
}>;


export type UpdateIntegrationMutation = { __typename?: 'Mutation', updateIntegration?: { __typename?: 'IntegrationPayload', integration: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType } } | null };

export type DeleteIntegrationMutationVariables = Exact<{
  integrationId: Scalars['ID']['input'];
}>;


export type DeleteIntegrationMutation = { __typename?: 'Mutation', deleteIntegration?: { __typename?: 'DeleteIntegrationPayload', integrationId: string } | null };

export type RegenerateIntegrationTokenMutationVariables = Exact<{
  integrationId: Scalars['ID']['input'];
}>;


export type RegenerateIntegrationTokenMutation = { __typename?: 'Mutation', regenerateIntegrationToken?: { __typename?: 'IntegrationPayload', integration: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType } } | null };

export type GetItemsQueryVariables = Exact<{
  query: ItemQueryInput;
  pagination?: InputMaybe<Pagination>;
}>;


export type GetItemsQuery = { __typename?: 'Query', searchItem: { __typename?: 'ItemConnection', totalCount: number, nodes: Array<{ __typename?: 'Item', id: string, title?: string | null, schemaId: string, createdAt: Date, updatedAt: Date, status: ItemStatus, version: string, referencedItems?: Array<{ __typename?: 'Item', id: string, title?: string | null, schemaId: string, status: ItemStatus, version: string, createdAt: Date, updatedAt: Date, createdBy?: { __typename?: 'Integration', name: string } | { __typename?: 'User', name: string } | null }> | null, createdBy?: { __typename?: 'Integration', name: string } | { __typename?: 'User', name: string } | null, fields: Array<{ __typename?: 'ItemField', schemaFieldId: string, itemGroupId?: string | null, type: SchemaFieldType, value?: any | null }>, thread?: { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> } | null, metadata?: { __typename?: 'Item', id: string, version: string, fields: Array<{ __typename?: 'ItemField', schemaFieldId: string, itemGroupId?: string | null, type: SchemaFieldType, value?: any | null }> } | null } | null> } };

export type GetItemQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetItemQuery = { __typename?: 'Query', node?: { __typename?: 'Asset' } | { __typename?: 'Group' } | { __typename?: 'Integration' } | { __typename?: 'Item', id: string, title?: string | null, schemaId: string, createdAt: Date, updatedAt: Date, status: ItemStatus, version: string, referencedItems?: Array<{ __typename?: 'Item', id: string, title?: string | null, schemaId: string, status: ItemStatus, version: string, createdAt: Date, updatedAt: Date, createdBy?: { __typename?: 'Integration', name: string } | { __typename?: 'User', name: string } | null }> | null, assets: Array<{ __typename?: 'Asset', id: string, url: string, fileName: string } | null>, createdBy?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string } | null, updatedBy?: { __typename?: 'Integration', name: string } | { __typename?: 'User', name: string } | null, fields: Array<{ __typename?: 'ItemField', schemaFieldId: string, itemGroupId?: string | null, type: SchemaFieldType, value?: any | null }>, metadata?: { __typename?: 'Item', id: string, version: string, fields: Array<{ __typename?: 'ItemField', schemaFieldId: string, type: SchemaFieldType, value?: any | null }> } | null, thread?: { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> } | null, requests?: Array<{ __typename?: 'Request', id: string, state: RequestState, title: string }> | null } | { __typename?: 'Model' } | { __typename?: 'Project' } | { __typename?: 'Request' } | { __typename?: 'Schema' } | { __typename?: 'User' } | { __typename?: 'View' } | { __typename?: 'Workspace' } | { __typename?: 'WorkspaceSettings' } | null };

export type IsItemReferencedQueryVariables = Exact<{
  itemId: Scalars['ID']['input'];
  correspondingFieldId: Scalars['ID']['input'];
}>;


export type IsItemReferencedQuery = { __typename?: 'Query', isItemReferenced: boolean };

export type VersionsByItemQueryVariables = Exact<{
  itemId: Scalars['ID']['input'];
}>;


export type VersionsByItemQuery = { __typename?: 'Query', versionsByItem: Array<{ __typename?: 'VersionedItem', version: string, refs: Array<string>, value: { __typename?: 'Item', id: string, version: string, modelId: string, status: ItemStatus, createdAt: Date, updatedAt: Date, createdBy?: { __typename?: 'Integration', name: string } | { __typename?: 'User', name: string } | null, updatedBy?: { __typename?: 'Integration', name: string } | { __typename?: 'User', name: string } | null, fields: Array<{ __typename?: 'ItemField', schemaFieldId: string, itemGroupId?: string | null, type: SchemaFieldType, value?: any | null }>, requests?: Array<{ __typename?: 'Request', id: string, title: string, state: RequestState, items: Array<{ __typename?: 'RequestItem', itemId: string, version?: string | null, item?: { __typename?: 'VersionedItem', value: { __typename?: 'Item', modelId: string } } | null }> }> | null } }> };

export type SearchItemQueryVariables = Exact<{
  searchItemInput: SearchItemInput;
}>;


export type SearchItemQuery = { __typename?: 'Query', searchItem: { __typename?: 'ItemConnection', totalCount: number, nodes: Array<{ __typename?: 'Item', id: string, title?: string | null, schemaId: string, createdAt: Date, updatedAt: Date, status: ItemStatus, version: string, referencedItems?: Array<{ __typename?: 'Item', id: string, title?: string | null, schemaId: string, status: ItemStatus, version: string, createdAt: Date, updatedAt: Date, createdBy?: { __typename?: 'Integration', name: string } | { __typename?: 'User', name: string } | null }> | null, assets: Array<{ __typename?: 'Asset', id: string, url: string } | null>, fields: Array<{ __typename?: 'ItemField', schemaFieldId: string, itemGroupId?: string | null, type: SchemaFieldType, value?: any | null }>, createdBy?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string } | null, updatedBy?: { __typename: 'Integration', name: string } | { __typename: 'User', name: string } | null, metadata?: { __typename?: 'Item', id: string, version: string, fields: Array<{ __typename?: 'ItemField', schemaFieldId: string, type: SchemaFieldType, value?: any | null }> } | null, thread?: { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> } | null } | null>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type CreateItemMutationVariables = Exact<{
  modelId: Scalars['ID']['input'];
  schemaId: Scalars['ID']['input'];
  metadataId?: InputMaybe<Scalars['ID']['input']>;
  fields: Array<ItemFieldInput> | ItemFieldInput;
}>;


export type CreateItemMutation = { __typename?: 'Mutation', createItem?: { __typename?: 'ItemPayload', item: { __typename?: 'Item', id: string, schemaId: string, version: string, fields: Array<{ __typename?: 'ItemField', value?: any | null, type: SchemaFieldType, schemaFieldId: string, itemGroupId?: string | null }>, referencedItems?: Array<{ __typename?: 'Item', id: string, title?: string | null, schemaId: string, status: ItemStatus, version: string, createdAt: Date, updatedAt: Date, createdBy?: { __typename?: 'Integration', name: string } | { __typename?: 'User', name: string } | null }> | null } } | null };

export type DeleteItemMutationVariables = Exact<{
  itemId: Scalars['ID']['input'];
}>;


export type DeleteItemMutation = { __typename?: 'Mutation', deleteItem?: { __typename?: 'DeleteItemPayload', itemId: string } | null };

export type UpdateItemMutationVariables = Exact<{
  itemId: Scalars['ID']['input'];
  fields: Array<ItemFieldInput> | ItemFieldInput;
  metadataId?: InputMaybe<Scalars['ID']['input']>;
  version: Scalars['String']['input'];
}>;


export type UpdateItemMutation = { __typename?: 'Mutation', updateItem?: { __typename?: 'ItemPayload', item: { __typename?: 'Item', id: string, schemaId: string, version: string, fields: Array<{ __typename?: 'ItemField', value?: any | null, type: SchemaFieldType, schemaFieldId: string, itemGroupId?: string | null }>, referencedItems?: Array<{ __typename?: 'Item', id: string, title?: string | null, schemaId: string, status: ItemStatus, version: string, createdAt: Date, updatedAt: Date, createdBy?: { __typename?: 'Integration', name: string } | { __typename?: 'User', name: string } | null }> | null } } | null };

export type UnpublishItemMutationVariables = Exact<{
  itemIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type UnpublishItemMutation = { __typename?: 'Mutation', unpublishItem?: { __typename?: 'UnpublishItemPayload', items: Array<{ __typename?: 'Item', id: string, version: string, referencedItems?: Array<{ __typename?: 'Item', id: string, title?: string | null, schemaId: string, status: ItemStatus, version: string, createdAt: Date, updatedAt: Date, createdBy?: { __typename?: 'Integration', name: string } | { __typename?: 'User', name: string } | null }> | null }> } | null };

export type PublishItemMutationVariables = Exact<{
  itemIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type PublishItemMutation = { __typename?: 'Mutation', publishItem?: { __typename?: 'PublishItemPayload', items: Array<{ __typename?: 'Item', id: string, version: string, referencedItems?: Array<{ __typename?: 'Item', id: string, title?: string | null, schemaId: string, status: ItemStatus, version: string, createdAt: Date, updatedAt: Date, createdBy?: { __typename?: 'Integration', name: string } | { __typename?: 'User', name: string } | null }> | null }> } | null };

export type GetModelsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  pagination?: InputMaybe<Pagination>;
}>;


export type GetModelsQuery = { __typename?: 'Query', models: { __typename?: 'ModelConnection', nodes: Array<{ __typename?: 'Model', id: string, name: string, description: string, key: string, public: boolean, order?: number | null, schema: { __typename?: 'Schema', id: string } } | null> } };

export type GetModelQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetModelQuery = { __typename?: 'Query', node?: { __typename?: 'Asset' } | { __typename?: 'Group' } | { __typename?: 'Integration' } | { __typename?: 'Item' } | { __typename?: 'Model', id: string, name: string, description: string, key: string, public: boolean, order?: number | null, metadataSchema?: { __typename?: 'Schema', id: string, fields: Array<{ __typename?: 'SchemaField', id: string, type: SchemaFieldType, title: string, key: string, description?: string | null, required: boolean, unique: boolean, isTitle: boolean, multiple: boolean, order?: number | null, typeProperty?: { __typename?: 'SchemaFieldAsset' } | { __typename?: 'SchemaFieldBool', defaultValue?: any | null } | { __typename?: 'SchemaFieldCheckbox', defaultValue?: any | null } | { __typename?: 'SchemaFieldDate', defaultValue?: any | null } | { __typename?: 'SchemaFieldGeometryEditor' } | { __typename?: 'SchemaFieldGeometryObject' } | { __typename?: 'SchemaFieldGroup' } | { __typename?: 'SchemaFieldInteger' } | { __typename?: 'SchemaFieldMarkdown' } | { __typename?: 'SchemaFieldNumber' } | { __typename?: 'SchemaFieldReference' } | { __typename?: 'SchemaFieldRichText' } | { __typename?: 'SchemaFieldSelect' } | { __typename?: 'SchemaFieldTag', selectDefaultValue?: any | null, tags: Array<{ __typename?: 'SchemaFieldTagValue', id: string, name: string, color: SchemaFieldTagColor }> } | { __typename?: 'SchemaFieldText', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldTextArea' } | { __typename?: 'SchemaFieldURL', defaultValue?: any | null } | null }> } | null, schema: { __typename?: 'Schema', id: string, fields: Array<{ __typename?: 'SchemaField', id: string, type: SchemaFieldType, title: string, key: string, description?: string | null, required: boolean, unique: boolean, isTitle: boolean, multiple: boolean, order?: number | null, typeProperty?: { __typename?: 'SchemaFieldAsset', assetDefaultValue?: any | null } | { __typename?: 'SchemaFieldBool', defaultValue?: any | null } | { __typename?: 'SchemaFieldCheckbox' } | { __typename?: 'SchemaFieldDate', defaultValue?: any | null } | { __typename?: 'SchemaFieldGeometryEditor', defaultValue?: any | null, editorSupportedTypes: Array<GeometryEditorSupportedType> } | { __typename?: 'SchemaFieldGeometryObject', defaultValue?: any | null, objectSupportedTypes: Array<GeometryObjectSupportedType> } | { __typename?: 'SchemaFieldGroup', groupId: string } | { __typename?: 'SchemaFieldInteger', min?: number | null, max?: number | null, integerDefaultValue?: any | null } | { __typename?: 'SchemaFieldMarkdown', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldNumber', defaultValue?: any | null, numberMin?: number | null, numberMax?: number | null } | { __typename?: 'SchemaFieldReference', modelId: string, schema: { __typename?: 'Schema', id: string, titleFieldId?: string | null }, correspondingField?: { __typename?: 'SchemaField', id: string, type: SchemaFieldType, title: string, key: string, description?: string | null, required: boolean, unique: boolean, multiple: boolean, order?: number | null } | null } | { __typename?: 'SchemaFieldRichText' } | { __typename?: 'SchemaFieldSelect', values: Array<string>, selectDefaultValue?: any | null } | { __typename?: 'SchemaFieldTag' } | { __typename?: 'SchemaFieldText', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldTextArea', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldURL', defaultValue?: any | null } | null }> } } | { __typename?: 'Project' } | { __typename?: 'Request' } | { __typename?: 'Schema' } | { __typename?: 'User' } | { __typename?: 'View' } | { __typename?: 'Workspace' } | { __typename?: 'WorkspaceSettings' } | null };

export type CreateModelMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateModelMutation = { __typename?: 'Mutation', createModel?: { __typename?: 'ModelPayload', model: { __typename?: 'Model', id: string, name: string } } | null };

export type DeleteModelMutationVariables = Exact<{
  modelId: Scalars['ID']['input'];
}>;


export type DeleteModelMutation = { __typename?: 'Mutation', deleteModel?: { __typename?: 'DeleteModelPayload', modelId: string } | null };

export type UpdateModelMutationVariables = Exact<{
  modelId: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  public: Scalars['Boolean']['input'];
}>;


export type UpdateModelMutation = { __typename?: 'Mutation', updateModel?: { __typename?: 'ModelPayload', model: { __typename?: 'Model', id: string, name: string } } | null };

export type PublishModelsMutationVariables = Exact<{
  models: Array<PublishModelInput> | PublishModelInput;
}>;


export type PublishModelsMutation = { __typename?: 'Mutation', publishModels?: { __typename?: 'PublishModelsPayload', models: Array<{ __typename?: 'PublishModelPayload', modelId: string, status: boolean }> } | null };

export type CheckModelKeyAvailabilityQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  key: Scalars['String']['input'];
}>;


export type CheckModelKeyAvailabilityQuery = { __typename?: 'Query', checkModelKeyAvailability: { __typename?: 'KeyAvailability', key: string, available: boolean } };

export type UpdateModelsOrderMutationVariables = Exact<{
  modelIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type UpdateModelsOrderMutation = { __typename?: 'Mutation', updateModelsOrder?: { __typename?: 'ModelsPayload', models: Array<{ __typename?: 'Model', id: string }> } | null };

export type GetProjectQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type GetProjectQuery = { __typename?: 'Query', node?: { __typename?: 'Asset', id: string } | { __typename?: 'Group', id: string } | { __typename?: 'Integration', id: string } | { __typename?: 'Item', id: string } | { __typename?: 'Model', id: string } | { __typename?: 'Project', name: string, description: string, alias: string, requestRoles?: Array<Role> | null, id: string, publication?: { __typename?: 'ProjectPublication', scope: ProjectPublicationScope, assetPublic: boolean, token?: string | null } | null } | { __typename?: 'Request', id: string } | { __typename?: 'Schema', id: string } | { __typename?: 'User', id: string } | { __typename?: 'View', id: string } | { __typename?: 'Workspace', id: string } | { __typename?: 'WorkspaceSettings', id: string } | null };

export type GetProjectsQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  pagination?: InputMaybe<Pagination>;
}>;


export type GetProjectsQuery = { __typename?: 'Query', projects: { __typename?: 'ProjectConnection', nodes: Array<{ __typename?: 'Project', id: string, name: string, description: string, alias: string, requestRoles?: Array<Role> | null, publication?: { __typename?: 'ProjectPublication', scope: ProjectPublicationScope, assetPublic: boolean } | null } | null> } };

export type CheckProjectAliasQueryVariables = Exact<{
  alias: Scalars['String']['input'];
}>;


export type CheckProjectAliasQuery = { __typename?: 'Query', checkProjectAlias: { __typename?: 'ProjectAliasAvailability', alias: string, available: boolean } };

export type CreateProjectMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  description: Scalars['String']['input'];
  alias: Scalars['String']['input'];
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', createProject?: { __typename?: 'ProjectPayload', project: { __typename?: 'Project', id: string, name: string, description: string, alias: string, publication?: { __typename?: 'ProjectPublication', scope: ProjectPublicationScope, assetPublic: boolean } | null } } | null };

export type DeleteProjectMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type DeleteProjectMutation = { __typename?: 'Mutation', deleteProject?: { __typename?: 'DeleteProjectPayload', projectId: string } | null };

export type UpdateProjectMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  alias?: InputMaybe<Scalars['String']['input']>;
  publication?: InputMaybe<UpdateProjectPublicationInput>;
  requestRoles?: InputMaybe<Array<Role> | Role>;
}>;


export type UpdateProjectMutation = { __typename?: 'Mutation', updateProject?: { __typename?: 'ProjectPayload', project: { __typename?: 'Project', id: string, name: string, description: string, alias: string, requestRoles?: Array<Role> | null, publication?: { __typename?: 'ProjectPublication', scope: ProjectPublicationScope, assetPublic: boolean } | null } } | null };

export type RegeneratePublicApiTokenMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type RegeneratePublicApiTokenMutation = { __typename?: 'Mutation', regeneratePublicApiToken?: { __typename?: 'ProjectPayload', project: { __typename?: 'Project', id: string } } | null };

export type GetRequestsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  key?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Array<RequestState> | RequestState>;
  pagination?: InputMaybe<Pagination>;
  createdBy?: InputMaybe<Scalars['ID']['input']>;
  reviewer?: InputMaybe<Scalars['ID']['input']>;
  sort?: InputMaybe<Sort>;
}>;


export type GetRequestsQuery = { __typename?: 'Query', requests: { __typename?: 'RequestConnection', totalCount: number, nodes: Array<{ __typename?: 'Request', id: string, title: string, description?: string | null, workspaceId: string, projectId: string, threadId?: string | null, reviewersId: Array<string>, state: RequestState, createdAt: Date, updatedAt: Date, approvedAt?: Date | null, closedAt?: Date | null, createdBy?: { __typename?: 'User', id: string, name: string, email: string } | null, reviewers: Array<{ __typename?: 'User', id: string, name: string, email: string }>, thread?: { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> } | null } | null> } };

export type GetModalRequestsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  key?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Array<RequestState> | RequestState>;
  pagination?: InputMaybe<Pagination>;
  createdBy?: InputMaybe<Scalars['ID']['input']>;
  reviewer?: InputMaybe<Scalars['ID']['input']>;
  sort?: InputMaybe<Sort>;
}>;


export type GetModalRequestsQuery = { __typename?: 'Query', requests: { __typename?: 'RequestConnection', totalCount: number, nodes: Array<{ __typename?: 'Request', id: string, title: string, description?: string | null, state: RequestState, createdAt: Date, createdBy?: { __typename?: 'User', name: string } | null, items: Array<{ __typename?: 'RequestItem', itemId: string, version?: string | null }>, reviewers: Array<{ __typename?: 'User', id: string, name: string }> } | null> } };

export type GetRequestQueryVariables = Exact<{
  requestId: Scalars['ID']['input'];
}>;


export type GetRequestQuery = { __typename?: 'Query', node?: { __typename?: 'Asset', id: string } | { __typename?: 'Group', id: string } | { __typename?: 'Integration', id: string } | { __typename?: 'Item', id: string } | { __typename?: 'Model', id: string } | { __typename?: 'Project', id: string } | { __typename?: 'Request', id: string, title: string, description?: string | null, workspaceId: string, projectId: string, threadId?: string | null, reviewersId: Array<string>, state: RequestState, createdAt: Date, updatedAt: Date, approvedAt?: Date | null, closedAt?: Date | null, items: Array<{ __typename?: 'RequestItem', itemId: string, version?: string | null, ref?: string | null, item?: { __typename?: 'VersionedItem', version: string, parents?: Array<string> | null, refs: Array<string>, value: { __typename?: 'Item', id: string, title?: string | null, schemaId: string, modelId: string, model: { __typename?: 'Model', name: string }, fields: Array<{ __typename?: 'ItemField', schemaFieldId: string, type: SchemaFieldType, value?: any | null, itemGroupId?: string | null }>, referencedItems?: Array<{ __typename?: 'Item', id: string, title?: string | null, schemaId: string, status: ItemStatus, version: string, createdAt: Date, updatedAt: Date, createdBy?: { __typename?: 'Integration', name: string } | { __typename?: 'User', name: string } | null }> | null, schema: { __typename?: 'Schema', id: string, fields: Array<{ __typename?: 'SchemaField', id: string, type: SchemaFieldType, title: string, key: string, description?: string | null, required: boolean, unique: boolean, isTitle: boolean, multiple: boolean, typeProperty?: { __typename?: 'SchemaFieldAsset', assetDefaultValue?: any | null } | { __typename?: 'SchemaFieldBool', defaultValue?: any | null } | { __typename?: 'SchemaFieldCheckbox' } | { __typename?: 'SchemaFieldDate' } | { __typename?: 'SchemaFieldGeometryEditor' } | { __typename?: 'SchemaFieldGeometryObject' } | { __typename?: 'SchemaFieldGroup', groupId: string } | { __typename?: 'SchemaFieldInteger', min?: number | null, max?: number | null, integerDefaultValue?: any | null } | { __typename?: 'SchemaFieldMarkdown', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldNumber' } | { __typename?: 'SchemaFieldReference', modelId: string } | { __typename?: 'SchemaFieldRichText' } | { __typename?: 'SchemaFieldSelect', values: Array<string>, selectDefaultValue?: any | null } | { __typename?: 'SchemaFieldTag' } | { __typename?: 'SchemaFieldText', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldTextArea', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldURL', defaultValue?: any | null } | null }> } } } | null }>, createdBy?: { __typename?: 'User', id: string, name: string, email: string } | null, thread?: { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> } | null, project?: { __typename?: 'Project', id: string, name: string, createdAt: Date, updatedAt: Date } | null, reviewers: Array<{ __typename?: 'User', id: string, name: string, email: string }> } | { __typename?: 'Schema', id: string } | { __typename?: 'User', id: string } | { __typename?: 'View', id: string } | { __typename?: 'Workspace', id: string } | { __typename?: 'WorkspaceSettings', id: string } | null };

export type CreateRequestMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<RequestState>;
  reviewersId?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
  items: Array<RequestItemInput> | RequestItemInput;
}>;


export type CreateRequestMutation = { __typename?: 'Mutation', createRequest?: { __typename?: 'RequestPayload', request: { __typename?: 'Request', id: string, title: string, description?: string | null, workspaceId: string, projectId: string, threadId?: string | null, reviewersId: Array<string>, state: RequestState, createdAt: Date, updatedAt: Date, approvedAt?: Date | null, closedAt?: Date | null, items: Array<{ __typename?: 'RequestItem', itemId: string, version?: string | null, ref?: string | null, item?: { __typename?: 'VersionedItem', version: string, parents?: Array<string> | null, refs: Array<string>, value: { __typename?: 'Item', id: string, title?: string | null, schemaId: string, modelId: string, model: { __typename?: 'Model', name: string }, fields: Array<{ __typename?: 'ItemField', schemaFieldId: string, type: SchemaFieldType, value?: any | null, itemGroupId?: string | null }>, referencedItems?: Array<{ __typename?: 'Item', id: string, title?: string | null, schemaId: string, status: ItemStatus, version: string, createdAt: Date, updatedAt: Date, createdBy?: { __typename?: 'Integration', name: string } | { __typename?: 'User', name: string } | null }> | null, schema: { __typename?: 'Schema', id: string, fields: Array<{ __typename?: 'SchemaField', id: string, type: SchemaFieldType, title: string, key: string, description?: string | null, required: boolean, unique: boolean, isTitle: boolean, multiple: boolean, typeProperty?: { __typename?: 'SchemaFieldAsset', assetDefaultValue?: any | null } | { __typename?: 'SchemaFieldBool', defaultValue?: any | null } | { __typename?: 'SchemaFieldCheckbox' } | { __typename?: 'SchemaFieldDate' } | { __typename?: 'SchemaFieldGeometryEditor' } | { __typename?: 'SchemaFieldGeometryObject' } | { __typename?: 'SchemaFieldGroup', groupId: string } | { __typename?: 'SchemaFieldInteger', min?: number | null, max?: number | null, integerDefaultValue?: any | null } | { __typename?: 'SchemaFieldMarkdown', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldNumber' } | { __typename?: 'SchemaFieldReference', modelId: string } | { __typename?: 'SchemaFieldRichText' } | { __typename?: 'SchemaFieldSelect', values: Array<string>, selectDefaultValue?: any | null } | { __typename?: 'SchemaFieldTag' } | { __typename?: 'SchemaFieldText', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldTextArea', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldURL', defaultValue?: any | null } | null }> } } } | null }>, createdBy?: { __typename?: 'User', id: string, name: string, email: string } | null, thread?: { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> } | null, project?: { __typename?: 'Project', id: string, name: string, createdAt: Date, updatedAt: Date } | null, reviewers: Array<{ __typename?: 'User', id: string, name: string, email: string }> } } | null };

export type UpdateRequestMutationVariables = Exact<{
  requestId: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<RequestState>;
  reviewersId?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
  items?: InputMaybe<Array<RequestItemInput> | RequestItemInput>;
}>;


export type UpdateRequestMutation = { __typename?: 'Mutation', updateRequest?: { __typename?: 'RequestPayload', request: { __typename?: 'Request', id: string, title: string, description?: string | null, workspaceId: string, projectId: string, threadId?: string | null, reviewersId: Array<string>, state: RequestState, createdAt: Date, updatedAt: Date, approvedAt?: Date | null, closedAt?: Date | null, items: Array<{ __typename?: 'RequestItem', itemId: string, version?: string | null, ref?: string | null, item?: { __typename?: 'VersionedItem', version: string, parents?: Array<string> | null, refs: Array<string>, value: { __typename?: 'Item', id: string, title?: string | null, schemaId: string, modelId: string, model: { __typename?: 'Model', name: string }, fields: Array<{ __typename?: 'ItemField', schemaFieldId: string, type: SchemaFieldType, value?: any | null, itemGroupId?: string | null }>, referencedItems?: Array<{ __typename?: 'Item', id: string, title?: string | null, schemaId: string, status: ItemStatus, version: string, createdAt: Date, updatedAt: Date, createdBy?: { __typename?: 'Integration', name: string } | { __typename?: 'User', name: string } | null }> | null, schema: { __typename?: 'Schema', id: string, fields: Array<{ __typename?: 'SchemaField', id: string, type: SchemaFieldType, title: string, key: string, description?: string | null, required: boolean, unique: boolean, isTitle: boolean, multiple: boolean, typeProperty?: { __typename?: 'SchemaFieldAsset', assetDefaultValue?: any | null } | { __typename?: 'SchemaFieldBool', defaultValue?: any | null } | { __typename?: 'SchemaFieldCheckbox' } | { __typename?: 'SchemaFieldDate' } | { __typename?: 'SchemaFieldGeometryEditor' } | { __typename?: 'SchemaFieldGeometryObject' } | { __typename?: 'SchemaFieldGroup', groupId: string } | { __typename?: 'SchemaFieldInteger', min?: number | null, max?: number | null, integerDefaultValue?: any | null } | { __typename?: 'SchemaFieldMarkdown', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldNumber' } | { __typename?: 'SchemaFieldReference', modelId: string } | { __typename?: 'SchemaFieldRichText' } | { __typename?: 'SchemaFieldSelect', values: Array<string>, selectDefaultValue?: any | null } | { __typename?: 'SchemaFieldTag' } | { __typename?: 'SchemaFieldText', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldTextArea', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldURL', defaultValue?: any | null } | null }> } } } | null }>, createdBy?: { __typename?: 'User', id: string, name: string, email: string } | null, thread?: { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> } | null, project?: { __typename?: 'Project', id: string, name: string, createdAt: Date, updatedAt: Date } | null, reviewers: Array<{ __typename?: 'User', id: string, name: string, email: string }> } } | null };

export type ApproveRequestMutationVariables = Exact<{
  requestId: Scalars['ID']['input'];
}>;


export type ApproveRequestMutation = { __typename?: 'Mutation', approveRequest?: { __typename?: 'RequestPayload', request: { __typename?: 'Request', id: string, title: string, description?: string | null, workspaceId: string, projectId: string, threadId?: string | null, reviewersId: Array<string>, state: RequestState, createdAt: Date, updatedAt: Date, approvedAt?: Date | null, closedAt?: Date | null, items: Array<{ __typename?: 'RequestItem', itemId: string, version?: string | null, ref?: string | null, item?: { __typename?: 'VersionedItem', version: string, parents?: Array<string> | null, refs: Array<string>, value: { __typename?: 'Item', id: string, title?: string | null, schemaId: string, modelId: string, model: { __typename?: 'Model', name: string }, fields: Array<{ __typename?: 'ItemField', schemaFieldId: string, type: SchemaFieldType, value?: any | null, itemGroupId?: string | null }>, referencedItems?: Array<{ __typename?: 'Item', id: string, title?: string | null, schemaId: string, status: ItemStatus, version: string, createdAt: Date, updatedAt: Date, createdBy?: { __typename?: 'Integration', name: string } | { __typename?: 'User', name: string } | null }> | null, schema: { __typename?: 'Schema', id: string, fields: Array<{ __typename?: 'SchemaField', id: string, type: SchemaFieldType, title: string, key: string, description?: string | null, required: boolean, unique: boolean, isTitle: boolean, multiple: boolean, typeProperty?: { __typename?: 'SchemaFieldAsset', assetDefaultValue?: any | null } | { __typename?: 'SchemaFieldBool', defaultValue?: any | null } | { __typename?: 'SchemaFieldCheckbox' } | { __typename?: 'SchemaFieldDate' } | { __typename?: 'SchemaFieldGeometryEditor' } | { __typename?: 'SchemaFieldGeometryObject' } | { __typename?: 'SchemaFieldGroup', groupId: string } | { __typename?: 'SchemaFieldInteger', min?: number | null, max?: number | null, integerDefaultValue?: any | null } | { __typename?: 'SchemaFieldMarkdown', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldNumber' } | { __typename?: 'SchemaFieldReference', modelId: string } | { __typename?: 'SchemaFieldRichText' } | { __typename?: 'SchemaFieldSelect', values: Array<string>, selectDefaultValue?: any | null } | { __typename?: 'SchemaFieldTag' } | { __typename?: 'SchemaFieldText', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldTextArea', defaultValue?: any | null, maxLength?: number | null } | { __typename?: 'SchemaFieldURL', defaultValue?: any | null } | null }> } } } | null }>, createdBy?: { __typename?: 'User', id: string, name: string, email: string } | null, thread?: { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> } | null, project?: { __typename?: 'Project', id: string, name: string, createdAt: Date, updatedAt: Date } | null, reviewers: Array<{ __typename?: 'User', id: string, name: string, email: string }> } } | null };

export type DeleteRequestMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
  requestsId: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type DeleteRequestMutation = { __typename?: 'Mutation', deleteRequest?: { __typename?: 'DeleteRequestPayload', requests: Array<string> } | null };

export type CreateThreadWithCommentMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  resourceId: Scalars['ID']['input'];
  resourceType: ResourceType;
  content: Scalars['String']['input'];
}>;


export type CreateThreadWithCommentMutation = { __typename?: 'Mutation', createThreadWithComment?: { __typename?: 'CommentPayload', thread: { __typename?: 'Thread', id: string, workspaceId: string, comments: Array<{ __typename?: 'Comment', id: string, authorType: OperatorType, authorId: string, content: string, createdAt: Date, author?: { __typename?: 'Integration', id: string, name: string } | { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type GetUserByNameOrEmailQueryVariables = Exact<{
  nameOrEmail: Scalars['String']['input'];
}>;


export type GetUserByNameOrEmailQuery = { __typename?: 'Query', userByNameOrEmail?: { __typename?: 'User', id: string, name: string, email: string } | null };

export type GetUsersQueryVariables = Exact<{
  keyword: Scalars['String']['input'];
}>;


export type GetUsersQuery = { __typename?: 'Query', userSearch: Array<{ __typename?: 'User', id: string, name: string, email: string }> };

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, name: string, email: string, lang: string, auths: Array<string>, myWorkspace?: { __typename?: 'Workspace', id: string, name: string } | null, workspaces: Array<{ __typename?: 'Workspace', id: string, name: string, members: Array<{ __typename?: 'WorkspaceIntegrationMember', integrationId: string, role: Role, active: boolean, invitedById: string, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> }>, integrations: Array<{ __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null }> } | null };

export type GetProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProfileQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, name: string, email: string, lang: string, theme: Theme, auths: Array<string>, myWorkspace?: { __typename?: 'Workspace', id: string, name: string } | null } | null };

export type GetLanguageQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLanguageQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, lang: string } | null };

export type GetThemeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetThemeQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, theme: Theme } | null };

export type UpdateMeMutationVariables = Exact<{
  name?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  lang?: InputMaybe<Scalars['Lang']['input']>;
  theme?: InputMaybe<Theme>;
  password?: InputMaybe<Scalars['String']['input']>;
  passwordConfirmation?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateMeMutation = { __typename?: 'Mutation', updateMe?: { __typename?: 'UpdateMePayload', me: { __typename?: 'Me', id: string, name: string, email: string, lang: string, theme: Theme, myWorkspace?: { __typename?: 'Workspace', id: string, name: string } | null } } | null };

export type DeleteMeMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type DeleteMeMutation = { __typename?: 'Mutation', deleteMe?: { __typename?: 'DeleteMePayload', userId: string } | null };

export type GetViewsQueryVariables = Exact<{
  modelId: Scalars['ID']['input'];
}>;


export type GetViewsQuery = { __typename: 'Query', view: Array<{ __typename: 'View', id: string, name: string, modelId: string, projectId: string, order: number, sort?: { __typename?: 'ItemSort', direction?: SortDirection | null, field: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | null, columns?: Array<{ __typename?: 'Column', visible: boolean, field: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } }> | null, filter?: { __typename?: 'AndCondition', conditions: Array<{ __typename: 'AndCondition' } | { __typename: 'BasicFieldCondition', basicOperator: BasicOperator, basicValue: any, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | { __typename: 'BoolFieldCondition', boolOperator: BoolOperator, boolValue: boolean, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | { __typename: 'MultipleFieldCondition', multipleOperator: MultipleOperator, multipleValue: Array<any>, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | { __typename: 'NullableFieldCondition', nullableOperator: NullableOperator, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | { __typename: 'NumberFieldCondition', numberOperator: NumberOperator, numberValue: number, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | { __typename: 'OrCondition' } | { __typename: 'StringFieldCondition', stringOperator: StringOperator, stringValue: string, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | { __typename: 'TimeFieldCondition', timeOperator: TimeOperator, timeValue: Date, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } }> } | { __typename?: 'BasicFieldCondition' } | { __typename?: 'BoolFieldCondition' } | { __typename?: 'MultipleFieldCondition' } | { __typename?: 'NullableFieldCondition' } | { __typename?: 'NumberFieldCondition' } | { __typename?: 'OrCondition' } | { __typename?: 'StringFieldCondition' } | { __typename?: 'TimeFieldCondition' } | null }> };

export type CreateViewMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
  modelId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  sort?: InputMaybe<ItemSortInput>;
  filter?: InputMaybe<ConditionInput>;
  columns?: InputMaybe<Array<ColumnSelectionInput> | ColumnSelectionInput>;
}>;


export type CreateViewMutation = { __typename?: 'Mutation', createView?: { __typename?: 'ViewPayload', view: { __typename: 'View', id: string, name: string, modelId: string, projectId: string, sort?: { __typename?: 'ItemSort', direction?: SortDirection | null, field: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | null, columns?: Array<{ __typename?: 'Column', visible: boolean, field: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } }> | null, filter?: { __typename?: 'AndCondition', conditions: Array<{ __typename: 'AndCondition' } | { __typename: 'BasicFieldCondition', basicOperator: BasicOperator, basicValue: any, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | { __typename: 'BoolFieldCondition', boolOperator: BoolOperator, boolValue: boolean, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | { __typename: 'MultipleFieldCondition', multipleOperator: MultipleOperator, multipleValue: Array<any>, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | { __typename: 'NullableFieldCondition', nullableOperator: NullableOperator, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | { __typename: 'NumberFieldCondition', numberOperator: NumberOperator, numberValue: number, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | { __typename: 'OrCondition' } | { __typename: 'StringFieldCondition', stringOperator: StringOperator, stringValue: string, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | { __typename: 'TimeFieldCondition', timeOperator: TimeOperator, timeValue: Date, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } }> } | { __typename?: 'BasicFieldCondition' } | { __typename?: 'BoolFieldCondition' } | { __typename?: 'MultipleFieldCondition' } | { __typename?: 'NullableFieldCondition' } | { __typename?: 'NumberFieldCondition' } | { __typename?: 'OrCondition' } | { __typename?: 'StringFieldCondition' } | { __typename?: 'TimeFieldCondition' } | null } } | null };

export type UpdateViewMutationVariables = Exact<{
  viewId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  sort?: InputMaybe<ItemSortInput>;
  filter?: InputMaybe<ConditionInput>;
  columns?: InputMaybe<Array<ColumnSelectionInput> | ColumnSelectionInput>;
}>;


export type UpdateViewMutation = { __typename?: 'Mutation', updateView?: { __typename?: 'ViewPayload', view: { __typename: 'View', id: string, name: string, modelId: string, projectId: string, sort?: { __typename?: 'ItemSort', direction?: SortDirection | null, field: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | null, columns?: Array<{ __typename?: 'Column', visible: boolean, field: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } }> | null, filter?: { __typename?: 'AndCondition', conditions: Array<{ __typename: 'AndCondition' } | { __typename: 'BasicFieldCondition', basicOperator: BasicOperator, basicValue: any, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | { __typename: 'BoolFieldCondition', boolOperator: BoolOperator, boolValue: boolean, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | { __typename: 'MultipleFieldCondition', multipleOperator: MultipleOperator, multipleValue: Array<any>, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | { __typename: 'NullableFieldCondition', nullableOperator: NullableOperator, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | { __typename: 'NumberFieldCondition', numberOperator: NumberOperator, numberValue: number, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | { __typename: 'OrCondition' } | { __typename: 'StringFieldCondition', stringOperator: StringOperator, stringValue: string, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } } | { __typename: 'TimeFieldCondition', timeOperator: TimeOperator, timeValue: Date, fieldId: { __typename?: 'FieldSelector', type: FieldType, id?: string | null } }> } | { __typename?: 'BasicFieldCondition' } | { __typename?: 'BoolFieldCondition' } | { __typename?: 'MultipleFieldCondition' } | { __typename?: 'NullableFieldCondition' } | { __typename?: 'NumberFieldCondition' } | { __typename?: 'OrCondition' } | { __typename?: 'StringFieldCondition' } | { __typename?: 'TimeFieldCondition' } | null } } | null };

export type DeleteViewMutationVariables = Exact<{
  viewId: Scalars['ID']['input'];
}>;


export type DeleteViewMutation = { __typename?: 'Mutation', deleteView?: { __typename?: 'DeleteViewPayload', viewId: string } | null };

export type UpdateViewsOrderMutationVariables = Exact<{
  viewIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type UpdateViewsOrderMutation = { __typename?: 'Mutation', updateViewsOrder?: { __typename?: 'ViewsPayload', views: Array<{ __typename?: 'View', id: string }> } | null };

export type CreateWebhookMutationVariables = Exact<{
  integrationId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  url: Scalars['URL']['input'];
  active: Scalars['Boolean']['input'];
  trigger: WebhookTriggerInput;
  secret: Scalars['String']['input'];
}>;


export type CreateWebhookMutation = { __typename?: 'Mutation', createWebhook?: { __typename?: 'WebhookPayload', webhook: { __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } } } | null };

export type UpdateWebhookMutationVariables = Exact<{
  integrationId: Scalars['ID']['input'];
  webhookId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  url: Scalars['URL']['input'];
  active: Scalars['Boolean']['input'];
  trigger: WebhookTriggerInput;
  secret?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateWebhookMutation = { __typename?: 'Mutation', updateWebhook?: { __typename?: 'WebhookPayload', webhook: { __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } } } | null };

export type DeleteWebhookMutationVariables = Exact<{
  integrationId: Scalars['ID']['input'];
  webhookId: Scalars['ID']['input'];
}>;


export type DeleteWebhookMutation = { __typename?: 'Mutation', deleteWebhook?: { __typename?: 'DeleteWebhookPayload', webhookId: string } | null };

export type GetWorkspacesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkspacesQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, name: string, myWorkspace?: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', integrationId: string, role: Role, active: boolean, invitedById: string, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } | null, workspaces: Array<{ __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', integrationId: string, role: Role, active: boolean, invitedById: string, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> }> } | null };

export type GetWorkspaceQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetWorkspaceQuery = { __typename?: 'Query', node?: { __typename?: 'Asset' } | { __typename?: 'Group' } | { __typename?: 'Integration' } | { __typename?: 'Item' } | { __typename?: 'Model' } | { __typename?: 'Project' } | { __typename?: 'Request' } | { __typename?: 'Schema' } | { __typename?: 'User' } | { __typename?: 'View' } | { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', integrationId: string, role: Role, active: boolean, invitedById: string, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } | { __typename?: 'WorkspaceSettings' } | null };

export type UpdateWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateWorkspaceMutation = { __typename?: 'Mutation', updateWorkspace?: { __typename?: 'UpdateWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', integrationId: string, role: Role, active: boolean, invitedById: string, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type DeleteWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
}>;


export type DeleteWorkspaceMutation = { __typename?: 'Mutation', deleteWorkspace?: { __typename?: 'DeleteWorkspacePayload', workspaceId: string } | null };

export type AddUsersToWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  users: Array<MemberInput> | MemberInput;
}>;


export type AddUsersToWorkspaceMutation = { __typename?: 'Mutation', addUsersToWorkspace?: { __typename?: 'AddUsersToWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', integrationId: string, role: Role, active: boolean, invitedById: string, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type UpdateMemberOfWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
  role: Role;
}>;


export type UpdateMemberOfWorkspaceMutation = { __typename?: 'Mutation', updateUserOfWorkspace?: { __typename?: 'UpdateMemberOfWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', integrationId: string, role: Role, active: boolean, invitedById: string, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type RemoveMultipleMembersFromWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  userIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type RemoveMultipleMembersFromWorkspaceMutation = { __typename?: 'Mutation', removeMultipleMembersFromWorkspace?: { __typename?: 'RemoveMultipleMembersFromWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', integrationId: string, role: Role, active: boolean, invitedById: string, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type AddIntegrationToWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  integrationId: Scalars['ID']['input'];
  role: Role;
}>;


export type AddIntegrationToWorkspaceMutation = { __typename?: 'Mutation', addIntegrationToWorkspace?: { __typename?: 'AddUsersToWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', integrationId: string, role: Role, active: boolean, invitedById: string, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type UpdateIntegrationOfWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  integrationId: Scalars['ID']['input'];
  role: Role;
}>;


export type UpdateIntegrationOfWorkspaceMutation = { __typename?: 'Mutation', updateIntegrationOfWorkspace?: { __typename?: 'UpdateMemberOfWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', integrationId: string, role: Role, active: boolean, invitedById: string, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type RemoveIntegrationFromWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  integrationId: Scalars['ID']['input'];
}>;


export type RemoveIntegrationFromWorkspaceMutation = { __typename?: 'Mutation', removeIntegrationFromWorkspace?: { __typename?: 'RemoveIntegrationFromWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', integrationId: string, role: Role, active: boolean, invitedById: string, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type CreateWorkspaceMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateWorkspaceMutation = { __typename?: 'Mutation', createWorkspace?: { __typename?: 'CreateWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', integrationId: string, role: Role, active: boolean, invitedById: string, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, secret: string, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDecompress?: boolean | null, onAssetDelete?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type GetWorkspaceSettingsQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
}>;


export type GetWorkspaceSettingsQuery = { __typename?: 'Query', node?: { __typename?: 'Asset', id: string } | { __typename?: 'Group', id: string } | { __typename?: 'Integration', id: string } | { __typename?: 'Item', id: string } | { __typename?: 'Model', id: string } | { __typename?: 'Project', id: string } | { __typename?: 'Request', id: string } | { __typename?: 'Schema', id: string } | { __typename?: 'User', id: string } | { __typename?: 'View', id: string } | { __typename?: 'Workspace', id: string } | { __typename?: 'WorkspaceSettings', id: string, tiles?: { __typename?: 'ResourceList', enabled?: boolean | null, selectedResource?: string | null, resources: Array<{ __typename?: 'TerrainResource' } | { __typename?: 'TileResource', id: string, type: TileType, props?: { __typename?: 'UrlResourceProps', name: string, url: string, image: string } | null }> } | null, terrains?: { __typename?: 'ResourceList', enabled?: boolean | null, selectedResource?: string | null, resources: Array<{ __typename?: 'TerrainResource', id: string, type: TerrainType, props?: { __typename?: 'CesiumResourceProps', name: string, url: string, image: string, cesiumIonAssetId: string, cesiumIonAccessToken: string } | null } | { __typename?: 'TileResource' }> } | null } | null };

export type UpdateWorkspaceSettingsMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  tiles?: InputMaybe<ResourcesListInput>;
  terrains?: InputMaybe<ResourcesListInput>;
}>;


export type UpdateWorkspaceSettingsMutation = { __typename?: 'Mutation', updateWorkspaceSettings?: { __typename?: 'UpdateWorkspaceSettingsPayload', workspaceSettings: { __typename?: 'WorkspaceSettings', id: string, tiles?: { __typename?: 'ResourceList', enabled?: boolean | null, selectedResource?: string | null, resources: Array<{ __typename?: 'TerrainResource' } | { __typename?: 'TileResource', id: string, type: TileType, props?: { __typename?: 'UrlResourceProps', name: string, url: string, image: string } | null }> } | null, terrains?: { __typename?: 'ResourceList', enabled?: boolean | null, selectedResource?: string | null, resources: Array<{ __typename?: 'TerrainResource', id: string, type: TerrainType, props?: { __typename?: 'CesiumResourceProps', name: string, url: string, image: string, cesiumIonAssetId: string, cesiumIonAccessToken: string } | null } | { __typename?: 'TileResource' }> } | null } } | null };

export const IntegrationFragmentFragmentDoc = gql`
    fragment integrationFragment on Integration {
  id
  name
  description
  logoUrl
  iType
  developerId
  developer {
    id
    name
    email
  }
  config {
    token
    webhooks {
      id
      name
      url
      active
      secret
      trigger {
        onItemCreate
        onItemUpdate
        onItemDelete
        onItemPublish
        onItemUnPublish
        onAssetUpload
        onAssetDecompress
        onAssetDelete
      }
      createdAt
      updatedAt
    }
  }
  createdAt
  updatedAt
}
    `;
export const ThreadFragmentFragmentDoc = gql`
    fragment threadFragment on Thread {
  id
  workspaceId
  comments {
    id
    author {
      ... on User {
        id
        name
        email
      }
      ... on Integration {
        id
        name
      }
    }
    authorId
    content
    createdAt
  }
}
    `;
export const AssetFragmentFragmentDoc = gql`
    fragment assetFragment on Asset {
  id
  fileName
  projectId
  createdAt
  createdBy {
    ... on User {
      id
      name
      email
    }
    ... on Integration {
      ...integrationFragment
    }
  }
  size
  previewType
  uuid
  url
  thread {
    ...threadFragment
  }
  archiveExtractionStatus
}
    ${IntegrationFragmentFragmentDoc}
${ThreadFragmentFragmentDoc}`;
export const AssetFileFragmentFragmentDoc = gql`
    fragment assetFileFragment on AssetFile {
  name
  path
  filePaths
}
    `;
export const RequestFragmentFragmentDoc = gql`
    fragment requestFragment on Request {
  id
  items {
    itemId
    version
    ref
    item {
      version
      parents
      refs
      value {
        id
        title
        schemaId
        modelId
        model {
          name
        }
        fields {
          schemaFieldId
          type
          value
          itemGroupId
        }
        referencedItems {
          id
          title
          schemaId
          createdBy {
            ... on Integration {
              name
            }
            ... on User {
              name
            }
          }
          status
          version
          createdAt
          updatedAt
        }
        schema {
          id
          fields {
            id
            type
            title
            key
            description
            required
            unique
            isTitle
            multiple
            typeProperty {
              ... on SchemaFieldText {
                defaultValue
                maxLength
              }
              ... on SchemaFieldTextArea {
                defaultValue
                maxLength
              }
              ... on SchemaFieldMarkdown {
                defaultValue
                maxLength
              }
              ... on SchemaFieldAsset {
                assetDefaultValue: defaultValue
              }
              ... on SchemaFieldSelect {
                selectDefaultValue: defaultValue
                values
              }
              ... on SchemaFieldInteger {
                integerDefaultValue: defaultValue
                min
                max
              }
              ... on SchemaFieldBool {
                defaultValue
              }
              ... on SchemaFieldURL {
                defaultValue
              }
              ... on SchemaFieldReference {
                modelId
              }
              ... on SchemaFieldGroup {
                groupId
              }
            }
          }
        }
      }
    }
  }
  title
  description
  createdBy {
    id
    name
    email
  }
  workspaceId
  projectId
  threadId
  reviewersId
  state
  createdAt
  updatedAt
  approvedAt
  closedAt
  thread {
    ...threadFragment
  }
  project {
    id
    name
    createdAt
    updatedAt
  }
  reviewers {
    id
    name
    email
  }
}
    ${ThreadFragmentFragmentDoc}`;
export const WorkspaceFragmentFragmentDoc = gql`
    fragment WorkspaceFragment on Workspace {
  id
  name
  members {
    ... on WorkspaceUserMember {
      user {
        id
        name
        email
      }
      userId
      role
    }
    ... on WorkspaceIntegrationMember {
      integrationId
      integration {
        ...integrationFragment
      }
      role
      active
      invitedBy {
        id
        name
        email
      }
      invitedById
    }
  }
  personal
}
    ${IntegrationFragmentFragmentDoc}`;
export const GetAssetsDocument = gql`
    query GetAssets($projectId: ID!, $keyword: String, $sort: AssetSort, $pagination: Pagination) {
  assets(
    projectId: $projectId
    keyword: $keyword
    sort: $sort
    pagination: $pagination
  ) {
    nodes {
      ...assetFragment
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
    totalCount
  }
}
    ${AssetFragmentFragmentDoc}`;

/**
 * __useGetAssetsQuery__
 *
 * To run a query within a React component, call `useGetAssetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssetsQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      keyword: // value for 'keyword'
 *      sort: // value for 'sort'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetAssetsQuery(baseOptions: Apollo.QueryHookOptions<GetAssetsQuery, GetAssetsQueryVariables> & ({ variables: GetAssetsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAssetsQuery, GetAssetsQueryVariables>(GetAssetsDocument, options);
      }
export function useGetAssetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAssetsQuery, GetAssetsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAssetsQuery, GetAssetsQueryVariables>(GetAssetsDocument, options);
        }
export function useGetAssetsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAssetsQuery, GetAssetsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAssetsQuery, GetAssetsQueryVariables>(GetAssetsDocument, options);
        }
export type GetAssetsQueryHookResult = ReturnType<typeof useGetAssetsQuery>;
export type GetAssetsLazyQueryHookResult = ReturnType<typeof useGetAssetsLazyQuery>;
export type GetAssetsSuspenseQueryHookResult = ReturnType<typeof useGetAssetsSuspenseQuery>;
export type GetAssetsQueryResult = Apollo.QueryResult<GetAssetsQuery, GetAssetsQueryVariables>;
export const GetAssetsItemsDocument = gql`
    query GetAssetsItems($projectId: ID!, $keyword: String, $sort: AssetSort, $pagination: Pagination) {
  assets(
    projectId: $projectId
    keyword: $keyword
    sort: $sort
    pagination: $pagination
  ) {
    nodes {
      ...assetFragment
      items {
        itemId
        modelId
      }
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
    totalCount
  }
}
    ${AssetFragmentFragmentDoc}`;

/**
 * __useGetAssetsItemsQuery__
 *
 * To run a query within a React component, call `useGetAssetsItemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssetsItemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssetsItemsQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      keyword: // value for 'keyword'
 *      sort: // value for 'sort'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetAssetsItemsQuery(baseOptions: Apollo.QueryHookOptions<GetAssetsItemsQuery, GetAssetsItemsQueryVariables> & ({ variables: GetAssetsItemsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAssetsItemsQuery, GetAssetsItemsQueryVariables>(GetAssetsItemsDocument, options);
      }
export function useGetAssetsItemsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAssetsItemsQuery, GetAssetsItemsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAssetsItemsQuery, GetAssetsItemsQueryVariables>(GetAssetsItemsDocument, options);
        }
export function useGetAssetsItemsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAssetsItemsQuery, GetAssetsItemsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAssetsItemsQuery, GetAssetsItemsQueryVariables>(GetAssetsItemsDocument, options);
        }
export type GetAssetsItemsQueryHookResult = ReturnType<typeof useGetAssetsItemsQuery>;
export type GetAssetsItemsLazyQueryHookResult = ReturnType<typeof useGetAssetsItemsLazyQuery>;
export type GetAssetsItemsSuspenseQueryHookResult = ReturnType<typeof useGetAssetsItemsSuspenseQuery>;
export type GetAssetsItemsQueryResult = Apollo.QueryResult<GetAssetsItemsQuery, GetAssetsItemsQueryVariables>;
export const GetAssetDocument = gql`
    query GetAsset($assetId: ID!) {
  node(id: $assetId, type: ASSET) {
    ...assetFragment
  }
}
    ${AssetFragmentFragmentDoc}`;

/**
 * __useGetAssetQuery__
 *
 * To run a query within a React component, call `useGetAssetQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssetQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssetQuery({
 *   variables: {
 *      assetId: // value for 'assetId'
 *   },
 * });
 */
export function useGetAssetQuery(baseOptions: Apollo.QueryHookOptions<GetAssetQuery, GetAssetQueryVariables> & ({ variables: GetAssetQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAssetQuery, GetAssetQueryVariables>(GetAssetDocument, options);
      }
export function useGetAssetLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAssetQuery, GetAssetQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAssetQuery, GetAssetQueryVariables>(GetAssetDocument, options);
        }
export function useGetAssetSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAssetQuery, GetAssetQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAssetQuery, GetAssetQueryVariables>(GetAssetDocument, options);
        }
export type GetAssetQueryHookResult = ReturnType<typeof useGetAssetQuery>;
export type GetAssetLazyQueryHookResult = ReturnType<typeof useGetAssetLazyQuery>;
export type GetAssetSuspenseQueryHookResult = ReturnType<typeof useGetAssetSuspenseQuery>;
export type GetAssetQueryResult = Apollo.QueryResult<GetAssetQuery, GetAssetQueryVariables>;
export const GetAssetFileDocument = gql`
    query GetAssetFile($assetId: ID!) {
  assetFile(assetId: $assetId) {
    ...assetFileFragment
  }
}
    ${AssetFileFragmentFragmentDoc}`;

/**
 * __useGetAssetFileQuery__
 *
 * To run a query within a React component, call `useGetAssetFileQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssetFileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssetFileQuery({
 *   variables: {
 *      assetId: // value for 'assetId'
 *   },
 * });
 */
export function useGetAssetFileQuery(baseOptions: Apollo.QueryHookOptions<GetAssetFileQuery, GetAssetFileQueryVariables> & ({ variables: GetAssetFileQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAssetFileQuery, GetAssetFileQueryVariables>(GetAssetFileDocument, options);
      }
export function useGetAssetFileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAssetFileQuery, GetAssetFileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAssetFileQuery, GetAssetFileQueryVariables>(GetAssetFileDocument, options);
        }
export function useGetAssetFileSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAssetFileQuery, GetAssetFileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAssetFileQuery, GetAssetFileQueryVariables>(GetAssetFileDocument, options);
        }
export type GetAssetFileQueryHookResult = ReturnType<typeof useGetAssetFileQuery>;
export type GetAssetFileLazyQueryHookResult = ReturnType<typeof useGetAssetFileLazyQuery>;
export type GetAssetFileSuspenseQueryHookResult = ReturnType<typeof useGetAssetFileSuspenseQuery>;
export type GetAssetFileQueryResult = Apollo.QueryResult<GetAssetFileQuery, GetAssetFileQueryVariables>;
export const GetAssetItemDocument = gql`
    query GetAssetItem($assetId: ID!) {
  node(id: $assetId, type: ASSET) {
    ... on Asset {
      ...assetFragment
      items {
        itemId
        modelId
      }
    }
  }
}
    ${AssetFragmentFragmentDoc}`;

/**
 * __useGetAssetItemQuery__
 *
 * To run a query within a React component, call `useGetAssetItemQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssetItemQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssetItemQuery({
 *   variables: {
 *      assetId: // value for 'assetId'
 *   },
 * });
 */
export function useGetAssetItemQuery(baseOptions: Apollo.QueryHookOptions<GetAssetItemQuery, GetAssetItemQueryVariables> & ({ variables: GetAssetItemQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAssetItemQuery, GetAssetItemQueryVariables>(GetAssetItemDocument, options);
      }
export function useGetAssetItemLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAssetItemQuery, GetAssetItemQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAssetItemQuery, GetAssetItemQueryVariables>(GetAssetItemDocument, options);
        }
export function useGetAssetItemSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAssetItemQuery, GetAssetItemQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAssetItemQuery, GetAssetItemQueryVariables>(GetAssetItemDocument, options);
        }
export type GetAssetItemQueryHookResult = ReturnType<typeof useGetAssetItemQuery>;
export type GetAssetItemLazyQueryHookResult = ReturnType<typeof useGetAssetItemLazyQuery>;
export type GetAssetItemSuspenseQueryHookResult = ReturnType<typeof useGetAssetItemSuspenseQuery>;
export type GetAssetItemQueryResult = Apollo.QueryResult<GetAssetItemQuery, GetAssetItemQueryVariables>;
export const CreateAssetDocument = gql`
    mutation CreateAsset($projectId: ID!, $file: Upload, $token: String, $url: String, $skipDecompression: Boolean) {
  createAsset(
    input: {projectId: $projectId, file: $file, token: $token, url: $url, skipDecompression: $skipDecompression}
  ) {
    asset {
      ...assetFragment
    }
  }
}
    ${AssetFragmentFragmentDoc}`;
export type CreateAssetMutationFn = Apollo.MutationFunction<CreateAssetMutation, CreateAssetMutationVariables>;

/**
 * __useCreateAssetMutation__
 *
 * To run a mutation, you first call `useCreateAssetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAssetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAssetMutation, { data, loading, error }] = useCreateAssetMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      file: // value for 'file'
 *      token: // value for 'token'
 *      url: // value for 'url'
 *      skipDecompression: // value for 'skipDecompression'
 *   },
 * });
 */
export function useCreateAssetMutation(baseOptions?: Apollo.MutationHookOptions<CreateAssetMutation, CreateAssetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateAssetMutation, CreateAssetMutationVariables>(CreateAssetDocument, options);
      }
export type CreateAssetMutationHookResult = ReturnType<typeof useCreateAssetMutation>;
export type CreateAssetMutationResult = Apollo.MutationResult<CreateAssetMutation>;
export type CreateAssetMutationOptions = Apollo.BaseMutationOptions<CreateAssetMutation, CreateAssetMutationVariables>;
export const UpdateAssetDocument = gql`
    mutation UpdateAsset($id: ID!, $previewType: PreviewType) {
  updateAsset(input: {id: $id, previewType: $previewType}) {
    asset {
      ...assetFragment
    }
  }
}
    ${AssetFragmentFragmentDoc}`;
export type UpdateAssetMutationFn = Apollo.MutationFunction<UpdateAssetMutation, UpdateAssetMutationVariables>;

/**
 * __useUpdateAssetMutation__
 *
 * To run a mutation, you first call `useUpdateAssetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAssetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAssetMutation, { data, loading, error }] = useUpdateAssetMutation({
 *   variables: {
 *      id: // value for 'id'
 *      previewType: // value for 'previewType'
 *   },
 * });
 */
export function useUpdateAssetMutation(baseOptions?: Apollo.MutationHookOptions<UpdateAssetMutation, UpdateAssetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateAssetMutation, UpdateAssetMutationVariables>(UpdateAssetDocument, options);
      }
export type UpdateAssetMutationHookResult = ReturnType<typeof useUpdateAssetMutation>;
export type UpdateAssetMutationResult = Apollo.MutationResult<UpdateAssetMutation>;
export type UpdateAssetMutationOptions = Apollo.BaseMutationOptions<UpdateAssetMutation, UpdateAssetMutationVariables>;
export const DeleteAssetDocument = gql`
    mutation DeleteAsset($assetId: ID!) {
  deleteAsset(input: {assetId: $assetId}) {
    assetId
  }
}
    `;
export type DeleteAssetMutationFn = Apollo.MutationFunction<DeleteAssetMutation, DeleteAssetMutationVariables>;

/**
 * __useDeleteAssetMutation__
 *
 * To run a mutation, you first call `useDeleteAssetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAssetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAssetMutation, { data, loading, error }] = useDeleteAssetMutation({
 *   variables: {
 *      assetId: // value for 'assetId'
 *   },
 * });
 */
export function useDeleteAssetMutation(baseOptions?: Apollo.MutationHookOptions<DeleteAssetMutation, DeleteAssetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteAssetMutation, DeleteAssetMutationVariables>(DeleteAssetDocument, options);
      }
export type DeleteAssetMutationHookResult = ReturnType<typeof useDeleteAssetMutation>;
export type DeleteAssetMutationResult = Apollo.MutationResult<DeleteAssetMutation>;
export type DeleteAssetMutationOptions = Apollo.BaseMutationOptions<DeleteAssetMutation, DeleteAssetMutationVariables>;
export const DecompressAssetDocument = gql`
    mutation DecompressAsset($assetId: ID!) {
  decompressAsset(input: {assetId: $assetId}) {
    asset {
      ...assetFragment
    }
  }
}
    ${AssetFragmentFragmentDoc}`;
export type DecompressAssetMutationFn = Apollo.MutationFunction<DecompressAssetMutation, DecompressAssetMutationVariables>;

/**
 * __useDecompressAssetMutation__
 *
 * To run a mutation, you first call `useDecompressAssetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDecompressAssetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [decompressAssetMutation, { data, loading, error }] = useDecompressAssetMutation({
 *   variables: {
 *      assetId: // value for 'assetId'
 *   },
 * });
 */
export function useDecompressAssetMutation(baseOptions?: Apollo.MutationHookOptions<DecompressAssetMutation, DecompressAssetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DecompressAssetMutation, DecompressAssetMutationVariables>(DecompressAssetDocument, options);
      }
export type DecompressAssetMutationHookResult = ReturnType<typeof useDecompressAssetMutation>;
export type DecompressAssetMutationResult = Apollo.MutationResult<DecompressAssetMutation>;
export type DecompressAssetMutationOptions = Apollo.BaseMutationOptions<DecompressAssetMutation, DecompressAssetMutationVariables>;
export const CreateAssetUploadDocument = gql`
    mutation CreateAssetUpload($projectId: ID!, $filename: String!, $cursor: String!, $contentLength: Int!, $contentEncoding: String) {
  createAssetUpload(
    input: {projectId: $projectId, filename: $filename, cursor: $cursor, contentLength: $contentLength, contentEncoding: $contentEncoding}
  ) {
    url
    token
    contentType
    contentLength
    contentEncoding
    next
  }
}
    `;
export type CreateAssetUploadMutationFn = Apollo.MutationFunction<CreateAssetUploadMutation, CreateAssetUploadMutationVariables>;

/**
 * __useCreateAssetUploadMutation__
 *
 * To run a mutation, you first call `useCreateAssetUploadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAssetUploadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAssetUploadMutation, { data, loading, error }] = useCreateAssetUploadMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      filename: // value for 'filename'
 *      cursor: // value for 'cursor'
 *      contentLength: // value for 'contentLength'
 *      contentEncoding: // value for 'contentEncoding'
 *   },
 * });
 */
export function useCreateAssetUploadMutation(baseOptions?: Apollo.MutationHookOptions<CreateAssetUploadMutation, CreateAssetUploadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateAssetUploadMutation, CreateAssetUploadMutationVariables>(CreateAssetUploadDocument, options);
      }
export type CreateAssetUploadMutationHookResult = ReturnType<typeof useCreateAssetUploadMutation>;
export type CreateAssetUploadMutationResult = Apollo.MutationResult<CreateAssetUploadMutation>;
export type CreateAssetUploadMutationOptions = Apollo.BaseMutationOptions<CreateAssetUploadMutation, CreateAssetUploadMutationVariables>;
export const AddCommentDocument = gql`
    mutation AddComment($threadId: ID!, $content: String!) {
  addComment(input: {threadId: $threadId, content: $content}) {
    comment {
      id
      author {
        ... on User {
          id
          name
          email
        }
        ... on Integration {
          id
          name
        }
      }
      authorType
      authorId
      content
      createdAt
    }
  }
}
    `;
export type AddCommentMutationFn = Apollo.MutationFunction<AddCommentMutation, AddCommentMutationVariables>;

/**
 * __useAddCommentMutation__
 *
 * To run a mutation, you first call `useAddCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addCommentMutation, { data, loading, error }] = useAddCommentMutation({
 *   variables: {
 *      threadId: // value for 'threadId'
 *      content: // value for 'content'
 *   },
 * });
 */
export function useAddCommentMutation(baseOptions?: Apollo.MutationHookOptions<AddCommentMutation, AddCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddCommentMutation, AddCommentMutationVariables>(AddCommentDocument, options);
      }
export type AddCommentMutationHookResult = ReturnType<typeof useAddCommentMutation>;
export type AddCommentMutationResult = Apollo.MutationResult<AddCommentMutation>;
export type AddCommentMutationOptions = Apollo.BaseMutationOptions<AddCommentMutation, AddCommentMutationVariables>;
export const UpdateCommentDocument = gql`
    mutation UpdateComment($commentId: ID!, $threadId: ID!, $content: String!) {
  updateComment(
    input: {commentId: $commentId, threadId: $threadId, content: $content}
  ) {
    comment {
      id
      author {
        ... on User {
          id
          name
          email
        }
        ... on Integration {
          id
          name
        }
      }
      authorType
      authorId
      content
      createdAt
    }
  }
}
    `;
export type UpdateCommentMutationFn = Apollo.MutationFunction<UpdateCommentMutation, UpdateCommentMutationVariables>;

/**
 * __useUpdateCommentMutation__
 *
 * To run a mutation, you first call `useUpdateCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCommentMutation, { data, loading, error }] = useUpdateCommentMutation({
 *   variables: {
 *      commentId: // value for 'commentId'
 *      threadId: // value for 'threadId'
 *      content: // value for 'content'
 *   },
 * });
 */
export function useUpdateCommentMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCommentMutation, UpdateCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCommentMutation, UpdateCommentMutationVariables>(UpdateCommentDocument, options);
      }
export type UpdateCommentMutationHookResult = ReturnType<typeof useUpdateCommentMutation>;
export type UpdateCommentMutationResult = Apollo.MutationResult<UpdateCommentMutation>;
export type UpdateCommentMutationOptions = Apollo.BaseMutationOptions<UpdateCommentMutation, UpdateCommentMutationVariables>;
export const DeleteCommentDocument = gql`
    mutation DeleteComment($commentId: ID!, $threadId: ID!) {
  deleteComment(input: {commentId: $commentId, threadId: $threadId}) {
    commentId
  }
}
    `;
export type DeleteCommentMutationFn = Apollo.MutationFunction<DeleteCommentMutation, DeleteCommentMutationVariables>;

/**
 * __useDeleteCommentMutation__
 *
 * To run a mutation, you first call `useDeleteCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCommentMutation, { data, loading, error }] = useDeleteCommentMutation({
 *   variables: {
 *      commentId: // value for 'commentId'
 *      threadId: // value for 'threadId'
 *   },
 * });
 */
export function useDeleteCommentMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCommentMutation, DeleteCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCommentMutation, DeleteCommentMutationVariables>(DeleteCommentDocument, options);
      }
export type DeleteCommentMutationHookResult = ReturnType<typeof useDeleteCommentMutation>;
export type DeleteCommentMutationResult = Apollo.MutationResult<DeleteCommentMutation>;
export type DeleteCommentMutationOptions = Apollo.BaseMutationOptions<DeleteCommentMutation, DeleteCommentMutationVariables>;
export const CreateFieldDocument = gql`
    mutation CreateField($modelId: ID, $groupId: ID, $type: SchemaFieldType!, $title: String!, $metadata: Boolean, $description: String, $key: String!, $multiple: Boolean!, $unique: Boolean!, $isTitle: Boolean!, $required: Boolean!, $typeProperty: SchemaFieldTypePropertyInput!) {
  createField(
    input: {modelId: $modelId, groupId: $groupId, type: $type, title: $title, metadata: $metadata, description: $description, key: $key, multiple: $multiple, unique: $unique, isTitle: $isTitle, required: $required, typeProperty: $typeProperty}
  ) {
    field {
      id
    }
  }
}
    `;
export type CreateFieldMutationFn = Apollo.MutationFunction<CreateFieldMutation, CreateFieldMutationVariables>;

/**
 * __useCreateFieldMutation__
 *
 * To run a mutation, you first call `useCreateFieldMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateFieldMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createFieldMutation, { data, loading, error }] = useCreateFieldMutation({
 *   variables: {
 *      modelId: // value for 'modelId'
 *      groupId: // value for 'groupId'
 *      type: // value for 'type'
 *      title: // value for 'title'
 *      metadata: // value for 'metadata'
 *      description: // value for 'description'
 *      key: // value for 'key'
 *      multiple: // value for 'multiple'
 *      unique: // value for 'unique'
 *      isTitle: // value for 'isTitle'
 *      required: // value for 'required'
 *      typeProperty: // value for 'typeProperty'
 *   },
 * });
 */
export function useCreateFieldMutation(baseOptions?: Apollo.MutationHookOptions<CreateFieldMutation, CreateFieldMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateFieldMutation, CreateFieldMutationVariables>(CreateFieldDocument, options);
      }
export type CreateFieldMutationHookResult = ReturnType<typeof useCreateFieldMutation>;
export type CreateFieldMutationResult = Apollo.MutationResult<CreateFieldMutation>;
export type CreateFieldMutationOptions = Apollo.BaseMutationOptions<CreateFieldMutation, CreateFieldMutationVariables>;
export const UpdateFieldDocument = gql`
    mutation UpdateField($modelId: ID, $groupId: ID, $fieldId: ID!, $title: String!, $metadata: Boolean, $description: String, $order: Int, $key: String!, $multiple: Boolean!, $unique: Boolean!, $isTitle: Boolean!, $required: Boolean!, $typeProperty: SchemaFieldTypePropertyInput!) {
  updateField(
    input: {modelId: $modelId, groupId: $groupId, fieldId: $fieldId, title: $title, metadata: $metadata, description: $description, order: $order, key: $key, multiple: $multiple, unique: $unique, isTitle: $isTitle, required: $required, typeProperty: $typeProperty}
  ) {
    field {
      id
    }
  }
}
    `;
export type UpdateFieldMutationFn = Apollo.MutationFunction<UpdateFieldMutation, UpdateFieldMutationVariables>;

/**
 * __useUpdateFieldMutation__
 *
 * To run a mutation, you first call `useUpdateFieldMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFieldMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFieldMutation, { data, loading, error }] = useUpdateFieldMutation({
 *   variables: {
 *      modelId: // value for 'modelId'
 *      groupId: // value for 'groupId'
 *      fieldId: // value for 'fieldId'
 *      title: // value for 'title'
 *      metadata: // value for 'metadata'
 *      description: // value for 'description'
 *      order: // value for 'order'
 *      key: // value for 'key'
 *      multiple: // value for 'multiple'
 *      unique: // value for 'unique'
 *      isTitle: // value for 'isTitle'
 *      required: // value for 'required'
 *      typeProperty: // value for 'typeProperty'
 *   },
 * });
 */
export function useUpdateFieldMutation(baseOptions?: Apollo.MutationHookOptions<UpdateFieldMutation, UpdateFieldMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateFieldMutation, UpdateFieldMutationVariables>(UpdateFieldDocument, options);
      }
export type UpdateFieldMutationHookResult = ReturnType<typeof useUpdateFieldMutation>;
export type UpdateFieldMutationResult = Apollo.MutationResult<UpdateFieldMutation>;
export type UpdateFieldMutationOptions = Apollo.BaseMutationOptions<UpdateFieldMutation, UpdateFieldMutationVariables>;
export const UpdateFieldsDocument = gql`
    mutation UpdateFields($updateFieldInput: [UpdateFieldInput!]!) {
  updateFields(input: $updateFieldInput) {
    fields {
      id
    }
  }
}
    `;
export type UpdateFieldsMutationFn = Apollo.MutationFunction<UpdateFieldsMutation, UpdateFieldsMutationVariables>;

/**
 * __useUpdateFieldsMutation__
 *
 * To run a mutation, you first call `useUpdateFieldsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFieldsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFieldsMutation, { data, loading, error }] = useUpdateFieldsMutation({
 *   variables: {
 *      updateFieldInput: // value for 'updateFieldInput'
 *   },
 * });
 */
export function useUpdateFieldsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateFieldsMutation, UpdateFieldsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateFieldsMutation, UpdateFieldsMutationVariables>(UpdateFieldsDocument, options);
      }
export type UpdateFieldsMutationHookResult = ReturnType<typeof useUpdateFieldsMutation>;
export type UpdateFieldsMutationResult = Apollo.MutationResult<UpdateFieldsMutation>;
export type UpdateFieldsMutationOptions = Apollo.BaseMutationOptions<UpdateFieldsMutation, UpdateFieldsMutationVariables>;
export const DeleteFieldDocument = gql`
    mutation DeleteField($modelId: ID, $groupId: ID, $fieldId: ID!, $metadata: Boolean) {
  deleteField(
    input: {modelId: $modelId, groupId: $groupId, fieldId: $fieldId, metadata: $metadata}
  ) {
    fieldId
  }
}
    `;
export type DeleteFieldMutationFn = Apollo.MutationFunction<DeleteFieldMutation, DeleteFieldMutationVariables>;

/**
 * __useDeleteFieldMutation__
 *
 * To run a mutation, you first call `useDeleteFieldMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFieldMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFieldMutation, { data, loading, error }] = useDeleteFieldMutation({
 *   variables: {
 *      modelId: // value for 'modelId'
 *      groupId: // value for 'groupId'
 *      fieldId: // value for 'fieldId'
 *      metadata: // value for 'metadata'
 *   },
 * });
 */
export function useDeleteFieldMutation(baseOptions?: Apollo.MutationHookOptions<DeleteFieldMutation, DeleteFieldMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteFieldMutation, DeleteFieldMutationVariables>(DeleteFieldDocument, options);
      }
export type DeleteFieldMutationHookResult = ReturnType<typeof useDeleteFieldMutation>;
export type DeleteFieldMutationResult = Apollo.MutationResult<DeleteFieldMutation>;
export type DeleteFieldMutationOptions = Apollo.BaseMutationOptions<DeleteFieldMutation, DeleteFieldMutationVariables>;
export const GetGroupsDocument = gql`
    query GetGroups($projectId: ID!) {
  groups(projectId: $projectId) {
    id
    name
    key
    order
  }
}
    `;

/**
 * __useGetGroupsQuery__
 *
 * To run a query within a React component, call `useGetGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGroupsQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useGetGroupsQuery(baseOptions: Apollo.QueryHookOptions<GetGroupsQuery, GetGroupsQueryVariables> & ({ variables: GetGroupsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGroupsQuery, GetGroupsQueryVariables>(GetGroupsDocument, options);
      }
export function useGetGroupsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGroupsQuery, GetGroupsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGroupsQuery, GetGroupsQueryVariables>(GetGroupsDocument, options);
        }
export function useGetGroupsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetGroupsQuery, GetGroupsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGroupsQuery, GetGroupsQueryVariables>(GetGroupsDocument, options);
        }
export type GetGroupsQueryHookResult = ReturnType<typeof useGetGroupsQuery>;
export type GetGroupsLazyQueryHookResult = ReturnType<typeof useGetGroupsLazyQuery>;
export type GetGroupsSuspenseQueryHookResult = ReturnType<typeof useGetGroupsSuspenseQuery>;
export type GetGroupsQueryResult = Apollo.QueryResult<GetGroupsQuery, GetGroupsQueryVariables>;
export const GetGroupDocument = gql`
    query GetGroup($id: ID!) {
  node(id: $id, type: Group) {
    ... on Group {
      id
      schemaId
      projectId
      name
      description
      key
      schema {
        id
        fields {
          id
          type
          title
          key
          description
          required
          unique
          isTitle
          multiple
          typeProperty {
            ... on SchemaFieldText {
              defaultValue
              maxLength
            }
            ... on SchemaFieldTextArea {
              defaultValue
              maxLength
            }
            ... on SchemaFieldMarkdown {
              defaultValue
              maxLength
            }
            ... on SchemaFieldAsset {
              assetDefaultValue: defaultValue
            }
            ... on SchemaFieldSelect {
              selectDefaultValue: defaultValue
              values
            }
            ... on SchemaFieldInteger {
              integerDefaultValue: defaultValue
              min
              max
            }
            ... on SchemaFieldBool {
              defaultValue
            }
            ... on SchemaFieldURL {
              defaultValue
            }
            ... on SchemaFieldDate {
              defaultValue
            }
            ... on SchemaFieldGeometryObject {
              defaultValue
              objectSupportedTypes: supportedTypes
            }
            ... on SchemaFieldGeometryEditor {
              defaultValue
              editorSupportedTypes: supportedTypes
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetGroupQuery__
 *
 * To run a query within a React component, call `useGetGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGroupQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetGroupQuery(baseOptions: Apollo.QueryHookOptions<GetGroupQuery, GetGroupQueryVariables> & ({ variables: GetGroupQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGroupQuery, GetGroupQueryVariables>(GetGroupDocument, options);
      }
export function useGetGroupLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGroupQuery, GetGroupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGroupQuery, GetGroupQueryVariables>(GetGroupDocument, options);
        }
export function useGetGroupSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetGroupQuery, GetGroupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGroupQuery, GetGroupQueryVariables>(GetGroupDocument, options);
        }
export type GetGroupQueryHookResult = ReturnType<typeof useGetGroupQuery>;
export type GetGroupLazyQueryHookResult = ReturnType<typeof useGetGroupLazyQuery>;
export type GetGroupSuspenseQueryHookResult = ReturnType<typeof useGetGroupSuspenseQuery>;
export type GetGroupQueryResult = Apollo.QueryResult<GetGroupQuery, GetGroupQueryVariables>;
export const CreateGroupDocument = gql`
    mutation createGroup($projectId: ID!, $name: String!, $key: String!, $description: String) {
  createGroup(
    input: {projectId: $projectId, name: $name, key: $key, description: $description}
  ) {
    group {
      id
    }
  }
}
    `;
export type CreateGroupMutationFn = Apollo.MutationFunction<CreateGroupMutation, CreateGroupMutationVariables>;

/**
 * __useCreateGroupMutation__
 *
 * To run a mutation, you first call `useCreateGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGroupMutation, { data, loading, error }] = useCreateGroupMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      name: // value for 'name'
 *      key: // value for 'key'
 *      description: // value for 'description'
 *   },
 * });
 */
export function useCreateGroupMutation(baseOptions?: Apollo.MutationHookOptions<CreateGroupMutation, CreateGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateGroupMutation, CreateGroupMutationVariables>(CreateGroupDocument, options);
      }
export type CreateGroupMutationHookResult = ReturnType<typeof useCreateGroupMutation>;
export type CreateGroupMutationResult = Apollo.MutationResult<CreateGroupMutation>;
export type CreateGroupMutationOptions = Apollo.BaseMutationOptions<CreateGroupMutation, CreateGroupMutationVariables>;
export const UpdateGroupDocument = gql`
    mutation updateGroup($groupId: ID!, $name: String!, $key: String!, $description: String) {
  updateGroup(
    input: {groupId: $groupId, name: $name, key: $key, description: $description}
  ) {
    group {
      id
    }
  }
}
    `;
export type UpdateGroupMutationFn = Apollo.MutationFunction<UpdateGroupMutation, UpdateGroupMutationVariables>;

/**
 * __useUpdateGroupMutation__
 *
 * To run a mutation, you first call `useUpdateGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGroupMutation, { data, loading, error }] = useUpdateGroupMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      name: // value for 'name'
 *      key: // value for 'key'
 *      description: // value for 'description'
 *   },
 * });
 */
export function useUpdateGroupMutation(baseOptions?: Apollo.MutationHookOptions<UpdateGroupMutation, UpdateGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateGroupMutation, UpdateGroupMutationVariables>(UpdateGroupDocument, options);
      }
export type UpdateGroupMutationHookResult = ReturnType<typeof useUpdateGroupMutation>;
export type UpdateGroupMutationResult = Apollo.MutationResult<UpdateGroupMutation>;
export type UpdateGroupMutationOptions = Apollo.BaseMutationOptions<UpdateGroupMutation, UpdateGroupMutationVariables>;
export const DeleteGroupDocument = gql`
    mutation deleteGroup($groupId: ID!) {
  deleteGroup(input: {groupId: $groupId}) {
    groupId
  }
}
    `;
export type DeleteGroupMutationFn = Apollo.MutationFunction<DeleteGroupMutation, DeleteGroupMutationVariables>;

/**
 * __useDeleteGroupMutation__
 *
 * To run a mutation, you first call `useDeleteGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGroupMutation, { data, loading, error }] = useDeleteGroupMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useDeleteGroupMutation(baseOptions?: Apollo.MutationHookOptions<DeleteGroupMutation, DeleteGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteGroupMutation, DeleteGroupMutationVariables>(DeleteGroupDocument, options);
      }
export type DeleteGroupMutationHookResult = ReturnType<typeof useDeleteGroupMutation>;
export type DeleteGroupMutationResult = Apollo.MutationResult<DeleteGroupMutation>;
export type DeleteGroupMutationOptions = Apollo.BaseMutationOptions<DeleteGroupMutation, DeleteGroupMutationVariables>;
export const CheckGroupKeyAvailabilityDocument = gql`
    query CheckGroupKeyAvailability($projectId: ID!, $key: String!) {
  checkGroupKeyAvailability(projectId: $projectId, key: $key) {
    key
    available
  }
}
    `;

/**
 * __useCheckGroupKeyAvailabilityQuery__
 *
 * To run a query within a React component, call `useCheckGroupKeyAvailabilityQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckGroupKeyAvailabilityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckGroupKeyAvailabilityQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      key: // value for 'key'
 *   },
 * });
 */
export function useCheckGroupKeyAvailabilityQuery(baseOptions: Apollo.QueryHookOptions<CheckGroupKeyAvailabilityQuery, CheckGroupKeyAvailabilityQueryVariables> & ({ variables: CheckGroupKeyAvailabilityQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckGroupKeyAvailabilityQuery, CheckGroupKeyAvailabilityQueryVariables>(CheckGroupKeyAvailabilityDocument, options);
      }
export function useCheckGroupKeyAvailabilityLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckGroupKeyAvailabilityQuery, CheckGroupKeyAvailabilityQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckGroupKeyAvailabilityQuery, CheckGroupKeyAvailabilityQueryVariables>(CheckGroupKeyAvailabilityDocument, options);
        }
export function useCheckGroupKeyAvailabilitySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CheckGroupKeyAvailabilityQuery, CheckGroupKeyAvailabilityQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CheckGroupKeyAvailabilityQuery, CheckGroupKeyAvailabilityQueryVariables>(CheckGroupKeyAvailabilityDocument, options);
        }
export type CheckGroupKeyAvailabilityQueryHookResult = ReturnType<typeof useCheckGroupKeyAvailabilityQuery>;
export type CheckGroupKeyAvailabilityLazyQueryHookResult = ReturnType<typeof useCheckGroupKeyAvailabilityLazyQuery>;
export type CheckGroupKeyAvailabilitySuspenseQueryHookResult = ReturnType<typeof useCheckGroupKeyAvailabilitySuspenseQuery>;
export type CheckGroupKeyAvailabilityQueryResult = Apollo.QueryResult<CheckGroupKeyAvailabilityQuery, CheckGroupKeyAvailabilityQueryVariables>;
export const ModelsByGroupDocument = gql`
    query ModelsByGroup($groupId: ID!) {
  modelsByGroup(groupId: $groupId) {
    name
  }
}
    `;

/**
 * __useModelsByGroupQuery__
 *
 * To run a query within a React component, call `useModelsByGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useModelsByGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useModelsByGroupQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useModelsByGroupQuery(baseOptions: Apollo.QueryHookOptions<ModelsByGroupQuery, ModelsByGroupQueryVariables> & ({ variables: ModelsByGroupQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ModelsByGroupQuery, ModelsByGroupQueryVariables>(ModelsByGroupDocument, options);
      }
export function useModelsByGroupLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ModelsByGroupQuery, ModelsByGroupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ModelsByGroupQuery, ModelsByGroupQueryVariables>(ModelsByGroupDocument, options);
        }
export function useModelsByGroupSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ModelsByGroupQuery, ModelsByGroupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ModelsByGroupQuery, ModelsByGroupQueryVariables>(ModelsByGroupDocument, options);
        }
export type ModelsByGroupQueryHookResult = ReturnType<typeof useModelsByGroupQuery>;
export type ModelsByGroupLazyQueryHookResult = ReturnType<typeof useModelsByGroupLazyQuery>;
export type ModelsByGroupSuspenseQueryHookResult = ReturnType<typeof useModelsByGroupSuspenseQuery>;
export type ModelsByGroupQueryResult = Apollo.QueryResult<ModelsByGroupQuery, ModelsByGroupQueryVariables>;
export const UpdateGroupsOrderDocument = gql`
    mutation UpdateGroupsOrder($groupIds: [ID!]!) {
  updateGroupsOrder(input: {groupIds: $groupIds}) {
    groups {
      id
    }
  }
}
    `;
export type UpdateGroupsOrderMutationFn = Apollo.MutationFunction<UpdateGroupsOrderMutation, UpdateGroupsOrderMutationVariables>;

/**
 * __useUpdateGroupsOrderMutation__
 *
 * To run a mutation, you first call `useUpdateGroupsOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGroupsOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGroupsOrderMutation, { data, loading, error }] = useUpdateGroupsOrderMutation({
 *   variables: {
 *      groupIds: // value for 'groupIds'
 *   },
 * });
 */
export function useUpdateGroupsOrderMutation(baseOptions?: Apollo.MutationHookOptions<UpdateGroupsOrderMutation, UpdateGroupsOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateGroupsOrderMutation, UpdateGroupsOrderMutationVariables>(UpdateGroupsOrderDocument, options);
      }
export type UpdateGroupsOrderMutationHookResult = ReturnType<typeof useUpdateGroupsOrderMutation>;
export type UpdateGroupsOrderMutationResult = Apollo.MutationResult<UpdateGroupsOrderMutation>;
export type UpdateGroupsOrderMutationOptions = Apollo.BaseMutationOptions<UpdateGroupsOrderMutation, UpdateGroupsOrderMutationVariables>;
export const CreateIntegrationDocument = gql`
    mutation CreateIntegration($name: String!, $description: String, $logoUrl: URL!, $type: IntegrationType!) {
  createIntegration(
    input: {name: $name, description: $description, logoUrl: $logoUrl, type: $type}
  ) {
    integration {
      id
      name
      description
      logoUrl
      iType
    }
  }
}
    `;
export type CreateIntegrationMutationFn = Apollo.MutationFunction<CreateIntegrationMutation, CreateIntegrationMutationVariables>;

/**
 * __useCreateIntegrationMutation__
 *
 * To run a mutation, you first call `useCreateIntegrationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateIntegrationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createIntegrationMutation, { data, loading, error }] = useCreateIntegrationMutation({
 *   variables: {
 *      name: // value for 'name'
 *      description: // value for 'description'
 *      logoUrl: // value for 'logoUrl'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useCreateIntegrationMutation(baseOptions?: Apollo.MutationHookOptions<CreateIntegrationMutation, CreateIntegrationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateIntegrationMutation, CreateIntegrationMutationVariables>(CreateIntegrationDocument, options);
      }
export type CreateIntegrationMutationHookResult = ReturnType<typeof useCreateIntegrationMutation>;
export type CreateIntegrationMutationResult = Apollo.MutationResult<CreateIntegrationMutation>;
export type CreateIntegrationMutationOptions = Apollo.BaseMutationOptions<CreateIntegrationMutation, CreateIntegrationMutationVariables>;
export const UpdateIntegrationDocument = gql`
    mutation UpdateIntegration($integrationId: ID!, $name: String!, $description: String, $logoUrl: URL!) {
  updateIntegration(
    input: {integrationId: $integrationId, name: $name, description: $description, logoUrl: $logoUrl}
  ) {
    integration {
      id
      name
      description
      logoUrl
      iType
    }
  }
}
    `;
export type UpdateIntegrationMutationFn = Apollo.MutationFunction<UpdateIntegrationMutation, UpdateIntegrationMutationVariables>;

/**
 * __useUpdateIntegrationMutation__
 *
 * To run a mutation, you first call `useUpdateIntegrationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateIntegrationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateIntegrationMutation, { data, loading, error }] = useUpdateIntegrationMutation({
 *   variables: {
 *      integrationId: // value for 'integrationId'
 *      name: // value for 'name'
 *      description: // value for 'description'
 *      logoUrl: // value for 'logoUrl'
 *   },
 * });
 */
export function useUpdateIntegrationMutation(baseOptions?: Apollo.MutationHookOptions<UpdateIntegrationMutation, UpdateIntegrationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateIntegrationMutation, UpdateIntegrationMutationVariables>(UpdateIntegrationDocument, options);
      }
export type UpdateIntegrationMutationHookResult = ReturnType<typeof useUpdateIntegrationMutation>;
export type UpdateIntegrationMutationResult = Apollo.MutationResult<UpdateIntegrationMutation>;
export type UpdateIntegrationMutationOptions = Apollo.BaseMutationOptions<UpdateIntegrationMutation, UpdateIntegrationMutationVariables>;
export const DeleteIntegrationDocument = gql`
    mutation DeleteIntegration($integrationId: ID!) {
  deleteIntegration(input: {integrationId: $integrationId}) {
    integrationId
  }
}
    `;
export type DeleteIntegrationMutationFn = Apollo.MutationFunction<DeleteIntegrationMutation, DeleteIntegrationMutationVariables>;

/**
 * __useDeleteIntegrationMutation__
 *
 * To run a mutation, you first call `useDeleteIntegrationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteIntegrationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteIntegrationMutation, { data, loading, error }] = useDeleteIntegrationMutation({
 *   variables: {
 *      integrationId: // value for 'integrationId'
 *   },
 * });
 */
export function useDeleteIntegrationMutation(baseOptions?: Apollo.MutationHookOptions<DeleteIntegrationMutation, DeleteIntegrationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteIntegrationMutation, DeleteIntegrationMutationVariables>(DeleteIntegrationDocument, options);
      }
export type DeleteIntegrationMutationHookResult = ReturnType<typeof useDeleteIntegrationMutation>;
export type DeleteIntegrationMutationResult = Apollo.MutationResult<DeleteIntegrationMutation>;
export type DeleteIntegrationMutationOptions = Apollo.BaseMutationOptions<DeleteIntegrationMutation, DeleteIntegrationMutationVariables>;
export const RegenerateIntegrationTokenDocument = gql`
    mutation regenerateIntegrationToken($integrationId: ID!) {
  regenerateIntegrationToken(input: {integrationId: $integrationId}) {
    integration {
      id
      name
      description
      logoUrl
      iType
    }
  }
}
    `;
export type RegenerateIntegrationTokenMutationFn = Apollo.MutationFunction<RegenerateIntegrationTokenMutation, RegenerateIntegrationTokenMutationVariables>;

/**
 * __useRegenerateIntegrationTokenMutation__
 *
 * To run a mutation, you first call `useRegenerateIntegrationTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegenerateIntegrationTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [regenerateIntegrationTokenMutation, { data, loading, error }] = useRegenerateIntegrationTokenMutation({
 *   variables: {
 *      integrationId: // value for 'integrationId'
 *   },
 * });
 */
export function useRegenerateIntegrationTokenMutation(baseOptions?: Apollo.MutationHookOptions<RegenerateIntegrationTokenMutation, RegenerateIntegrationTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegenerateIntegrationTokenMutation, RegenerateIntegrationTokenMutationVariables>(RegenerateIntegrationTokenDocument, options);
      }
export type RegenerateIntegrationTokenMutationHookResult = ReturnType<typeof useRegenerateIntegrationTokenMutation>;
export type RegenerateIntegrationTokenMutationResult = Apollo.MutationResult<RegenerateIntegrationTokenMutation>;
export type RegenerateIntegrationTokenMutationOptions = Apollo.BaseMutationOptions<RegenerateIntegrationTokenMutation, RegenerateIntegrationTokenMutationVariables>;
export const GetItemsDocument = gql`
    query GetItems($query: ItemQueryInput!, $pagination: Pagination) {
  searchItem(input: {query: $query, pagination: $pagination}) {
    nodes {
      id
      title
      schemaId
      createdAt
      updatedAt
      status
      version
      referencedItems {
        id
        title
        schemaId
        createdBy {
          ... on Integration {
            name
          }
          ... on User {
            name
          }
        }
        status
        version
        createdAt
        updatedAt
      }
      createdBy {
        ... on Integration {
          name
        }
        ... on User {
          name
        }
      }
      fields {
        schemaFieldId
        itemGroupId
        type
        value
      }
      thread {
        ...threadFragment
      }
      metadata {
        id
        version
        fields {
          schemaFieldId
          itemGroupId
          type
          value
        }
      }
    }
    totalCount
  }
}
    ${ThreadFragmentFragmentDoc}`;

/**
 * __useGetItemsQuery__
 *
 * To run a query within a React component, call `useGetItemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetItemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetItemsQuery({
 *   variables: {
 *      query: // value for 'query'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetItemsQuery(baseOptions: Apollo.QueryHookOptions<GetItemsQuery, GetItemsQueryVariables> & ({ variables: GetItemsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetItemsQuery, GetItemsQueryVariables>(GetItemsDocument, options);
      }
export function useGetItemsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetItemsQuery, GetItemsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetItemsQuery, GetItemsQueryVariables>(GetItemsDocument, options);
        }
export function useGetItemsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetItemsQuery, GetItemsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetItemsQuery, GetItemsQueryVariables>(GetItemsDocument, options);
        }
export type GetItemsQueryHookResult = ReturnType<typeof useGetItemsQuery>;
export type GetItemsLazyQueryHookResult = ReturnType<typeof useGetItemsLazyQuery>;
export type GetItemsSuspenseQueryHookResult = ReturnType<typeof useGetItemsSuspenseQuery>;
export type GetItemsQueryResult = Apollo.QueryResult<GetItemsQuery, GetItemsQueryVariables>;
export const GetItemDocument = gql`
    query GetItem($id: ID!) {
  node(id: $id, type: Item) {
    ... on Item {
      id
      title
      schemaId
      createdAt
      updatedAt
      status
      referencedItems {
        id
        title
        schemaId
        createdBy {
          ... on Integration {
            name
          }
          ... on User {
            name
          }
        }
        status
        version
        createdAt
        updatedAt
      }
      version
      assets {
        id
        url
        fileName
      }
      createdBy {
        ... on Integration {
          id
          name
        }
        ... on User {
          id
          name
        }
      }
      updatedBy {
        ... on Integration {
          name
        }
        ... on User {
          name
        }
      }
      fields {
        schemaFieldId
        itemGroupId
        type
        value
      }
      metadata {
        id
        version
        fields {
          schemaFieldId
          type
          value
        }
      }
      thread {
        ...threadFragment
      }
      requests {
        id
        state
        title
      }
    }
  }
}
    ${ThreadFragmentFragmentDoc}`;

/**
 * __useGetItemQuery__
 *
 * To run a query within a React component, call `useGetItemQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetItemQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetItemQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetItemQuery(baseOptions: Apollo.QueryHookOptions<GetItemQuery, GetItemQueryVariables> & ({ variables: GetItemQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetItemQuery, GetItemQueryVariables>(GetItemDocument, options);
      }
export function useGetItemLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetItemQuery, GetItemQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetItemQuery, GetItemQueryVariables>(GetItemDocument, options);
        }
export function useGetItemSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetItemQuery, GetItemQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetItemQuery, GetItemQueryVariables>(GetItemDocument, options);
        }
export type GetItemQueryHookResult = ReturnType<typeof useGetItemQuery>;
export type GetItemLazyQueryHookResult = ReturnType<typeof useGetItemLazyQuery>;
export type GetItemSuspenseQueryHookResult = ReturnType<typeof useGetItemSuspenseQuery>;
export type GetItemQueryResult = Apollo.QueryResult<GetItemQuery, GetItemQueryVariables>;
export const IsItemReferencedDocument = gql`
    query IsItemReferenced($itemId: ID!, $correspondingFieldId: ID!) {
  isItemReferenced(itemId: $itemId, correspondingFieldId: $correspondingFieldId)
}
    `;

/**
 * __useIsItemReferencedQuery__
 *
 * To run a query within a React component, call `useIsItemReferencedQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsItemReferencedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsItemReferencedQuery({
 *   variables: {
 *      itemId: // value for 'itemId'
 *      correspondingFieldId: // value for 'correspondingFieldId'
 *   },
 * });
 */
export function useIsItemReferencedQuery(baseOptions: Apollo.QueryHookOptions<IsItemReferencedQuery, IsItemReferencedQueryVariables> & ({ variables: IsItemReferencedQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<IsItemReferencedQuery, IsItemReferencedQueryVariables>(IsItemReferencedDocument, options);
      }
export function useIsItemReferencedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<IsItemReferencedQuery, IsItemReferencedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<IsItemReferencedQuery, IsItemReferencedQueryVariables>(IsItemReferencedDocument, options);
        }
export function useIsItemReferencedSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<IsItemReferencedQuery, IsItemReferencedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<IsItemReferencedQuery, IsItemReferencedQueryVariables>(IsItemReferencedDocument, options);
        }
export type IsItemReferencedQueryHookResult = ReturnType<typeof useIsItemReferencedQuery>;
export type IsItemReferencedLazyQueryHookResult = ReturnType<typeof useIsItemReferencedLazyQuery>;
export type IsItemReferencedSuspenseQueryHookResult = ReturnType<typeof useIsItemReferencedSuspenseQuery>;
export type IsItemReferencedQueryResult = Apollo.QueryResult<IsItemReferencedQuery, IsItemReferencedQueryVariables>;
export const VersionsByItemDocument = gql`
    query VersionsByItem($itemId: ID!) {
  versionsByItem(itemId: $itemId) {
    version
    refs
    value {
      id
      version
      modelId
      status
      createdAt
      updatedAt
      createdBy {
        ... on Integration {
          name
        }
        ... on User {
          name
        }
      }
      updatedBy {
        ... on Integration {
          name
        }
        ... on User {
          name
        }
      }
      fields {
        schemaFieldId
        itemGroupId
        type
        value
      }
      requests {
        id
        title
        state
        items {
          itemId
          version
          item {
            value {
              modelId
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useVersionsByItemQuery__
 *
 * To run a query within a React component, call `useVersionsByItemQuery` and pass it any options that fit your needs.
 * When your component renders, `useVersionsByItemQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVersionsByItemQuery({
 *   variables: {
 *      itemId: // value for 'itemId'
 *   },
 * });
 */
export function useVersionsByItemQuery(baseOptions: Apollo.QueryHookOptions<VersionsByItemQuery, VersionsByItemQueryVariables> & ({ variables: VersionsByItemQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<VersionsByItemQuery, VersionsByItemQueryVariables>(VersionsByItemDocument, options);
      }
export function useVersionsByItemLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<VersionsByItemQuery, VersionsByItemQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<VersionsByItemQuery, VersionsByItemQueryVariables>(VersionsByItemDocument, options);
        }
export function useVersionsByItemSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<VersionsByItemQuery, VersionsByItemQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<VersionsByItemQuery, VersionsByItemQueryVariables>(VersionsByItemDocument, options);
        }
export type VersionsByItemQueryHookResult = ReturnType<typeof useVersionsByItemQuery>;
export type VersionsByItemLazyQueryHookResult = ReturnType<typeof useVersionsByItemLazyQuery>;
export type VersionsByItemSuspenseQueryHookResult = ReturnType<typeof useVersionsByItemSuspenseQuery>;
export type VersionsByItemQueryResult = Apollo.QueryResult<VersionsByItemQuery, VersionsByItemQueryVariables>;
export const SearchItemDocument = gql`
    query SearchItem($searchItemInput: SearchItemInput!) {
  searchItem(input: $searchItemInput) {
    nodes {
      id
      title
      schemaId
      createdAt
      updatedAt
      status
      referencedItems {
        id
        title
        schemaId
        createdBy {
          ... on Integration {
            name
          }
          ... on User {
            name
          }
        }
        status
        version
        createdAt
        updatedAt
      }
      version
      assets {
        id
        url
      }
      fields {
        schemaFieldId
        itemGroupId
        type
        value
      }
      createdBy {
        ... on Integration {
          id
          name
        }
        ... on User {
          id
          name
        }
      }
      updatedBy {
        ... on Integration {
          name
          __typename
        }
        ... on User {
          name
          __typename
        }
      }
      metadata {
        id
        version
        fields {
          schemaFieldId
          type
          value
        }
      }
      thread {
        ...threadFragment
      }
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    ${ThreadFragmentFragmentDoc}`;

/**
 * __useSearchItemQuery__
 *
 * To run a query within a React component, call `useSearchItemQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchItemQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchItemQuery({
 *   variables: {
 *      searchItemInput: // value for 'searchItemInput'
 *   },
 * });
 */
export function useSearchItemQuery(baseOptions: Apollo.QueryHookOptions<SearchItemQuery, SearchItemQueryVariables> & ({ variables: SearchItemQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchItemQuery, SearchItemQueryVariables>(SearchItemDocument, options);
      }
export function useSearchItemLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchItemQuery, SearchItemQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchItemQuery, SearchItemQueryVariables>(SearchItemDocument, options);
        }
export function useSearchItemSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<SearchItemQuery, SearchItemQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SearchItemQuery, SearchItemQueryVariables>(SearchItemDocument, options);
        }
export type SearchItemQueryHookResult = ReturnType<typeof useSearchItemQuery>;
export type SearchItemLazyQueryHookResult = ReturnType<typeof useSearchItemLazyQuery>;
export type SearchItemSuspenseQueryHookResult = ReturnType<typeof useSearchItemSuspenseQuery>;
export type SearchItemQueryResult = Apollo.QueryResult<SearchItemQuery, SearchItemQueryVariables>;
export const CreateItemDocument = gql`
    mutation CreateItem($modelId: ID!, $schemaId: ID!, $metadataId: ID, $fields: [ItemFieldInput!]!) {
  createItem(
    input: {modelId: $modelId, schemaId: $schemaId, metadataId: $metadataId, fields: $fields}
  ) {
    item {
      id
      schemaId
      version
      fields {
        value
        type
        schemaFieldId
        itemGroupId
      }
      referencedItems {
        id
        title
        schemaId
        createdBy {
          ... on Integration {
            name
          }
          ... on User {
            name
          }
        }
        status
        version
        createdAt
        updatedAt
      }
    }
  }
}
    `;
export type CreateItemMutationFn = Apollo.MutationFunction<CreateItemMutation, CreateItemMutationVariables>;

/**
 * __useCreateItemMutation__
 *
 * To run a mutation, you first call `useCreateItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createItemMutation, { data, loading, error }] = useCreateItemMutation({
 *   variables: {
 *      modelId: // value for 'modelId'
 *      schemaId: // value for 'schemaId'
 *      metadataId: // value for 'metadataId'
 *      fields: // value for 'fields'
 *   },
 * });
 */
export function useCreateItemMutation(baseOptions?: Apollo.MutationHookOptions<CreateItemMutation, CreateItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateItemMutation, CreateItemMutationVariables>(CreateItemDocument, options);
      }
export type CreateItemMutationHookResult = ReturnType<typeof useCreateItemMutation>;
export type CreateItemMutationResult = Apollo.MutationResult<CreateItemMutation>;
export type CreateItemMutationOptions = Apollo.BaseMutationOptions<CreateItemMutation, CreateItemMutationVariables>;
export const DeleteItemDocument = gql`
    mutation DeleteItem($itemId: ID!) {
  deleteItem(input: {itemId: $itemId}) {
    itemId
  }
}
    `;
export type DeleteItemMutationFn = Apollo.MutationFunction<DeleteItemMutation, DeleteItemMutationVariables>;

/**
 * __useDeleteItemMutation__
 *
 * To run a mutation, you first call `useDeleteItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteItemMutation, { data, loading, error }] = useDeleteItemMutation({
 *   variables: {
 *      itemId: // value for 'itemId'
 *   },
 * });
 */
export function useDeleteItemMutation(baseOptions?: Apollo.MutationHookOptions<DeleteItemMutation, DeleteItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteItemMutation, DeleteItemMutationVariables>(DeleteItemDocument, options);
      }
export type DeleteItemMutationHookResult = ReturnType<typeof useDeleteItemMutation>;
export type DeleteItemMutationResult = Apollo.MutationResult<DeleteItemMutation>;
export type DeleteItemMutationOptions = Apollo.BaseMutationOptions<DeleteItemMutation, DeleteItemMutationVariables>;
export const UpdateItemDocument = gql`
    mutation UpdateItem($itemId: ID!, $fields: [ItemFieldInput!]!, $metadataId: ID, $version: String!) {
  updateItem(
    input: {itemId: $itemId, fields: $fields, metadataId: $metadataId, version: $version}
  ) {
    item {
      id
      schemaId
      version
      fields {
        value
        type
        schemaFieldId
        itemGroupId
      }
      referencedItems {
        id
        title
        schemaId
        createdBy {
          ... on Integration {
            name
          }
          ... on User {
            name
          }
        }
        status
        version
        createdAt
        updatedAt
      }
    }
  }
}
    `;
export type UpdateItemMutationFn = Apollo.MutationFunction<UpdateItemMutation, UpdateItemMutationVariables>;

/**
 * __useUpdateItemMutation__
 *
 * To run a mutation, you first call `useUpdateItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateItemMutation, { data, loading, error }] = useUpdateItemMutation({
 *   variables: {
 *      itemId: // value for 'itemId'
 *      fields: // value for 'fields'
 *      metadataId: // value for 'metadataId'
 *      version: // value for 'version'
 *   },
 * });
 */
export function useUpdateItemMutation(baseOptions?: Apollo.MutationHookOptions<UpdateItemMutation, UpdateItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateItemMutation, UpdateItemMutationVariables>(UpdateItemDocument, options);
      }
export type UpdateItemMutationHookResult = ReturnType<typeof useUpdateItemMutation>;
export type UpdateItemMutationResult = Apollo.MutationResult<UpdateItemMutation>;
export type UpdateItemMutationOptions = Apollo.BaseMutationOptions<UpdateItemMutation, UpdateItemMutationVariables>;
export const UnpublishItemDocument = gql`
    mutation UnpublishItem($itemIds: [ID!]!) {
  unpublishItem(input: {itemIds: $itemIds}) {
    items {
      id
      version
      referencedItems {
        id
        title
        schemaId
        createdBy {
          ... on Integration {
            name
          }
          ... on User {
            name
          }
        }
        status
        version
        createdAt
        updatedAt
      }
    }
  }
}
    `;
export type UnpublishItemMutationFn = Apollo.MutationFunction<UnpublishItemMutation, UnpublishItemMutationVariables>;

/**
 * __useUnpublishItemMutation__
 *
 * To run a mutation, you first call `useUnpublishItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnpublishItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unpublishItemMutation, { data, loading, error }] = useUnpublishItemMutation({
 *   variables: {
 *      itemIds: // value for 'itemIds'
 *   },
 * });
 */
export function useUnpublishItemMutation(baseOptions?: Apollo.MutationHookOptions<UnpublishItemMutation, UnpublishItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnpublishItemMutation, UnpublishItemMutationVariables>(UnpublishItemDocument, options);
      }
export type UnpublishItemMutationHookResult = ReturnType<typeof useUnpublishItemMutation>;
export type UnpublishItemMutationResult = Apollo.MutationResult<UnpublishItemMutation>;
export type UnpublishItemMutationOptions = Apollo.BaseMutationOptions<UnpublishItemMutation, UnpublishItemMutationVariables>;
export const PublishItemDocument = gql`
    mutation PublishItem($itemIds: [ID!]!) {
  publishItem(input: {itemIds: $itemIds}) {
    items {
      id
      version
      referencedItems {
        id
        title
        schemaId
        createdBy {
          ... on Integration {
            name
          }
          ... on User {
            name
          }
        }
        status
        version
        createdAt
        updatedAt
      }
    }
  }
}
    `;
export type PublishItemMutationFn = Apollo.MutationFunction<PublishItemMutation, PublishItemMutationVariables>;

/**
 * __usePublishItemMutation__
 *
 * To run a mutation, you first call `usePublishItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePublishItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [publishItemMutation, { data, loading, error }] = usePublishItemMutation({
 *   variables: {
 *      itemIds: // value for 'itemIds'
 *   },
 * });
 */
export function usePublishItemMutation(baseOptions?: Apollo.MutationHookOptions<PublishItemMutation, PublishItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PublishItemMutation, PublishItemMutationVariables>(PublishItemDocument, options);
      }
export type PublishItemMutationHookResult = ReturnType<typeof usePublishItemMutation>;
export type PublishItemMutationResult = Apollo.MutationResult<PublishItemMutation>;
export type PublishItemMutationOptions = Apollo.BaseMutationOptions<PublishItemMutation, PublishItemMutationVariables>;
export const GetModelsDocument = gql`
    query GetModels($projectId: ID!, $pagination: Pagination) {
  models(projectId: $projectId, pagination: $pagination) {
    nodes {
      id
      name
      description
      key
      public
      order
      schema {
        id
      }
    }
  }
}
    `;

/**
 * __useGetModelsQuery__
 *
 * To run a query within a React component, call `useGetModelsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetModelsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetModelsQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetModelsQuery(baseOptions: Apollo.QueryHookOptions<GetModelsQuery, GetModelsQueryVariables> & ({ variables: GetModelsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetModelsQuery, GetModelsQueryVariables>(GetModelsDocument, options);
      }
export function useGetModelsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetModelsQuery, GetModelsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetModelsQuery, GetModelsQueryVariables>(GetModelsDocument, options);
        }
export function useGetModelsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetModelsQuery, GetModelsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetModelsQuery, GetModelsQueryVariables>(GetModelsDocument, options);
        }
export type GetModelsQueryHookResult = ReturnType<typeof useGetModelsQuery>;
export type GetModelsLazyQueryHookResult = ReturnType<typeof useGetModelsLazyQuery>;
export type GetModelsSuspenseQueryHookResult = ReturnType<typeof useGetModelsSuspenseQuery>;
export type GetModelsQueryResult = Apollo.QueryResult<GetModelsQuery, GetModelsQueryVariables>;
export const GetModelDocument = gql`
    query GetModel($id: ID!) {
  node(id: $id, type: Model) {
    ... on Model {
      id
      name
      description
      key
      public
      order
      metadataSchema {
        id
        fields {
          id
          type
          title
          key
          description
          required
          unique
          isTitle
          multiple
          order
          typeProperty {
            ... on SchemaFieldText {
              defaultValue
              maxLength
            }
            ... on SchemaFieldBool {
              defaultValue
            }
            ... on SchemaFieldCheckbox {
              defaultValue
            }
            ... on SchemaFieldTag {
              selectDefaultValue: defaultValue
              tags {
                id
                name
                color
              }
            }
            ... on SchemaFieldDate {
              defaultValue
            }
            ... on SchemaFieldURL {
              defaultValue
            }
          }
        }
      }
      schema {
        id
        fields {
          id
          type
          title
          key
          description
          required
          unique
          isTitle
          multiple
          order
          typeProperty {
            ... on SchemaFieldText {
              defaultValue
              maxLength
            }
            ... on SchemaFieldTextArea {
              defaultValue
              maxLength
            }
            ... on SchemaFieldMarkdown {
              defaultValue
              maxLength
            }
            ... on SchemaFieldAsset {
              assetDefaultValue: defaultValue
            }
            ... on SchemaFieldSelect {
              selectDefaultValue: defaultValue
              values
            }
            ... on SchemaFieldInteger {
              integerDefaultValue: defaultValue
              min
              max
            }
            ... on SchemaFieldNumber {
              defaultValue
              numberMin: min
              numberMax: max
            }
            ... on SchemaFieldBool {
              defaultValue
            }
            ... on SchemaFieldDate {
              defaultValue
            }
            ... on SchemaFieldURL {
              defaultValue
            }
            ... on SchemaFieldReference {
              modelId
              schema {
                id
                titleFieldId
              }
              correspondingField {
                id
                type
                title
                key
                description
                required
                unique
                multiple
                order
              }
            }
            ... on SchemaFieldGroup {
              groupId
            }
            ... on SchemaFieldGeometryObject {
              defaultValue
              objectSupportedTypes: supportedTypes
            }
            ... on SchemaFieldGeometryEditor {
              defaultValue
              editorSupportedTypes: supportedTypes
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetModelQuery__
 *
 * To run a query within a React component, call `useGetModelQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetModelQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetModelQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetModelQuery(baseOptions: Apollo.QueryHookOptions<GetModelQuery, GetModelQueryVariables> & ({ variables: GetModelQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetModelQuery, GetModelQueryVariables>(GetModelDocument, options);
      }
export function useGetModelLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetModelQuery, GetModelQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetModelQuery, GetModelQueryVariables>(GetModelDocument, options);
        }
export function useGetModelSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetModelQuery, GetModelQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetModelQuery, GetModelQueryVariables>(GetModelDocument, options);
        }
export type GetModelQueryHookResult = ReturnType<typeof useGetModelQuery>;
export type GetModelLazyQueryHookResult = ReturnType<typeof useGetModelLazyQuery>;
export type GetModelSuspenseQueryHookResult = ReturnType<typeof useGetModelSuspenseQuery>;
export type GetModelQueryResult = Apollo.QueryResult<GetModelQuery, GetModelQueryVariables>;
export const CreateModelDocument = gql`
    mutation CreateModel($projectId: ID!, $name: String, $description: String, $key: String) {
  createModel(
    input: {projectId: $projectId, name: $name, description: $description, key: $key}
  ) {
    model {
      id
      name
    }
  }
}
    `;
export type CreateModelMutationFn = Apollo.MutationFunction<CreateModelMutation, CreateModelMutationVariables>;

/**
 * __useCreateModelMutation__
 *
 * To run a mutation, you first call `useCreateModelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateModelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createModelMutation, { data, loading, error }] = useCreateModelMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      name: // value for 'name'
 *      description: // value for 'description'
 *      key: // value for 'key'
 *   },
 * });
 */
export function useCreateModelMutation(baseOptions?: Apollo.MutationHookOptions<CreateModelMutation, CreateModelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateModelMutation, CreateModelMutationVariables>(CreateModelDocument, options);
      }
export type CreateModelMutationHookResult = ReturnType<typeof useCreateModelMutation>;
export type CreateModelMutationResult = Apollo.MutationResult<CreateModelMutation>;
export type CreateModelMutationOptions = Apollo.BaseMutationOptions<CreateModelMutation, CreateModelMutationVariables>;
export const DeleteModelDocument = gql`
    mutation DeleteModel($modelId: ID!) {
  deleteModel(input: {modelId: $modelId}) {
    modelId
  }
}
    `;
export type DeleteModelMutationFn = Apollo.MutationFunction<DeleteModelMutation, DeleteModelMutationVariables>;

/**
 * __useDeleteModelMutation__
 *
 * To run a mutation, you first call `useDeleteModelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteModelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteModelMutation, { data, loading, error }] = useDeleteModelMutation({
 *   variables: {
 *      modelId: // value for 'modelId'
 *   },
 * });
 */
export function useDeleteModelMutation(baseOptions?: Apollo.MutationHookOptions<DeleteModelMutation, DeleteModelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteModelMutation, DeleteModelMutationVariables>(DeleteModelDocument, options);
      }
export type DeleteModelMutationHookResult = ReturnType<typeof useDeleteModelMutation>;
export type DeleteModelMutationResult = Apollo.MutationResult<DeleteModelMutation>;
export type DeleteModelMutationOptions = Apollo.BaseMutationOptions<DeleteModelMutation, DeleteModelMutationVariables>;
export const UpdateModelDocument = gql`
    mutation UpdateModel($modelId: ID!, $name: String, $description: String, $key: String, $public: Boolean!) {
  updateModel(
    input: {modelId: $modelId, name: $name, description: $description, key: $key, public: $public}
  ) {
    model {
      id
      name
    }
  }
}
    `;
export type UpdateModelMutationFn = Apollo.MutationFunction<UpdateModelMutation, UpdateModelMutationVariables>;

/**
 * __useUpdateModelMutation__
 *
 * To run a mutation, you first call `useUpdateModelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateModelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateModelMutation, { data, loading, error }] = useUpdateModelMutation({
 *   variables: {
 *      modelId: // value for 'modelId'
 *      name: // value for 'name'
 *      description: // value for 'description'
 *      key: // value for 'key'
 *      public: // value for 'public'
 *   },
 * });
 */
export function useUpdateModelMutation(baseOptions?: Apollo.MutationHookOptions<UpdateModelMutation, UpdateModelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateModelMutation, UpdateModelMutationVariables>(UpdateModelDocument, options);
      }
export type UpdateModelMutationHookResult = ReturnType<typeof useUpdateModelMutation>;
export type UpdateModelMutationResult = Apollo.MutationResult<UpdateModelMutation>;
export type UpdateModelMutationOptions = Apollo.BaseMutationOptions<UpdateModelMutation, UpdateModelMutationVariables>;
export const PublishModelsDocument = gql`
    mutation PublishModels($models: [PublishModelInput!]!) {
  publishModels(input: {models: $models}) {
    models {
      modelId
      status
    }
  }
}
    `;
export type PublishModelsMutationFn = Apollo.MutationFunction<PublishModelsMutation, PublishModelsMutationVariables>;

/**
 * __usePublishModelsMutation__
 *
 * To run a mutation, you first call `usePublishModelsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePublishModelsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [publishModelsMutation, { data, loading, error }] = usePublishModelsMutation({
 *   variables: {
 *      models: // value for 'models'
 *   },
 * });
 */
export function usePublishModelsMutation(baseOptions?: Apollo.MutationHookOptions<PublishModelsMutation, PublishModelsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PublishModelsMutation, PublishModelsMutationVariables>(PublishModelsDocument, options);
      }
export type PublishModelsMutationHookResult = ReturnType<typeof usePublishModelsMutation>;
export type PublishModelsMutationResult = Apollo.MutationResult<PublishModelsMutation>;
export type PublishModelsMutationOptions = Apollo.BaseMutationOptions<PublishModelsMutation, PublishModelsMutationVariables>;
export const CheckModelKeyAvailabilityDocument = gql`
    query CheckModelKeyAvailability($projectId: ID!, $key: String!) {
  checkModelKeyAvailability(projectId: $projectId, key: $key) {
    key
    available
  }
}
    `;

/**
 * __useCheckModelKeyAvailabilityQuery__
 *
 * To run a query within a React component, call `useCheckModelKeyAvailabilityQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckModelKeyAvailabilityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckModelKeyAvailabilityQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      key: // value for 'key'
 *   },
 * });
 */
export function useCheckModelKeyAvailabilityQuery(baseOptions: Apollo.QueryHookOptions<CheckModelKeyAvailabilityQuery, CheckModelKeyAvailabilityQueryVariables> & ({ variables: CheckModelKeyAvailabilityQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckModelKeyAvailabilityQuery, CheckModelKeyAvailabilityQueryVariables>(CheckModelKeyAvailabilityDocument, options);
      }
export function useCheckModelKeyAvailabilityLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckModelKeyAvailabilityQuery, CheckModelKeyAvailabilityQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckModelKeyAvailabilityQuery, CheckModelKeyAvailabilityQueryVariables>(CheckModelKeyAvailabilityDocument, options);
        }
export function useCheckModelKeyAvailabilitySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CheckModelKeyAvailabilityQuery, CheckModelKeyAvailabilityQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CheckModelKeyAvailabilityQuery, CheckModelKeyAvailabilityQueryVariables>(CheckModelKeyAvailabilityDocument, options);
        }
export type CheckModelKeyAvailabilityQueryHookResult = ReturnType<typeof useCheckModelKeyAvailabilityQuery>;
export type CheckModelKeyAvailabilityLazyQueryHookResult = ReturnType<typeof useCheckModelKeyAvailabilityLazyQuery>;
export type CheckModelKeyAvailabilitySuspenseQueryHookResult = ReturnType<typeof useCheckModelKeyAvailabilitySuspenseQuery>;
export type CheckModelKeyAvailabilityQueryResult = Apollo.QueryResult<CheckModelKeyAvailabilityQuery, CheckModelKeyAvailabilityQueryVariables>;
export const UpdateModelsOrderDocument = gql`
    mutation UpdateModelsOrder($modelIds: [ID!]!) {
  updateModelsOrder(input: {modelIds: $modelIds}) {
    models {
      ... on Model {
        id
      }
    }
  }
}
    `;
export type UpdateModelsOrderMutationFn = Apollo.MutationFunction<UpdateModelsOrderMutation, UpdateModelsOrderMutationVariables>;

/**
 * __useUpdateModelsOrderMutation__
 *
 * To run a mutation, you first call `useUpdateModelsOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateModelsOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateModelsOrderMutation, { data, loading, error }] = useUpdateModelsOrderMutation({
 *   variables: {
 *      modelIds: // value for 'modelIds'
 *   },
 * });
 */
export function useUpdateModelsOrderMutation(baseOptions?: Apollo.MutationHookOptions<UpdateModelsOrderMutation, UpdateModelsOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateModelsOrderMutation, UpdateModelsOrderMutationVariables>(UpdateModelsOrderDocument, options);
      }
export type UpdateModelsOrderMutationHookResult = ReturnType<typeof useUpdateModelsOrderMutation>;
export type UpdateModelsOrderMutationResult = Apollo.MutationResult<UpdateModelsOrderMutation>;
export type UpdateModelsOrderMutationOptions = Apollo.BaseMutationOptions<UpdateModelsOrderMutation, UpdateModelsOrderMutationVariables>;
export const GetProjectDocument = gql`
    query GetProject($projectId: ID!) {
  node(id: $projectId, type: PROJECT) {
    id
    ... on Project {
      name
      description
      alias
      publication {
        scope
        assetPublic
        token
      }
      requestRoles
    }
  }
}
    `;

/**
 * __useGetProjectQuery__
 *
 * To run a query within a React component, call `useGetProjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useGetProjectQuery(baseOptions: Apollo.QueryHookOptions<GetProjectQuery, GetProjectQueryVariables> & ({ variables: GetProjectQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProjectQuery, GetProjectQueryVariables>(GetProjectDocument, options);
      }
export function useGetProjectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProjectQuery, GetProjectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProjectQuery, GetProjectQueryVariables>(GetProjectDocument, options);
        }
export function useGetProjectSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetProjectQuery, GetProjectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetProjectQuery, GetProjectQueryVariables>(GetProjectDocument, options);
        }
export type GetProjectQueryHookResult = ReturnType<typeof useGetProjectQuery>;
export type GetProjectLazyQueryHookResult = ReturnType<typeof useGetProjectLazyQuery>;
export type GetProjectSuspenseQueryHookResult = ReturnType<typeof useGetProjectSuspenseQuery>;
export type GetProjectQueryResult = Apollo.QueryResult<GetProjectQuery, GetProjectQueryVariables>;
export const GetProjectsDocument = gql`
    query GetProjects($workspaceId: ID!, $pagination: Pagination) {
  projects(workspaceId: $workspaceId, pagination: $pagination) {
    nodes {
      id
      name
      description
      alias
      publication {
        scope
        assetPublic
      }
      requestRoles
    }
  }
}
    `;

/**
 * __useGetProjectsQuery__
 *
 * To run a query within a React component, call `useGetProjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectsQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetProjectsQuery(baseOptions: Apollo.QueryHookOptions<GetProjectsQuery, GetProjectsQueryVariables> & ({ variables: GetProjectsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProjectsQuery, GetProjectsQueryVariables>(GetProjectsDocument, options);
      }
export function useGetProjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProjectsQuery, GetProjectsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProjectsQuery, GetProjectsQueryVariables>(GetProjectsDocument, options);
        }
export function useGetProjectsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetProjectsQuery, GetProjectsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetProjectsQuery, GetProjectsQueryVariables>(GetProjectsDocument, options);
        }
export type GetProjectsQueryHookResult = ReturnType<typeof useGetProjectsQuery>;
export type GetProjectsLazyQueryHookResult = ReturnType<typeof useGetProjectsLazyQuery>;
export type GetProjectsSuspenseQueryHookResult = ReturnType<typeof useGetProjectsSuspenseQuery>;
export type GetProjectsQueryResult = Apollo.QueryResult<GetProjectsQuery, GetProjectsQueryVariables>;
export const CheckProjectAliasDocument = gql`
    query CheckProjectAlias($alias: String!) {
  checkProjectAlias(alias: $alias) {
    alias
    available
  }
}
    `;

/**
 * __useCheckProjectAliasQuery__
 *
 * To run a query within a React component, call `useCheckProjectAliasQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckProjectAliasQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckProjectAliasQuery({
 *   variables: {
 *      alias: // value for 'alias'
 *   },
 * });
 */
export function useCheckProjectAliasQuery(baseOptions: Apollo.QueryHookOptions<CheckProjectAliasQuery, CheckProjectAliasQueryVariables> & ({ variables: CheckProjectAliasQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckProjectAliasQuery, CheckProjectAliasQueryVariables>(CheckProjectAliasDocument, options);
      }
export function useCheckProjectAliasLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckProjectAliasQuery, CheckProjectAliasQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckProjectAliasQuery, CheckProjectAliasQueryVariables>(CheckProjectAliasDocument, options);
        }
export function useCheckProjectAliasSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CheckProjectAliasQuery, CheckProjectAliasQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CheckProjectAliasQuery, CheckProjectAliasQueryVariables>(CheckProjectAliasDocument, options);
        }
export type CheckProjectAliasQueryHookResult = ReturnType<typeof useCheckProjectAliasQuery>;
export type CheckProjectAliasLazyQueryHookResult = ReturnType<typeof useCheckProjectAliasLazyQuery>;
export type CheckProjectAliasSuspenseQueryHookResult = ReturnType<typeof useCheckProjectAliasSuspenseQuery>;
export type CheckProjectAliasQueryResult = Apollo.QueryResult<CheckProjectAliasQuery, CheckProjectAliasQueryVariables>;
export const CreateProjectDocument = gql`
    mutation CreateProject($workspaceId: ID!, $name: String!, $description: String!, $alias: String!) {
  createProject(
    input: {workspaceId: $workspaceId, name: $name, description: $description, alias: $alias}
  ) {
    project {
      id
      name
      description
      alias
      publication {
        scope
        assetPublic
      }
    }
  }
}
    `;
export type CreateProjectMutationFn = Apollo.MutationFunction<CreateProjectMutation, CreateProjectMutationVariables>;

/**
 * __useCreateProjectMutation__
 *
 * To run a mutation, you first call `useCreateProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProjectMutation, { data, loading, error }] = useCreateProjectMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      name: // value for 'name'
 *      description: // value for 'description'
 *      alias: // value for 'alias'
 *   },
 * });
 */
export function useCreateProjectMutation(baseOptions?: Apollo.MutationHookOptions<CreateProjectMutation, CreateProjectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateProjectMutation, CreateProjectMutationVariables>(CreateProjectDocument, options);
      }
export type CreateProjectMutationHookResult = ReturnType<typeof useCreateProjectMutation>;
export type CreateProjectMutationResult = Apollo.MutationResult<CreateProjectMutation>;
export type CreateProjectMutationOptions = Apollo.BaseMutationOptions<CreateProjectMutation, CreateProjectMutationVariables>;
export const DeleteProjectDocument = gql`
    mutation DeleteProject($projectId: ID!) {
  deleteProject(input: {projectId: $projectId}) {
    projectId
  }
}
    `;
export type DeleteProjectMutationFn = Apollo.MutationFunction<DeleteProjectMutation, DeleteProjectMutationVariables>;

/**
 * __useDeleteProjectMutation__
 *
 * To run a mutation, you first call `useDeleteProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteProjectMutation, { data, loading, error }] = useDeleteProjectMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useDeleteProjectMutation(baseOptions?: Apollo.MutationHookOptions<DeleteProjectMutation, DeleteProjectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteProjectMutation, DeleteProjectMutationVariables>(DeleteProjectDocument, options);
      }
export type DeleteProjectMutationHookResult = ReturnType<typeof useDeleteProjectMutation>;
export type DeleteProjectMutationResult = Apollo.MutationResult<DeleteProjectMutation>;
export type DeleteProjectMutationOptions = Apollo.BaseMutationOptions<DeleteProjectMutation, DeleteProjectMutationVariables>;
export const UpdateProjectDocument = gql`
    mutation UpdateProject($projectId: ID!, $name: String, $description: String, $alias: String, $publication: UpdateProjectPublicationInput, $requestRoles: [Role!]) {
  updateProject(
    input: {projectId: $projectId, name: $name, description: $description, alias: $alias, publication: $publication, requestRoles: $requestRoles}
  ) {
    project {
      id
      name
      description
      alias
      publication {
        scope
        assetPublic
      }
      requestRoles
    }
  }
}
    `;
export type UpdateProjectMutationFn = Apollo.MutationFunction<UpdateProjectMutation, UpdateProjectMutationVariables>;

/**
 * __useUpdateProjectMutation__
 *
 * To run a mutation, you first call `useUpdateProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProjectMutation, { data, loading, error }] = useUpdateProjectMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      name: // value for 'name'
 *      description: // value for 'description'
 *      alias: // value for 'alias'
 *      publication: // value for 'publication'
 *      requestRoles: // value for 'requestRoles'
 *   },
 * });
 */
export function useUpdateProjectMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProjectMutation, UpdateProjectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateProjectMutation, UpdateProjectMutationVariables>(UpdateProjectDocument, options);
      }
export type UpdateProjectMutationHookResult = ReturnType<typeof useUpdateProjectMutation>;
export type UpdateProjectMutationResult = Apollo.MutationResult<UpdateProjectMutation>;
export type UpdateProjectMutationOptions = Apollo.BaseMutationOptions<UpdateProjectMutation, UpdateProjectMutationVariables>;
export const RegeneratePublicApiTokenDocument = gql`
    mutation RegeneratePublicApiToken($projectId: ID!) {
  regeneratePublicApiToken(input: {projectId: $projectId}) {
    project {
      id
    }
  }
}
    `;
export type RegeneratePublicApiTokenMutationFn = Apollo.MutationFunction<RegeneratePublicApiTokenMutation, RegeneratePublicApiTokenMutationVariables>;

/**
 * __useRegeneratePublicApiTokenMutation__
 *
 * To run a mutation, you first call `useRegeneratePublicApiTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegeneratePublicApiTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [regeneratePublicApiTokenMutation, { data, loading, error }] = useRegeneratePublicApiTokenMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useRegeneratePublicApiTokenMutation(baseOptions?: Apollo.MutationHookOptions<RegeneratePublicApiTokenMutation, RegeneratePublicApiTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegeneratePublicApiTokenMutation, RegeneratePublicApiTokenMutationVariables>(RegeneratePublicApiTokenDocument, options);
      }
export type RegeneratePublicApiTokenMutationHookResult = ReturnType<typeof useRegeneratePublicApiTokenMutation>;
export type RegeneratePublicApiTokenMutationResult = Apollo.MutationResult<RegeneratePublicApiTokenMutation>;
export type RegeneratePublicApiTokenMutationOptions = Apollo.BaseMutationOptions<RegeneratePublicApiTokenMutation, RegeneratePublicApiTokenMutationVariables>;
export const GetRequestsDocument = gql`
    query GetRequests($projectId: ID!, $key: String, $state: [RequestState!], $pagination: Pagination, $createdBy: ID, $reviewer: ID, $sort: Sort) {
  requests(
    projectId: $projectId
    key: $key
    state: $state
    pagination: $pagination
    createdBy: $createdBy
    reviewer: $reviewer
    sort: $sort
  ) {
    nodes {
      id
      title
      description
      createdBy {
        id
        name
        email
      }
      workspaceId
      projectId
      threadId
      reviewersId
      reviewers {
        id
        name
        email
      }
      state
      createdAt
      updatedAt
      approvedAt
      closedAt
      thread {
        ...threadFragment
      }
    }
    totalCount
  }
}
    ${ThreadFragmentFragmentDoc}`;

/**
 * __useGetRequestsQuery__
 *
 * To run a query within a React component, call `useGetRequestsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRequestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRequestsQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      key: // value for 'key'
 *      state: // value for 'state'
 *      pagination: // value for 'pagination'
 *      createdBy: // value for 'createdBy'
 *      reviewer: // value for 'reviewer'
 *      sort: // value for 'sort'
 *   },
 * });
 */
export function useGetRequestsQuery(baseOptions: Apollo.QueryHookOptions<GetRequestsQuery, GetRequestsQueryVariables> & ({ variables: GetRequestsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRequestsQuery, GetRequestsQueryVariables>(GetRequestsDocument, options);
      }
export function useGetRequestsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRequestsQuery, GetRequestsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRequestsQuery, GetRequestsQueryVariables>(GetRequestsDocument, options);
        }
export function useGetRequestsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRequestsQuery, GetRequestsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRequestsQuery, GetRequestsQueryVariables>(GetRequestsDocument, options);
        }
export type GetRequestsQueryHookResult = ReturnType<typeof useGetRequestsQuery>;
export type GetRequestsLazyQueryHookResult = ReturnType<typeof useGetRequestsLazyQuery>;
export type GetRequestsSuspenseQueryHookResult = ReturnType<typeof useGetRequestsSuspenseQuery>;
export type GetRequestsQueryResult = Apollo.QueryResult<GetRequestsQuery, GetRequestsQueryVariables>;
export const GetModalRequestsDocument = gql`
    query GetModalRequests($projectId: ID!, $key: String, $state: [RequestState!], $pagination: Pagination, $createdBy: ID, $reviewer: ID, $sort: Sort) {
  requests(
    projectId: $projectId
    key: $key
    state: $state
    pagination: $pagination
    createdBy: $createdBy
    reviewer: $reviewer
    sort: $sort
  ) {
    nodes {
      id
      title
      description
      createdBy {
        name
      }
      items {
        itemId
        version
      }
      reviewers {
        id
        name
      }
      state
      createdAt
    }
    totalCount
  }
}
    `;

/**
 * __useGetModalRequestsQuery__
 *
 * To run a query within a React component, call `useGetModalRequestsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetModalRequestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetModalRequestsQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      key: // value for 'key'
 *      state: // value for 'state'
 *      pagination: // value for 'pagination'
 *      createdBy: // value for 'createdBy'
 *      reviewer: // value for 'reviewer'
 *      sort: // value for 'sort'
 *   },
 * });
 */
export function useGetModalRequestsQuery(baseOptions: Apollo.QueryHookOptions<GetModalRequestsQuery, GetModalRequestsQueryVariables> & ({ variables: GetModalRequestsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetModalRequestsQuery, GetModalRequestsQueryVariables>(GetModalRequestsDocument, options);
      }
export function useGetModalRequestsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetModalRequestsQuery, GetModalRequestsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetModalRequestsQuery, GetModalRequestsQueryVariables>(GetModalRequestsDocument, options);
        }
export function useGetModalRequestsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetModalRequestsQuery, GetModalRequestsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetModalRequestsQuery, GetModalRequestsQueryVariables>(GetModalRequestsDocument, options);
        }
export type GetModalRequestsQueryHookResult = ReturnType<typeof useGetModalRequestsQuery>;
export type GetModalRequestsLazyQueryHookResult = ReturnType<typeof useGetModalRequestsLazyQuery>;
export type GetModalRequestsSuspenseQueryHookResult = ReturnType<typeof useGetModalRequestsSuspenseQuery>;
export type GetModalRequestsQueryResult = Apollo.QueryResult<GetModalRequestsQuery, GetModalRequestsQueryVariables>;
export const GetRequestDocument = gql`
    query GetRequest($requestId: ID!) {
  node(id: $requestId, type: REQUEST) {
    id
    ... on Request {
      ...requestFragment
    }
  }
}
    ${RequestFragmentFragmentDoc}`;

/**
 * __useGetRequestQuery__
 *
 * To run a query within a React component, call `useGetRequestQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRequestQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRequestQuery({
 *   variables: {
 *      requestId: // value for 'requestId'
 *   },
 * });
 */
export function useGetRequestQuery(baseOptions: Apollo.QueryHookOptions<GetRequestQuery, GetRequestQueryVariables> & ({ variables: GetRequestQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRequestQuery, GetRequestQueryVariables>(GetRequestDocument, options);
      }
export function useGetRequestLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRequestQuery, GetRequestQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRequestQuery, GetRequestQueryVariables>(GetRequestDocument, options);
        }
export function useGetRequestSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRequestQuery, GetRequestQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRequestQuery, GetRequestQueryVariables>(GetRequestDocument, options);
        }
export type GetRequestQueryHookResult = ReturnType<typeof useGetRequestQuery>;
export type GetRequestLazyQueryHookResult = ReturnType<typeof useGetRequestLazyQuery>;
export type GetRequestSuspenseQueryHookResult = ReturnType<typeof useGetRequestSuspenseQuery>;
export type GetRequestQueryResult = Apollo.QueryResult<GetRequestQuery, GetRequestQueryVariables>;
export const CreateRequestDocument = gql`
    mutation CreateRequest($projectId: ID!, $title: String!, $description: String, $state: RequestState, $reviewersId: [ID!], $items: [RequestItemInput!]!) {
  createRequest(
    input: {projectId: $projectId, title: $title, description: $description, state: $state, reviewersId: $reviewersId, items: $items}
  ) {
    request {
      ...requestFragment
    }
  }
}
    ${RequestFragmentFragmentDoc}`;
export type CreateRequestMutationFn = Apollo.MutationFunction<CreateRequestMutation, CreateRequestMutationVariables>;

/**
 * __useCreateRequestMutation__
 *
 * To run a mutation, you first call `useCreateRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRequestMutation, { data, loading, error }] = useCreateRequestMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      title: // value for 'title'
 *      description: // value for 'description'
 *      state: // value for 'state'
 *      reviewersId: // value for 'reviewersId'
 *      items: // value for 'items'
 *   },
 * });
 */
export function useCreateRequestMutation(baseOptions?: Apollo.MutationHookOptions<CreateRequestMutation, CreateRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateRequestMutation, CreateRequestMutationVariables>(CreateRequestDocument, options);
      }
export type CreateRequestMutationHookResult = ReturnType<typeof useCreateRequestMutation>;
export type CreateRequestMutationResult = Apollo.MutationResult<CreateRequestMutation>;
export type CreateRequestMutationOptions = Apollo.BaseMutationOptions<CreateRequestMutation, CreateRequestMutationVariables>;
export const UpdateRequestDocument = gql`
    mutation UpdateRequest($requestId: ID!, $title: String, $description: String, $state: RequestState, $reviewersId: [ID!], $items: [RequestItemInput!]) {
  updateRequest(
    input: {requestId: $requestId, title: $title, description: $description, state: $state, reviewersId: $reviewersId, items: $items}
  ) {
    request {
      ...requestFragment
    }
  }
}
    ${RequestFragmentFragmentDoc}`;
export type UpdateRequestMutationFn = Apollo.MutationFunction<UpdateRequestMutation, UpdateRequestMutationVariables>;

/**
 * __useUpdateRequestMutation__
 *
 * To run a mutation, you first call `useUpdateRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRequestMutation, { data, loading, error }] = useUpdateRequestMutation({
 *   variables: {
 *      requestId: // value for 'requestId'
 *      title: // value for 'title'
 *      description: // value for 'description'
 *      state: // value for 'state'
 *      reviewersId: // value for 'reviewersId'
 *      items: // value for 'items'
 *   },
 * });
 */
export function useUpdateRequestMutation(baseOptions?: Apollo.MutationHookOptions<UpdateRequestMutation, UpdateRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateRequestMutation, UpdateRequestMutationVariables>(UpdateRequestDocument, options);
      }
export type UpdateRequestMutationHookResult = ReturnType<typeof useUpdateRequestMutation>;
export type UpdateRequestMutationResult = Apollo.MutationResult<UpdateRequestMutation>;
export type UpdateRequestMutationOptions = Apollo.BaseMutationOptions<UpdateRequestMutation, UpdateRequestMutationVariables>;
export const ApproveRequestDocument = gql`
    mutation ApproveRequest($requestId: ID!) {
  approveRequest(input: {requestId: $requestId}) {
    request {
      ...requestFragment
    }
  }
}
    ${RequestFragmentFragmentDoc}`;
export type ApproveRequestMutationFn = Apollo.MutationFunction<ApproveRequestMutation, ApproveRequestMutationVariables>;

/**
 * __useApproveRequestMutation__
 *
 * To run a mutation, you first call `useApproveRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useApproveRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [approveRequestMutation, { data, loading, error }] = useApproveRequestMutation({
 *   variables: {
 *      requestId: // value for 'requestId'
 *   },
 * });
 */
export function useApproveRequestMutation(baseOptions?: Apollo.MutationHookOptions<ApproveRequestMutation, ApproveRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ApproveRequestMutation, ApproveRequestMutationVariables>(ApproveRequestDocument, options);
      }
export type ApproveRequestMutationHookResult = ReturnType<typeof useApproveRequestMutation>;
export type ApproveRequestMutationResult = Apollo.MutationResult<ApproveRequestMutation>;
export type ApproveRequestMutationOptions = Apollo.BaseMutationOptions<ApproveRequestMutation, ApproveRequestMutationVariables>;
export const DeleteRequestDocument = gql`
    mutation DeleteRequest($projectId: ID!, $requestsId: [ID!]!) {
  deleteRequest(input: {projectId: $projectId, requestsId: $requestsId}) {
    requests
  }
}
    `;
export type DeleteRequestMutationFn = Apollo.MutationFunction<DeleteRequestMutation, DeleteRequestMutationVariables>;

/**
 * __useDeleteRequestMutation__
 *
 * To run a mutation, you first call `useDeleteRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteRequestMutation, { data, loading, error }] = useDeleteRequestMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      requestsId: // value for 'requestsId'
 *   },
 * });
 */
export function useDeleteRequestMutation(baseOptions?: Apollo.MutationHookOptions<DeleteRequestMutation, DeleteRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteRequestMutation, DeleteRequestMutationVariables>(DeleteRequestDocument, options);
      }
export type DeleteRequestMutationHookResult = ReturnType<typeof useDeleteRequestMutation>;
export type DeleteRequestMutationResult = Apollo.MutationResult<DeleteRequestMutation>;
export type DeleteRequestMutationOptions = Apollo.BaseMutationOptions<DeleteRequestMutation, DeleteRequestMutationVariables>;
export const CreateThreadWithCommentDocument = gql`
    mutation CreateThreadWithComment($workspaceId: ID!, $resourceId: ID!, $resourceType: ResourceType!, $content: String!) {
  createThreadWithComment(
    input: {workspaceId: $workspaceId, resourceId: $resourceId, resourceType: $resourceType, content: $content}
  ) {
    thread {
      id
      workspaceId
      comments {
        id
        author {
          ... on User {
            id
            name
            email
          }
          ... on Integration {
            id
            name
          }
        }
        authorType
        authorId
        content
        createdAt
      }
    }
  }
}
    `;
export type CreateThreadWithCommentMutationFn = Apollo.MutationFunction<CreateThreadWithCommentMutation, CreateThreadWithCommentMutationVariables>;

/**
 * __useCreateThreadWithCommentMutation__
 *
 * To run a mutation, you first call `useCreateThreadWithCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateThreadWithCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createThreadWithCommentMutation, { data, loading, error }] = useCreateThreadWithCommentMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      resourceId: // value for 'resourceId'
 *      resourceType: // value for 'resourceType'
 *      content: // value for 'content'
 *   },
 * });
 */
export function useCreateThreadWithCommentMutation(baseOptions?: Apollo.MutationHookOptions<CreateThreadWithCommentMutation, CreateThreadWithCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateThreadWithCommentMutation, CreateThreadWithCommentMutationVariables>(CreateThreadWithCommentDocument, options);
      }
export type CreateThreadWithCommentMutationHookResult = ReturnType<typeof useCreateThreadWithCommentMutation>;
export type CreateThreadWithCommentMutationResult = Apollo.MutationResult<CreateThreadWithCommentMutation>;
export type CreateThreadWithCommentMutationOptions = Apollo.BaseMutationOptions<CreateThreadWithCommentMutation, CreateThreadWithCommentMutationVariables>;
export const GetUserByNameOrEmailDocument = gql`
    query GetUserByNameOrEmail($nameOrEmail: String!) {
  userByNameOrEmail(nameOrEmail: $nameOrEmail) {
    id
    name
    email
  }
}
    `;

/**
 * __useGetUserByNameOrEmailQuery__
 *
 * To run a query within a React component, call `useGetUserByNameOrEmailQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserByNameOrEmailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserByNameOrEmailQuery({
 *   variables: {
 *      nameOrEmail: // value for 'nameOrEmail'
 *   },
 * });
 */
export function useGetUserByNameOrEmailQuery(baseOptions: Apollo.QueryHookOptions<GetUserByNameOrEmailQuery, GetUserByNameOrEmailQueryVariables> & ({ variables: GetUserByNameOrEmailQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserByNameOrEmailQuery, GetUserByNameOrEmailQueryVariables>(GetUserByNameOrEmailDocument, options);
      }
export function useGetUserByNameOrEmailLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserByNameOrEmailQuery, GetUserByNameOrEmailQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserByNameOrEmailQuery, GetUserByNameOrEmailQueryVariables>(GetUserByNameOrEmailDocument, options);
        }
export function useGetUserByNameOrEmailSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetUserByNameOrEmailQuery, GetUserByNameOrEmailQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserByNameOrEmailQuery, GetUserByNameOrEmailQueryVariables>(GetUserByNameOrEmailDocument, options);
        }
export type GetUserByNameOrEmailQueryHookResult = ReturnType<typeof useGetUserByNameOrEmailQuery>;
export type GetUserByNameOrEmailLazyQueryHookResult = ReturnType<typeof useGetUserByNameOrEmailLazyQuery>;
export type GetUserByNameOrEmailSuspenseQueryHookResult = ReturnType<typeof useGetUserByNameOrEmailSuspenseQuery>;
export type GetUserByNameOrEmailQueryResult = Apollo.QueryResult<GetUserByNameOrEmailQuery, GetUserByNameOrEmailQueryVariables>;
export const GetUsersDocument = gql`
    query GetUsers($keyword: String!) {
  userSearch(keyword: $keyword) {
    id
    name
    email
  }
}
    `;

/**
 * __useGetUsersQuery__
 *
 * To run a query within a React component, call `useGetUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersQuery({
 *   variables: {
 *      keyword: // value for 'keyword'
 *   },
 * });
 */
export function useGetUsersQuery(baseOptions: Apollo.QueryHookOptions<GetUsersQuery, GetUsersQueryVariables> & ({ variables: GetUsersQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
      }
export function useGetUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export function useGetUsersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export type GetUsersQueryHookResult = ReturnType<typeof useGetUsersQuery>;
export type GetUsersLazyQueryHookResult = ReturnType<typeof useGetUsersLazyQuery>;
export type GetUsersSuspenseQueryHookResult = ReturnType<typeof useGetUsersSuspenseQuery>;
export type GetUsersQueryResult = Apollo.QueryResult<GetUsersQuery, GetUsersQueryVariables>;
export const GetMeDocument = gql`
    query GetMe {
  me {
    id
    name
    email
    lang
    myWorkspace {
      id
      name
    }
    workspaces {
      id
      name
      members {
        ... on WorkspaceUserMember {
          user {
            id
            name
            email
          }
          userId
          role
        }
        ... on WorkspaceIntegrationMember {
          integrationId
          integration {
            ...integrationFragment
          }
          role
          active
          invitedBy {
            id
            name
            email
          }
          invitedById
        }
      }
    }
    auths
    integrations {
      ...integrationFragment
    }
  }
}
    ${IntegrationFragmentFragmentDoc}`;

/**
 * __useGetMeQuery__
 *
 * To run a query within a React component, call `useGetMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetMeQuery(baseOptions?: Apollo.QueryHookOptions<GetMeQuery, GetMeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMeQuery, GetMeQueryVariables>(GetMeDocument, options);
      }
export function useGetMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMeQuery, GetMeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMeQuery, GetMeQueryVariables>(GetMeDocument, options);
        }
export function useGetMeSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetMeQuery, GetMeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMeQuery, GetMeQueryVariables>(GetMeDocument, options);
        }
export type GetMeQueryHookResult = ReturnType<typeof useGetMeQuery>;
export type GetMeLazyQueryHookResult = ReturnType<typeof useGetMeLazyQuery>;
export type GetMeSuspenseQueryHookResult = ReturnType<typeof useGetMeSuspenseQuery>;
export type GetMeQueryResult = Apollo.QueryResult<GetMeQuery, GetMeQueryVariables>;
export const GetProfileDocument = gql`
    query GetProfile {
  me {
    id
    name
    email
    lang
    theme
    myWorkspace {
      id
      name
    }
    auths
  }
}
    `;

/**
 * __useGetProfileQuery__
 *
 * To run a query within a React component, call `useGetProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetProfileQuery(baseOptions?: Apollo.QueryHookOptions<GetProfileQuery, GetProfileQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProfileQuery, GetProfileQueryVariables>(GetProfileDocument, options);
      }
export function useGetProfileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProfileQuery, GetProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProfileQuery, GetProfileQueryVariables>(GetProfileDocument, options);
        }
export function useGetProfileSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetProfileQuery, GetProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetProfileQuery, GetProfileQueryVariables>(GetProfileDocument, options);
        }
export type GetProfileQueryHookResult = ReturnType<typeof useGetProfileQuery>;
export type GetProfileLazyQueryHookResult = ReturnType<typeof useGetProfileLazyQuery>;
export type GetProfileSuspenseQueryHookResult = ReturnType<typeof useGetProfileSuspenseQuery>;
export type GetProfileQueryResult = Apollo.QueryResult<GetProfileQuery, GetProfileQueryVariables>;
export const GetLanguageDocument = gql`
    query GetLanguage {
  me {
    id
    lang
  }
}
    `;

/**
 * __useGetLanguageQuery__
 *
 * To run a query within a React component, call `useGetLanguageQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLanguageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLanguageQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetLanguageQuery(baseOptions?: Apollo.QueryHookOptions<GetLanguageQuery, GetLanguageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLanguageQuery, GetLanguageQueryVariables>(GetLanguageDocument, options);
      }
export function useGetLanguageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLanguageQuery, GetLanguageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLanguageQuery, GetLanguageQueryVariables>(GetLanguageDocument, options);
        }
export function useGetLanguageSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetLanguageQuery, GetLanguageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLanguageQuery, GetLanguageQueryVariables>(GetLanguageDocument, options);
        }
export type GetLanguageQueryHookResult = ReturnType<typeof useGetLanguageQuery>;
export type GetLanguageLazyQueryHookResult = ReturnType<typeof useGetLanguageLazyQuery>;
export type GetLanguageSuspenseQueryHookResult = ReturnType<typeof useGetLanguageSuspenseQuery>;
export type GetLanguageQueryResult = Apollo.QueryResult<GetLanguageQuery, GetLanguageQueryVariables>;
export const GetThemeDocument = gql`
    query GetTheme {
  me {
    id
    theme
  }
}
    `;

/**
 * __useGetThemeQuery__
 *
 * To run a query within a React component, call `useGetThemeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetThemeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetThemeQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetThemeQuery(baseOptions?: Apollo.QueryHookOptions<GetThemeQuery, GetThemeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetThemeQuery, GetThemeQueryVariables>(GetThemeDocument, options);
      }
export function useGetThemeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetThemeQuery, GetThemeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetThemeQuery, GetThemeQueryVariables>(GetThemeDocument, options);
        }
export function useGetThemeSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetThemeQuery, GetThemeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetThemeQuery, GetThemeQueryVariables>(GetThemeDocument, options);
        }
export type GetThemeQueryHookResult = ReturnType<typeof useGetThemeQuery>;
export type GetThemeLazyQueryHookResult = ReturnType<typeof useGetThemeLazyQuery>;
export type GetThemeSuspenseQueryHookResult = ReturnType<typeof useGetThemeSuspenseQuery>;
export type GetThemeQueryResult = Apollo.QueryResult<GetThemeQuery, GetThemeQueryVariables>;
export const UpdateMeDocument = gql`
    mutation UpdateMe($name: String, $email: String, $lang: Lang, $theme: Theme, $password: String, $passwordConfirmation: String) {
  updateMe(
    input: {name: $name, email: $email, lang: $lang, theme: $theme, password: $password, passwordConfirmation: $passwordConfirmation}
  ) {
    me {
      id
      name
      email
      lang
      theme
      myWorkspace {
        id
        name
      }
    }
  }
}
    `;
export type UpdateMeMutationFn = Apollo.MutationFunction<UpdateMeMutation, UpdateMeMutationVariables>;

/**
 * __useUpdateMeMutation__
 *
 * To run a mutation, you first call `useUpdateMeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMeMutation, { data, loading, error }] = useUpdateMeMutation({
 *   variables: {
 *      name: // value for 'name'
 *      email: // value for 'email'
 *      lang: // value for 'lang'
 *      theme: // value for 'theme'
 *      password: // value for 'password'
 *      passwordConfirmation: // value for 'passwordConfirmation'
 *   },
 * });
 */
export function useUpdateMeMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMeMutation, UpdateMeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMeMutation, UpdateMeMutationVariables>(UpdateMeDocument, options);
      }
export type UpdateMeMutationHookResult = ReturnType<typeof useUpdateMeMutation>;
export type UpdateMeMutationResult = Apollo.MutationResult<UpdateMeMutation>;
export type UpdateMeMutationOptions = Apollo.BaseMutationOptions<UpdateMeMutation, UpdateMeMutationVariables>;
export const DeleteMeDocument = gql`
    mutation DeleteMe($userId: ID!) {
  deleteMe(input: {userId: $userId}) {
    userId
  }
}
    `;
export type DeleteMeMutationFn = Apollo.MutationFunction<DeleteMeMutation, DeleteMeMutationVariables>;

/**
 * __useDeleteMeMutation__
 *
 * To run a mutation, you first call `useDeleteMeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMeMutation, { data, loading, error }] = useDeleteMeMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useDeleteMeMutation(baseOptions?: Apollo.MutationHookOptions<DeleteMeMutation, DeleteMeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteMeMutation, DeleteMeMutationVariables>(DeleteMeDocument, options);
      }
export type DeleteMeMutationHookResult = ReturnType<typeof useDeleteMeMutation>;
export type DeleteMeMutationResult = Apollo.MutationResult<DeleteMeMutation>;
export type DeleteMeMutationOptions = Apollo.BaseMutationOptions<DeleteMeMutation, DeleteMeMutationVariables>;
export const GetViewsDocument = gql`
    query GetViews($modelId: ID!) {
  view(modelId: $modelId) {
    id
    name
    modelId
    projectId
    order
    sort {
      field {
        type
        id
      }
      direction
    }
    columns {
      field {
        type
        id
      }
      visible
    }
    filter {
      ... on AndCondition {
        conditions {
          ... on BasicFieldCondition {
            fieldId {
              type
              id
            }
            basicOperator: operator
            basicValue: value
            __typename
          }
          ... on NullableFieldCondition {
            fieldId {
              type
              id
            }
            nullableOperator: operator
            __typename
          }
          ... on MultipleFieldCondition {
            fieldId {
              type
              id
            }
            multipleOperator: operator
            multipleValue: value
            __typename
          }
          ... on BoolFieldCondition {
            fieldId {
              type
              id
            }
            boolOperator: operator
            boolValue: value
          }
          ... on StringFieldCondition {
            fieldId {
              type
              id
            }
            stringOperator: operator
            stringValue: value
          }
          ... on NumberFieldCondition {
            fieldId {
              type
              id
            }
            numberOperator: operator
            numberValue: value
            __typename
          }
          ... on TimeFieldCondition {
            fieldId {
              type
              id
            }
            timeOperator: operator
            timeValue: value
            __typename
          }
          __typename
        }
      }
    }
    __typename
  }
  __typename
}
    `;

/**
 * __useGetViewsQuery__
 *
 * To run a query within a React component, call `useGetViewsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetViewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetViewsQuery({
 *   variables: {
 *      modelId: // value for 'modelId'
 *   },
 * });
 */
export function useGetViewsQuery(baseOptions: Apollo.QueryHookOptions<GetViewsQuery, GetViewsQueryVariables> & ({ variables: GetViewsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetViewsQuery, GetViewsQueryVariables>(GetViewsDocument, options);
      }
export function useGetViewsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetViewsQuery, GetViewsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetViewsQuery, GetViewsQueryVariables>(GetViewsDocument, options);
        }
export function useGetViewsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetViewsQuery, GetViewsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetViewsQuery, GetViewsQueryVariables>(GetViewsDocument, options);
        }
export type GetViewsQueryHookResult = ReturnType<typeof useGetViewsQuery>;
export type GetViewsLazyQueryHookResult = ReturnType<typeof useGetViewsLazyQuery>;
export type GetViewsSuspenseQueryHookResult = ReturnType<typeof useGetViewsSuspenseQuery>;
export type GetViewsQueryResult = Apollo.QueryResult<GetViewsQuery, GetViewsQueryVariables>;
export const CreateViewDocument = gql`
    mutation CreateView($projectId: ID!, $modelId: ID!, $name: String!, $sort: ItemSortInput, $filter: ConditionInput, $columns: [ColumnSelectionInput!]) {
  createView(
    input: {projectId: $projectId, modelId: $modelId, name: $name, sort: $sort, filter: $filter, columns: $columns}
  ) {
    view {
      id
      name
      modelId
      projectId
      sort {
        field {
          type
          id
        }
        direction
      }
      columns {
        field {
          type
          id
        }
        visible
      }
      filter {
        ... on AndCondition {
          conditions {
            ... on BasicFieldCondition {
              fieldId {
                type
                id
              }
              basicOperator: operator
              basicValue: value
              __typename
            }
            ... on NullableFieldCondition {
              fieldId {
                type
                id
              }
              nullableOperator: operator
              __typename
            }
            ... on MultipleFieldCondition {
              fieldId {
                type
                id
              }
              multipleOperator: operator
              multipleValue: value
              __typename
            }
            ... on BoolFieldCondition {
              fieldId {
                type
                id
              }
              boolOperator: operator
              boolValue: value
            }
            ... on StringFieldCondition {
              fieldId {
                type
                id
              }
              stringOperator: operator
              stringValue: value
            }
            ... on NumberFieldCondition {
              fieldId {
                type
                id
              }
              numberOperator: operator
              numberValue: value
              __typename
            }
            ... on TimeFieldCondition {
              fieldId {
                type
                id
              }
              timeOperator: operator
              timeValue: value
              __typename
            }
            __typename
          }
        }
      }
      __typename
    }
  }
}
    `;
export type CreateViewMutationFn = Apollo.MutationFunction<CreateViewMutation, CreateViewMutationVariables>;

/**
 * __useCreateViewMutation__
 *
 * To run a mutation, you first call `useCreateViewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateViewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createViewMutation, { data, loading, error }] = useCreateViewMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      modelId: // value for 'modelId'
 *      name: // value for 'name'
 *      sort: // value for 'sort'
 *      filter: // value for 'filter'
 *      columns: // value for 'columns'
 *   },
 * });
 */
export function useCreateViewMutation(baseOptions?: Apollo.MutationHookOptions<CreateViewMutation, CreateViewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateViewMutation, CreateViewMutationVariables>(CreateViewDocument, options);
      }
export type CreateViewMutationHookResult = ReturnType<typeof useCreateViewMutation>;
export type CreateViewMutationResult = Apollo.MutationResult<CreateViewMutation>;
export type CreateViewMutationOptions = Apollo.BaseMutationOptions<CreateViewMutation, CreateViewMutationVariables>;
export const UpdateViewDocument = gql`
    mutation UpdateView($viewId: ID!, $name: String!, $sort: ItemSortInput, $filter: ConditionInput, $columns: [ColumnSelectionInput!]) {
  updateView(
    input: {viewId: $viewId, name: $name, sort: $sort, filter: $filter, columns: $columns}
  ) {
    view {
      id
      name
      modelId
      projectId
      sort {
        field {
          type
          id
        }
        direction
      }
      columns {
        field {
          type
          id
        }
        visible
      }
      filter {
        ... on AndCondition {
          conditions {
            ... on BasicFieldCondition {
              fieldId {
                type
                id
              }
              basicOperator: operator
              basicValue: value
              __typename
            }
            ... on NullableFieldCondition {
              fieldId {
                type
                id
              }
              nullableOperator: operator
              __typename
            }
            ... on MultipleFieldCondition {
              fieldId {
                type
                id
              }
              multipleOperator: operator
              multipleValue: value
              __typename
            }
            ... on BoolFieldCondition {
              fieldId {
                type
                id
              }
              boolOperator: operator
              boolValue: value
            }
            ... on StringFieldCondition {
              fieldId {
                type
                id
              }
              stringOperator: operator
              stringValue: value
            }
            ... on NumberFieldCondition {
              fieldId {
                type
                id
              }
              numberOperator: operator
              numberValue: value
              __typename
            }
            ... on TimeFieldCondition {
              fieldId {
                type
                id
              }
              timeOperator: operator
              timeValue: value
              __typename
            }
            __typename
          }
        }
      }
      __typename
    }
  }
}
    `;
export type UpdateViewMutationFn = Apollo.MutationFunction<UpdateViewMutation, UpdateViewMutationVariables>;

/**
 * __useUpdateViewMutation__
 *
 * To run a mutation, you first call `useUpdateViewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateViewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateViewMutation, { data, loading, error }] = useUpdateViewMutation({
 *   variables: {
 *      viewId: // value for 'viewId'
 *      name: // value for 'name'
 *      sort: // value for 'sort'
 *      filter: // value for 'filter'
 *      columns: // value for 'columns'
 *   },
 * });
 */
export function useUpdateViewMutation(baseOptions?: Apollo.MutationHookOptions<UpdateViewMutation, UpdateViewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateViewMutation, UpdateViewMutationVariables>(UpdateViewDocument, options);
      }
export type UpdateViewMutationHookResult = ReturnType<typeof useUpdateViewMutation>;
export type UpdateViewMutationResult = Apollo.MutationResult<UpdateViewMutation>;
export type UpdateViewMutationOptions = Apollo.BaseMutationOptions<UpdateViewMutation, UpdateViewMutationVariables>;
export const DeleteViewDocument = gql`
    mutation DeleteView($viewId: ID!) {
  deleteView(input: {viewId: $viewId}) {
    viewId
  }
}
    `;
export type DeleteViewMutationFn = Apollo.MutationFunction<DeleteViewMutation, DeleteViewMutationVariables>;

/**
 * __useDeleteViewMutation__
 *
 * To run a mutation, you first call `useDeleteViewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteViewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteViewMutation, { data, loading, error }] = useDeleteViewMutation({
 *   variables: {
 *      viewId: // value for 'viewId'
 *   },
 * });
 */
export function useDeleteViewMutation(baseOptions?: Apollo.MutationHookOptions<DeleteViewMutation, DeleteViewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteViewMutation, DeleteViewMutationVariables>(DeleteViewDocument, options);
      }
export type DeleteViewMutationHookResult = ReturnType<typeof useDeleteViewMutation>;
export type DeleteViewMutationResult = Apollo.MutationResult<DeleteViewMutation>;
export type DeleteViewMutationOptions = Apollo.BaseMutationOptions<DeleteViewMutation, DeleteViewMutationVariables>;
export const UpdateViewsOrderDocument = gql`
    mutation UpdateViewsOrder($viewIds: [ID!]!) {
  updateViewsOrder(input: {viewIds: $viewIds}) {
    views {
      id
    }
  }
}
    `;
export type UpdateViewsOrderMutationFn = Apollo.MutationFunction<UpdateViewsOrderMutation, UpdateViewsOrderMutationVariables>;

/**
 * __useUpdateViewsOrderMutation__
 *
 * To run a mutation, you first call `useUpdateViewsOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateViewsOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateViewsOrderMutation, { data, loading, error }] = useUpdateViewsOrderMutation({
 *   variables: {
 *      viewIds: // value for 'viewIds'
 *   },
 * });
 */
export function useUpdateViewsOrderMutation(baseOptions?: Apollo.MutationHookOptions<UpdateViewsOrderMutation, UpdateViewsOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateViewsOrderMutation, UpdateViewsOrderMutationVariables>(UpdateViewsOrderDocument, options);
      }
export type UpdateViewsOrderMutationHookResult = ReturnType<typeof useUpdateViewsOrderMutation>;
export type UpdateViewsOrderMutationResult = Apollo.MutationResult<UpdateViewsOrderMutation>;
export type UpdateViewsOrderMutationOptions = Apollo.BaseMutationOptions<UpdateViewsOrderMutation, UpdateViewsOrderMutationVariables>;
export const CreateWebhookDocument = gql`
    mutation CreateWebhook($integrationId: ID!, $name: String!, $url: URL!, $active: Boolean!, $trigger: WebhookTriggerInput!, $secret: String!) {
  createWebhook(
    input: {integrationId: $integrationId, name: $name, url: $url, active: $active, trigger: $trigger, secret: $secret}
  ) {
    webhook {
      id
      name
      url
      active
      trigger {
        onItemCreate
        onItemUpdate
        onItemDelete
        onItemPublish
        onItemUnPublish
        onAssetUpload
        onAssetDecompress
        onAssetDelete
      }
      secret
      createdAt
      updatedAt
    }
  }
}
    `;
export type CreateWebhookMutationFn = Apollo.MutationFunction<CreateWebhookMutation, CreateWebhookMutationVariables>;

/**
 * __useCreateWebhookMutation__
 *
 * To run a mutation, you first call `useCreateWebhookMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWebhookMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWebhookMutation, { data, loading, error }] = useCreateWebhookMutation({
 *   variables: {
 *      integrationId: // value for 'integrationId'
 *      name: // value for 'name'
 *      url: // value for 'url'
 *      active: // value for 'active'
 *      trigger: // value for 'trigger'
 *      secret: // value for 'secret'
 *   },
 * });
 */
export function useCreateWebhookMutation(baseOptions?: Apollo.MutationHookOptions<CreateWebhookMutation, CreateWebhookMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWebhookMutation, CreateWebhookMutationVariables>(CreateWebhookDocument, options);
      }
export type CreateWebhookMutationHookResult = ReturnType<typeof useCreateWebhookMutation>;
export type CreateWebhookMutationResult = Apollo.MutationResult<CreateWebhookMutation>;
export type CreateWebhookMutationOptions = Apollo.BaseMutationOptions<CreateWebhookMutation, CreateWebhookMutationVariables>;
export const UpdateWebhookDocument = gql`
    mutation UpdateWebhook($integrationId: ID!, $webhookId: ID!, $name: String!, $url: URL!, $active: Boolean!, $trigger: WebhookTriggerInput!, $secret: String) {
  updateWebhook(
    input: {integrationId: $integrationId, webhookId: $webhookId, name: $name, url: $url, active: $active, trigger: $trigger, secret: $secret}
  ) {
    webhook {
      id
      name
      url
      active
      trigger {
        onItemCreate
        onItemUpdate
        onItemDelete
        onItemPublish
        onItemUnPublish
        onAssetUpload
        onAssetDecompress
        onAssetDelete
      }
      secret
      createdAt
      updatedAt
    }
  }
}
    `;
export type UpdateWebhookMutationFn = Apollo.MutationFunction<UpdateWebhookMutation, UpdateWebhookMutationVariables>;

/**
 * __useUpdateWebhookMutation__
 *
 * To run a mutation, you first call `useUpdateWebhookMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWebhookMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWebhookMutation, { data, loading, error }] = useUpdateWebhookMutation({
 *   variables: {
 *      integrationId: // value for 'integrationId'
 *      webhookId: // value for 'webhookId'
 *      name: // value for 'name'
 *      url: // value for 'url'
 *      active: // value for 'active'
 *      trigger: // value for 'trigger'
 *      secret: // value for 'secret'
 *   },
 * });
 */
export function useUpdateWebhookMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWebhookMutation, UpdateWebhookMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWebhookMutation, UpdateWebhookMutationVariables>(UpdateWebhookDocument, options);
      }
export type UpdateWebhookMutationHookResult = ReturnType<typeof useUpdateWebhookMutation>;
export type UpdateWebhookMutationResult = Apollo.MutationResult<UpdateWebhookMutation>;
export type UpdateWebhookMutationOptions = Apollo.BaseMutationOptions<UpdateWebhookMutation, UpdateWebhookMutationVariables>;
export const DeleteWebhookDocument = gql`
    mutation DeleteWebhook($integrationId: ID!, $webhookId: ID!) {
  deleteWebhook(input: {integrationId: $integrationId, webhookId: $webhookId}) {
    webhookId
  }
}
    `;
export type DeleteWebhookMutationFn = Apollo.MutationFunction<DeleteWebhookMutation, DeleteWebhookMutationVariables>;

/**
 * __useDeleteWebhookMutation__
 *
 * To run a mutation, you first call `useDeleteWebhookMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteWebhookMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteWebhookMutation, { data, loading, error }] = useDeleteWebhookMutation({
 *   variables: {
 *      integrationId: // value for 'integrationId'
 *      webhookId: // value for 'webhookId'
 *   },
 * });
 */
export function useDeleteWebhookMutation(baseOptions?: Apollo.MutationHookOptions<DeleteWebhookMutation, DeleteWebhookMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteWebhookMutation, DeleteWebhookMutationVariables>(DeleteWebhookDocument, options);
      }
export type DeleteWebhookMutationHookResult = ReturnType<typeof useDeleteWebhookMutation>;
export type DeleteWebhookMutationResult = Apollo.MutationResult<DeleteWebhookMutation>;
export type DeleteWebhookMutationOptions = Apollo.BaseMutationOptions<DeleteWebhookMutation, DeleteWebhookMutationVariables>;
export const GetWorkspacesDocument = gql`
    query GetWorkspaces {
  me {
    id
    name
    myWorkspace {
      id
      ...WorkspaceFragment
    }
    workspaces {
      id
      ...WorkspaceFragment
    }
  }
}
    ${WorkspaceFragmentFragmentDoc}`;

/**
 * __useGetWorkspacesQuery__
 *
 * To run a query within a React component, call `useGetWorkspacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspacesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetWorkspacesQuery(baseOptions?: Apollo.QueryHookOptions<GetWorkspacesQuery, GetWorkspacesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWorkspacesQuery, GetWorkspacesQueryVariables>(GetWorkspacesDocument, options);
      }
export function useGetWorkspacesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWorkspacesQuery, GetWorkspacesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWorkspacesQuery, GetWorkspacesQueryVariables>(GetWorkspacesDocument, options);
        }
export function useGetWorkspacesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetWorkspacesQuery, GetWorkspacesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWorkspacesQuery, GetWorkspacesQueryVariables>(GetWorkspacesDocument, options);
        }
export type GetWorkspacesQueryHookResult = ReturnType<typeof useGetWorkspacesQuery>;
export type GetWorkspacesLazyQueryHookResult = ReturnType<typeof useGetWorkspacesLazyQuery>;
export type GetWorkspacesSuspenseQueryHookResult = ReturnType<typeof useGetWorkspacesSuspenseQuery>;
export type GetWorkspacesQueryResult = Apollo.QueryResult<GetWorkspacesQuery, GetWorkspacesQueryVariables>;
export const GetWorkspaceDocument = gql`
    query GetWorkspace($id: ID!) {
  node(id: $id, type: WORKSPACE) {
    ... on Workspace {
      ...WorkspaceFragment
    }
  }
}
    ${WorkspaceFragmentFragmentDoc}`;

/**
 * __useGetWorkspaceQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetWorkspaceQuery(baseOptions: Apollo.QueryHookOptions<GetWorkspaceQuery, GetWorkspaceQueryVariables> & ({ variables: GetWorkspaceQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWorkspaceQuery, GetWorkspaceQueryVariables>(GetWorkspaceDocument, options);
      }
export function useGetWorkspaceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWorkspaceQuery, GetWorkspaceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWorkspaceQuery, GetWorkspaceQueryVariables>(GetWorkspaceDocument, options);
        }
export function useGetWorkspaceSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetWorkspaceQuery, GetWorkspaceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWorkspaceQuery, GetWorkspaceQueryVariables>(GetWorkspaceDocument, options);
        }
export type GetWorkspaceQueryHookResult = ReturnType<typeof useGetWorkspaceQuery>;
export type GetWorkspaceLazyQueryHookResult = ReturnType<typeof useGetWorkspaceLazyQuery>;
export type GetWorkspaceSuspenseQueryHookResult = ReturnType<typeof useGetWorkspaceSuspenseQuery>;
export type GetWorkspaceQueryResult = Apollo.QueryResult<GetWorkspaceQuery, GetWorkspaceQueryVariables>;
export const UpdateWorkspaceDocument = gql`
    mutation UpdateWorkspace($workspaceId: ID!, $name: String!) {
  updateWorkspace(input: {workspaceId: $workspaceId, name: $name}) {
    workspace {
      id
      ...WorkspaceFragment
    }
  }
}
    ${WorkspaceFragmentFragmentDoc}`;
export type UpdateWorkspaceMutationFn = Apollo.MutationFunction<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>;

/**
 * __useUpdateWorkspaceMutation__
 *
 * To run a mutation, you first call `useUpdateWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWorkspaceMutation, { data, loading, error }] = useUpdateWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>(UpdateWorkspaceDocument, options);
      }
export type UpdateWorkspaceMutationHookResult = ReturnType<typeof useUpdateWorkspaceMutation>;
export type UpdateWorkspaceMutationResult = Apollo.MutationResult<UpdateWorkspaceMutation>;
export type UpdateWorkspaceMutationOptions = Apollo.BaseMutationOptions<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>;
export const DeleteWorkspaceDocument = gql`
    mutation DeleteWorkspace($workspaceId: ID!) {
  deleteWorkspace(input: {workspaceId: $workspaceId}) {
    workspaceId
  }
}
    `;
export type DeleteWorkspaceMutationFn = Apollo.MutationFunction<DeleteWorkspaceMutation, DeleteWorkspaceMutationVariables>;

/**
 * __useDeleteWorkspaceMutation__
 *
 * To run a mutation, you first call `useDeleteWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteWorkspaceMutation, { data, loading, error }] = useDeleteWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useDeleteWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<DeleteWorkspaceMutation, DeleteWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteWorkspaceMutation, DeleteWorkspaceMutationVariables>(DeleteWorkspaceDocument, options);
      }
export type DeleteWorkspaceMutationHookResult = ReturnType<typeof useDeleteWorkspaceMutation>;
export type DeleteWorkspaceMutationResult = Apollo.MutationResult<DeleteWorkspaceMutation>;
export type DeleteWorkspaceMutationOptions = Apollo.BaseMutationOptions<DeleteWorkspaceMutation, DeleteWorkspaceMutationVariables>;
export const AddUsersToWorkspaceDocument = gql`
    mutation AddUsersToWorkspace($workspaceId: ID!, $users: [MemberInput!]!) {
  addUsersToWorkspace(input: {workspaceId: $workspaceId, users: $users}) {
    workspace {
      id
      ...WorkspaceFragment
    }
  }
}
    ${WorkspaceFragmentFragmentDoc}`;
export type AddUsersToWorkspaceMutationFn = Apollo.MutationFunction<AddUsersToWorkspaceMutation, AddUsersToWorkspaceMutationVariables>;

/**
 * __useAddUsersToWorkspaceMutation__
 *
 * To run a mutation, you first call `useAddUsersToWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddUsersToWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addUsersToWorkspaceMutation, { data, loading, error }] = useAddUsersToWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      users: // value for 'users'
 *   },
 * });
 */
export function useAddUsersToWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<AddUsersToWorkspaceMutation, AddUsersToWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddUsersToWorkspaceMutation, AddUsersToWorkspaceMutationVariables>(AddUsersToWorkspaceDocument, options);
      }
export type AddUsersToWorkspaceMutationHookResult = ReturnType<typeof useAddUsersToWorkspaceMutation>;
export type AddUsersToWorkspaceMutationResult = Apollo.MutationResult<AddUsersToWorkspaceMutation>;
export type AddUsersToWorkspaceMutationOptions = Apollo.BaseMutationOptions<AddUsersToWorkspaceMutation, AddUsersToWorkspaceMutationVariables>;
export const UpdateMemberOfWorkspaceDocument = gql`
    mutation UpdateMemberOfWorkspace($workspaceId: ID!, $userId: ID!, $role: Role!) {
  updateUserOfWorkspace(
    input: {workspaceId: $workspaceId, userId: $userId, role: $role}
  ) {
    workspace {
      id
      ...WorkspaceFragment
    }
  }
}
    ${WorkspaceFragmentFragmentDoc}`;
export type UpdateMemberOfWorkspaceMutationFn = Apollo.MutationFunction<UpdateMemberOfWorkspaceMutation, UpdateMemberOfWorkspaceMutationVariables>;

/**
 * __useUpdateMemberOfWorkspaceMutation__
 *
 * To run a mutation, you first call `useUpdateMemberOfWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMemberOfWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMemberOfWorkspaceMutation, { data, loading, error }] = useUpdateMemberOfWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      userId: // value for 'userId'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useUpdateMemberOfWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMemberOfWorkspaceMutation, UpdateMemberOfWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMemberOfWorkspaceMutation, UpdateMemberOfWorkspaceMutationVariables>(UpdateMemberOfWorkspaceDocument, options);
      }
export type UpdateMemberOfWorkspaceMutationHookResult = ReturnType<typeof useUpdateMemberOfWorkspaceMutation>;
export type UpdateMemberOfWorkspaceMutationResult = Apollo.MutationResult<UpdateMemberOfWorkspaceMutation>;
export type UpdateMemberOfWorkspaceMutationOptions = Apollo.BaseMutationOptions<UpdateMemberOfWorkspaceMutation, UpdateMemberOfWorkspaceMutationVariables>;
export const RemoveMultipleMembersFromWorkspaceDocument = gql`
    mutation RemoveMultipleMembersFromWorkspace($workspaceId: ID!, $userIds: [ID!]!) {
  removeMultipleMembersFromWorkspace(
    input: {workspaceId: $workspaceId, userIds: $userIds}
  ) {
    workspace {
      id
      ...WorkspaceFragment
    }
  }
}
    ${WorkspaceFragmentFragmentDoc}`;
export type RemoveMultipleMembersFromWorkspaceMutationFn = Apollo.MutationFunction<RemoveMultipleMembersFromWorkspaceMutation, RemoveMultipleMembersFromWorkspaceMutationVariables>;

/**
 * __useRemoveMultipleMembersFromWorkspaceMutation__
 *
 * To run a mutation, you first call `useRemoveMultipleMembersFromWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveMultipleMembersFromWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeMultipleMembersFromWorkspaceMutation, { data, loading, error }] = useRemoveMultipleMembersFromWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      userIds: // value for 'userIds'
 *   },
 * });
 */
export function useRemoveMultipleMembersFromWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<RemoveMultipleMembersFromWorkspaceMutation, RemoveMultipleMembersFromWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveMultipleMembersFromWorkspaceMutation, RemoveMultipleMembersFromWorkspaceMutationVariables>(RemoveMultipleMembersFromWorkspaceDocument, options);
      }
export type RemoveMultipleMembersFromWorkspaceMutationHookResult = ReturnType<typeof useRemoveMultipleMembersFromWorkspaceMutation>;
export type RemoveMultipleMembersFromWorkspaceMutationResult = Apollo.MutationResult<RemoveMultipleMembersFromWorkspaceMutation>;
export type RemoveMultipleMembersFromWorkspaceMutationOptions = Apollo.BaseMutationOptions<RemoveMultipleMembersFromWorkspaceMutation, RemoveMultipleMembersFromWorkspaceMutationVariables>;
export const AddIntegrationToWorkspaceDocument = gql`
    mutation AddIntegrationToWorkspace($workspaceId: ID!, $integrationId: ID!, $role: Role!) {
  addIntegrationToWorkspace(
    input: {workspaceId: $workspaceId, integrationId: $integrationId, role: $role}
  ) {
    workspace {
      id
      ...WorkspaceFragment
    }
  }
}
    ${WorkspaceFragmentFragmentDoc}`;
export type AddIntegrationToWorkspaceMutationFn = Apollo.MutationFunction<AddIntegrationToWorkspaceMutation, AddIntegrationToWorkspaceMutationVariables>;

/**
 * __useAddIntegrationToWorkspaceMutation__
 *
 * To run a mutation, you first call `useAddIntegrationToWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddIntegrationToWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addIntegrationToWorkspaceMutation, { data, loading, error }] = useAddIntegrationToWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      integrationId: // value for 'integrationId'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useAddIntegrationToWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<AddIntegrationToWorkspaceMutation, AddIntegrationToWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddIntegrationToWorkspaceMutation, AddIntegrationToWorkspaceMutationVariables>(AddIntegrationToWorkspaceDocument, options);
      }
export type AddIntegrationToWorkspaceMutationHookResult = ReturnType<typeof useAddIntegrationToWorkspaceMutation>;
export type AddIntegrationToWorkspaceMutationResult = Apollo.MutationResult<AddIntegrationToWorkspaceMutation>;
export type AddIntegrationToWorkspaceMutationOptions = Apollo.BaseMutationOptions<AddIntegrationToWorkspaceMutation, AddIntegrationToWorkspaceMutationVariables>;
export const UpdateIntegrationOfWorkspaceDocument = gql`
    mutation UpdateIntegrationOfWorkspace($workspaceId: ID!, $integrationId: ID!, $role: Role!) {
  updateIntegrationOfWorkspace(
    input: {workspaceId: $workspaceId, integrationId: $integrationId, role: $role}
  ) {
    workspace {
      id
      ...WorkspaceFragment
    }
  }
}
    ${WorkspaceFragmentFragmentDoc}`;
export type UpdateIntegrationOfWorkspaceMutationFn = Apollo.MutationFunction<UpdateIntegrationOfWorkspaceMutation, UpdateIntegrationOfWorkspaceMutationVariables>;

/**
 * __useUpdateIntegrationOfWorkspaceMutation__
 *
 * To run a mutation, you first call `useUpdateIntegrationOfWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateIntegrationOfWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateIntegrationOfWorkspaceMutation, { data, loading, error }] = useUpdateIntegrationOfWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      integrationId: // value for 'integrationId'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useUpdateIntegrationOfWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<UpdateIntegrationOfWorkspaceMutation, UpdateIntegrationOfWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateIntegrationOfWorkspaceMutation, UpdateIntegrationOfWorkspaceMutationVariables>(UpdateIntegrationOfWorkspaceDocument, options);
      }
export type UpdateIntegrationOfWorkspaceMutationHookResult = ReturnType<typeof useUpdateIntegrationOfWorkspaceMutation>;
export type UpdateIntegrationOfWorkspaceMutationResult = Apollo.MutationResult<UpdateIntegrationOfWorkspaceMutation>;
export type UpdateIntegrationOfWorkspaceMutationOptions = Apollo.BaseMutationOptions<UpdateIntegrationOfWorkspaceMutation, UpdateIntegrationOfWorkspaceMutationVariables>;
export const RemoveIntegrationFromWorkspaceDocument = gql`
    mutation RemoveIntegrationFromWorkspace($workspaceId: ID!, $integrationId: ID!) {
  removeIntegrationFromWorkspace(
    input: {workspaceId: $workspaceId, integrationId: $integrationId}
  ) {
    workspace {
      id
      ...WorkspaceFragment
    }
  }
}
    ${WorkspaceFragmentFragmentDoc}`;
export type RemoveIntegrationFromWorkspaceMutationFn = Apollo.MutationFunction<RemoveIntegrationFromWorkspaceMutation, RemoveIntegrationFromWorkspaceMutationVariables>;

/**
 * __useRemoveIntegrationFromWorkspaceMutation__
 *
 * To run a mutation, you first call `useRemoveIntegrationFromWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveIntegrationFromWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeIntegrationFromWorkspaceMutation, { data, loading, error }] = useRemoveIntegrationFromWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      integrationId: // value for 'integrationId'
 *   },
 * });
 */
export function useRemoveIntegrationFromWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<RemoveIntegrationFromWorkspaceMutation, RemoveIntegrationFromWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveIntegrationFromWorkspaceMutation, RemoveIntegrationFromWorkspaceMutationVariables>(RemoveIntegrationFromWorkspaceDocument, options);
      }
export type RemoveIntegrationFromWorkspaceMutationHookResult = ReturnType<typeof useRemoveIntegrationFromWorkspaceMutation>;
export type RemoveIntegrationFromWorkspaceMutationResult = Apollo.MutationResult<RemoveIntegrationFromWorkspaceMutation>;
export type RemoveIntegrationFromWorkspaceMutationOptions = Apollo.BaseMutationOptions<RemoveIntegrationFromWorkspaceMutation, RemoveIntegrationFromWorkspaceMutationVariables>;
export const CreateWorkspaceDocument = gql`
    mutation CreateWorkspace($name: String!) {
  createWorkspace(input: {name: $name}) {
    workspace {
      id
      ...WorkspaceFragment
    }
  }
}
    ${WorkspaceFragmentFragmentDoc}`;
export type CreateWorkspaceMutationFn = Apollo.MutationFunction<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>;

/**
 * __useCreateWorkspaceMutation__
 *
 * To run a mutation, you first call `useCreateWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWorkspaceMutation, { data, loading, error }] = useCreateWorkspaceMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>(CreateWorkspaceDocument, options);
      }
export type CreateWorkspaceMutationHookResult = ReturnType<typeof useCreateWorkspaceMutation>;
export type CreateWorkspaceMutationResult = Apollo.MutationResult<CreateWorkspaceMutation>;
export type CreateWorkspaceMutationOptions = Apollo.BaseMutationOptions<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>;
export const GetWorkspaceSettingsDocument = gql`
    query GetWorkspaceSettings($workspaceId: ID!) {
  node(id: $workspaceId, type: WorkspaceSettings) {
    id
    ... on WorkspaceSettings {
      id
      tiles {
        resources {
          ... on TileResource {
            id
            type
            props {
              name
              url
              image
            }
          }
        }
        enabled
        selectedResource
      }
      terrains {
        resources {
          ... on TerrainResource {
            id
            type
            props {
              name
              url
              image
              cesiumIonAssetId
              cesiumIonAccessToken
            }
          }
        }
        enabled
        selectedResource
      }
    }
  }
}
    `;

/**
 * __useGetWorkspaceSettingsQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceSettingsQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useGetWorkspaceSettingsQuery(baseOptions: Apollo.QueryHookOptions<GetWorkspaceSettingsQuery, GetWorkspaceSettingsQueryVariables> & ({ variables: GetWorkspaceSettingsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWorkspaceSettingsQuery, GetWorkspaceSettingsQueryVariables>(GetWorkspaceSettingsDocument, options);
      }
export function useGetWorkspaceSettingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWorkspaceSettingsQuery, GetWorkspaceSettingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWorkspaceSettingsQuery, GetWorkspaceSettingsQueryVariables>(GetWorkspaceSettingsDocument, options);
        }
export function useGetWorkspaceSettingsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetWorkspaceSettingsQuery, GetWorkspaceSettingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWorkspaceSettingsQuery, GetWorkspaceSettingsQueryVariables>(GetWorkspaceSettingsDocument, options);
        }
export type GetWorkspaceSettingsQueryHookResult = ReturnType<typeof useGetWorkspaceSettingsQuery>;
export type GetWorkspaceSettingsLazyQueryHookResult = ReturnType<typeof useGetWorkspaceSettingsLazyQuery>;
export type GetWorkspaceSettingsSuspenseQueryHookResult = ReturnType<typeof useGetWorkspaceSettingsSuspenseQuery>;
export type GetWorkspaceSettingsQueryResult = Apollo.QueryResult<GetWorkspaceSettingsQuery, GetWorkspaceSettingsQueryVariables>;
export const UpdateWorkspaceSettingsDocument = gql`
    mutation UpdateWorkspaceSettings($id: ID!, $tiles: ResourcesListInput, $terrains: ResourcesListInput) {
  updateWorkspaceSettings(input: {id: $id, tiles: $tiles, terrains: $terrains}) {
    workspaceSettings {
      id
      tiles {
        resources {
          ... on TileResource {
            id
            type
            props {
              name
              url
              image
            }
          }
        }
        enabled
        selectedResource
      }
      terrains {
        resources {
          ... on TerrainResource {
            id
            type
            props {
              name
              url
              image
              cesiumIonAssetId
              cesiumIonAccessToken
            }
          }
        }
        enabled
        selectedResource
      }
    }
  }
}
    `;
export type UpdateWorkspaceSettingsMutationFn = Apollo.MutationFunction<UpdateWorkspaceSettingsMutation, UpdateWorkspaceSettingsMutationVariables>;

/**
 * __useUpdateWorkspaceSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateWorkspaceSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWorkspaceSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWorkspaceSettingsMutation, { data, loading, error }] = useUpdateWorkspaceSettingsMutation({
 *   variables: {
 *      id: // value for 'id'
 *      tiles: // value for 'tiles'
 *      terrains: // value for 'terrains'
 *   },
 * });
 */
export function useUpdateWorkspaceSettingsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWorkspaceSettingsMutation, UpdateWorkspaceSettingsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWorkspaceSettingsMutation, UpdateWorkspaceSettingsMutationVariables>(UpdateWorkspaceSettingsDocument, options);
      }
export type UpdateWorkspaceSettingsMutationHookResult = ReturnType<typeof useUpdateWorkspaceSettingsMutation>;
export type UpdateWorkspaceSettingsMutationResult = Apollo.MutationResult<UpdateWorkspaceSettingsMutation>;
export type UpdateWorkspaceSettingsMutationOptions = Apollo.BaseMutationOptions<UpdateWorkspaceSettingsMutation, UpdateWorkspaceSettingsMutationVariables>;