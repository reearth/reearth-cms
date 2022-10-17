import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Any: any;
  Cursor: string;
  DateTime: Date;
  FileSize: number;
  Lang: string;
  URL: string;
  Upload: any;
};

export type AddIntegrationToWorkspaceInput = {
  integrationId: Scalars['ID'];
  role: Role;
  workspaceId: Scalars['ID'];
};

export type AddMemberToWorkspacePayload = {
  __typename?: 'AddMemberToWorkspacePayload';
  workspace: Workspace;
};

export type AddUserToWorkspaceInput = {
  role: Role;
  userId: Scalars['ID'];
  workspaceId: Scalars['ID'];
};

export type Asset = Node & {
  __typename?: 'Asset';
  createdAt: Scalars['DateTime'];
  createdBy?: Maybe<User>;
  createdById: Scalars['ID'];
  file: AssetFile;
  fileName: Scalars['String'];
  id: Scalars['ID'];
  previewType?: Maybe<PreviewType>;
  project?: Maybe<Project>;
  projectId: Scalars['ID'];
  size: Scalars['FileSize'];
  thread?: Maybe<Thread>;
  threadId: Scalars['ID'];
  url: Scalars['String'];
  uuid: Scalars['String'];
};

export type AssetConnection = {
  __typename?: 'AssetConnection';
  edges: Array<AssetEdge>;
  nodes: Array<Maybe<Asset>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type AssetEdge = {
  __typename?: 'AssetEdge';
  cursor: Scalars['Cursor'];
  node?: Maybe<Asset>;
};

export type AssetFile = {
  __typename?: 'AssetFile';
  children?: Maybe<Array<AssetFile>>;
  contentType?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  path: Scalars['String'];
  size: Scalars['FileSize'];
};

export enum AssetSortType {
  Date = 'DATE',
  Name = 'NAME',
  Size = 'SIZE'
}

export type Comment = {
  __typename?: 'Comment';
  author?: Maybe<User>;
  authorId: Scalars['ID'];
  content: Scalars['String'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
};

export type CreateAssetInput = {
  createdById: Scalars['ID'];
  file: Scalars['Upload'];
  projectId: Scalars['ID'];
};

export type CreateAssetPayload = {
  __typename?: 'CreateAssetPayload';
  asset: Asset;
};

export type CreateCommentInput = {
  content: Scalars['String'];
  threadId: Scalars['ID'];
};

export type CreateCommentPayload = {
  __typename?: 'CreateCommentPayload';
  comment: Comment;
};

export type CreateFieldInput = {
  description?: InputMaybe<Scalars['String']>;
  key: Scalars['String'];
  modelId: Scalars['ID'];
  multiValue: Scalars['Boolean'];
  required: Scalars['Boolean'];
  title: Scalars['String'];
  type: SchemaFiledType;
  typeProperty: SchemaFieldTypePropertyInput;
  unique: Scalars['Boolean'];
};

export type CreateIntegrationInput = {
  description?: InputMaybe<Scalars['String']>;
  logoUrl: Scalars['URL'];
  name: Scalars['String'];
  type: IntegrationType;
};

export type CreateItemInput = {
  fields: Array<ItemFieldInput>;
  schemaId: Scalars['ID'];
};

export type CreateModelInput = {
  description?: InputMaybe<Scalars['String']>;
  key?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  projectId: Scalars['ID'];
};

export type CreateProjectInput = {
  alias?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  workspaceId: Scalars['ID'];
};

export type CreateWebhookInput = {
  active: Scalars['Boolean'];
  integrationId: Scalars['ID'];
  name: Scalars['String'];
  trigger: WebhookTriggerInput;
  url: Scalars['URL'];
};

export type CreateWorkspaceInput = {
  name: Scalars['String'];
};

export type CreateWorkspacePayload = {
  __typename?: 'CreateWorkspacePayload';
  workspace: Workspace;
};

export type DeleteAssetInput = {
  assetId: Scalars['ID'];
};

export type DeleteAssetPayload = {
  __typename?: 'DeleteAssetPayload';
  assetId: Scalars['ID'];
};

export type DeleteCommentInput = {
  commentId: Scalars['ID'];
  threadId: Scalars['ID'];
};

export type DeleteCommentPayload = {
  __typename?: 'DeleteCommentPayload';
  commentId: Scalars['ID'];
};

export type DeleteFieldInput = {
  fieldId: Scalars['ID'];
  modelId: Scalars['ID'];
};

export type DeleteFieldPayload = {
  __typename?: 'DeleteFieldPayload';
  fieldId: Scalars['ID'];
};

export type DeleteIntegrationInput = {
  integrationId: Scalars['ID'];
};

export type DeleteIntegrationPayload = {
  __typename?: 'DeleteIntegrationPayload';
  integrationId: Scalars['ID'];
};

export type DeleteItemInput = {
  itemId: Scalars['ID'];
};

export type DeleteItemPayload = {
  __typename?: 'DeleteItemPayload';
  itemId: Scalars['ID'];
};

export type DeleteMeInput = {
  userId: Scalars['ID'];
};

export type DeleteMePayload = {
  __typename?: 'DeleteMePayload';
  userId: Scalars['ID'];
};

export type DeleteModelInput = {
  modelId: Scalars['ID'];
};

export type DeleteModelPayload = {
  __typename?: 'DeleteModelPayload';
  modelId: Scalars['ID'];
};

export type DeleteProjectInput = {
  projectId: Scalars['ID'];
};

export type DeleteProjectPayload = {
  __typename?: 'DeleteProjectPayload';
  projectId: Scalars['ID'];
};

export type DeleteWebhookInput = {
  integrationId: Scalars['ID'];
  webhookId: Scalars['ID'];
};

export type DeleteWebhookPayload = {
  __typename?: 'DeleteWebhookPayload';
  webhookId: Scalars['ID'];
};

export type DeleteWorkspaceInput = {
  workspaceId: Scalars['ID'];
};

export type DeleteWorkspacePayload = {
  __typename?: 'DeleteWorkspacePayload';
  workspaceId: Scalars['ID'];
};

export type FieldPayload = {
  __typename?: 'FieldPayload';
  field: SchemaField;
};

export type Integration = Node & {
  __typename?: 'Integration';
  config?: Maybe<IntegrationConfig>;
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  developer: User;
  developerId: Scalars['ID'];
  iType: IntegrationType;
  id: Scalars['ID'];
  logoUrl: Scalars['URL'];
  name: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type IntegrationConfig = {
  __typename?: 'IntegrationConfig';
  token: Scalars['String'];
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
  fields?: Maybe<Array<ItemField>>;
  id: Scalars['ID'];
  schemaId: Scalars['ID'];
};

export type ItemConnection = {
  __typename?: 'ItemConnection';
  edges: Array<ItemEdge>;
  nodes: Array<Maybe<Item>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type ItemEdge = {
  __typename?: 'ItemEdge';
  cursor: Scalars['Cursor'];
  node?: Maybe<Item>;
};

export type ItemField = {
  __typename?: 'ItemField';
  schemaFieldId: Scalars['ID'];
  type: SchemaFiledType;
  value: Scalars['Any'];
};

export type ItemFieldInput = {
  schemaFieldId: Scalars['ID'];
  type: SchemaFiledType;
  value: Scalars['Any'];
};

export type ItemPayload = {
  __typename?: 'ItemPayload';
  item: Item;
};

export type KeyAvailability = {
  __typename?: 'KeyAvailability';
  available: Scalars['Boolean'];
  key: Scalars['String'];
};

export type Me = {
  __typename?: 'Me';
  auths: Array<Scalars['String']>;
  email: Scalars['String'];
  id: Scalars['ID'];
  integrations: Array<Integration>;
  lang: Scalars['Lang'];
  myWorkspace: Workspace;
  myWorkspaceId: Scalars['ID'];
  name: Scalars['String'];
  theme: Theme;
  workspaces: Array<Workspace>;
};

export type Model = Node & {
  __typename?: 'Model';
  createdAt: Scalars['DateTime'];
  description: Scalars['String'];
  id: Scalars['ID'];
  key: Scalars['String'];
  name: Scalars['String'];
  project: Project;
  projectId: Scalars['ID'];
  public: Scalars['Boolean'];
  schema: Schema;
  schemaId: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
};

export type ModelConnection = {
  __typename?: 'ModelConnection';
  edges: Array<ModelEdge>;
  nodes: Array<Maybe<Model>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type ModelEdge = {
  __typename?: 'ModelEdge';
  cursor: Scalars['Cursor'];
  node?: Maybe<Model>;
};

export type ModelPayload = {
  __typename?: 'ModelPayload';
  model: Model;
};

export type Mutation = {
  __typename?: 'Mutation';
  addIntegrationToWorkspace?: Maybe<AddMemberToWorkspacePayload>;
  addUserToWorkspace?: Maybe<AddMemberToWorkspacePayload>;
  createAsset?: Maybe<CreateAssetPayload>;
  createComment?: Maybe<CreateCommentPayload>;
  createField?: Maybe<FieldPayload>;
  createIntegration?: Maybe<IntegrationPayload>;
  createItem?: Maybe<ItemPayload>;
  createModel?: Maybe<ModelPayload>;
  createProject?: Maybe<ProjectPayload>;
  createWebhook?: Maybe<WebhookPayload>;
  createWorkspace?: Maybe<CreateWorkspacePayload>;
  deleteAsset?: Maybe<DeleteAssetPayload>;
  deleteComment?: Maybe<DeleteCommentPayload>;
  deleteField?: Maybe<DeleteFieldPayload>;
  deleteIntegration?: Maybe<DeleteIntegrationPayload>;
  deleteItem?: Maybe<DeleteItemPayload>;
  deleteMe?: Maybe<DeleteMePayload>;
  deleteModel?: Maybe<DeleteModelPayload>;
  deleteProject?: Maybe<DeleteProjectPayload>;
  deleteWebhook?: Maybe<DeleteWebhookPayload>;
  deleteWorkspace?: Maybe<DeleteWorkspacePayload>;
  publishModel?: Maybe<PublishModelPayload>;
  removeIntegrationFromWorkspace?: Maybe<RemoveMemberFromWorkspacePayload>;
  removeMyAuth?: Maybe<UpdateMePayload>;
  removeUserFromWorkspace?: Maybe<RemoveMemberFromWorkspacePayload>;
  updateAsset?: Maybe<UpdateAssetPayload>;
  updateComment?: Maybe<UpdateCommentPayload>;
  updateField?: Maybe<FieldPayload>;
  updateIntegration?: Maybe<IntegrationPayload>;
  updateIntegrationOfWorkspace?: Maybe<UpdateMemberOfWorkspacePayload>;
  updateItem?: Maybe<ItemPayload>;
  updateMe?: Maybe<UpdateMePayload>;
  updateModel?: Maybe<ModelPayload>;
  updateProject?: Maybe<ProjectPayload>;
  updateUserOfWorkspace?: Maybe<UpdateMemberOfWorkspacePayload>;
  updateWebhook?: Maybe<WebhookPayload>;
  updateWorkspace?: Maybe<UpdateWorkspacePayload>;
};


export type MutationAddIntegrationToWorkspaceArgs = {
  input: AddIntegrationToWorkspaceInput;
};


export type MutationAddUserToWorkspaceArgs = {
  input: AddUserToWorkspaceInput;
};


export type MutationCreateAssetArgs = {
  input: CreateAssetInput;
};


export type MutationCreateCommentArgs = {
  input: CreateCommentInput;
};


export type MutationCreateFieldArgs = {
  input: CreateFieldInput;
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


export type MutationCreateWebhookArgs = {
  input: CreateWebhookInput;
};


export type MutationCreateWorkspaceArgs = {
  input: CreateWorkspaceInput;
};


export type MutationDeleteAssetArgs = {
  input: DeleteAssetInput;
};


export type MutationDeleteCommentArgs = {
  input: DeleteCommentInput;
};


export type MutationDeleteFieldArgs = {
  input: DeleteFieldInput;
};


export type MutationDeleteIntegrationArgs = {
  input: DeleteIntegrationInput;
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


export type MutationDeleteWebhookArgs = {
  input: DeleteWebhookInput;
};


export type MutationDeleteWorkspaceArgs = {
  input: DeleteWorkspaceInput;
};


export type MutationPublishModelArgs = {
  input: PublishModelInput;
};


export type MutationRemoveIntegrationFromWorkspaceArgs = {
  input: RemoveIntegrationFromWorkspaceInput;
};


export type MutationRemoveMyAuthArgs = {
  input: RemoveMyAuthInput;
};


export type MutationRemoveUserFromWorkspaceArgs = {
  input: RemoveUserFromWorkspaceInput;
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


export type MutationUpdateProjectArgs = {
  input: UpdateProjectInput;
};


export type MutationUpdateUserOfWorkspaceArgs = {
  input: UpdateUserOfWorkspaceInput;
};


export type MutationUpdateWebhookArgs = {
  input: UpdateWebhookInput;
};


export type MutationUpdateWorkspaceArgs = {
  input: UpdateWorkspaceInput;
};

export type Node = {
  id: Scalars['ID'];
};

export enum NodeType {
  Asset = 'ASSET',
  Project = 'PROJECT',
  User = 'USER',
  Workspace = 'WORKSPACE'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['Cursor']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['Cursor']>;
};

export type Pagination = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export enum PreviewType {
  Geo = 'GEO',
  Geo3D = 'GEO3D',
  Image = 'IMAGE',
  Model3D = 'MODEL3D'
}

export type Project = Node & {
  __typename?: 'Project';
  alias: Scalars['String'];
  createdAt: Scalars['DateTime'];
  description: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  publication?: Maybe<ProjectPublication>;
  updatedAt: Scalars['DateTime'];
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars['ID'];
};

export type ProjectAliasAvailability = {
  __typename?: 'ProjectAliasAvailability';
  alias: Scalars['String'];
  available: Scalars['Boolean'];
};

export type ProjectConnection = {
  __typename?: 'ProjectConnection';
  edges: Array<ProjectEdge>;
  nodes: Array<Maybe<Project>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type ProjectEdge = {
  __typename?: 'ProjectEdge';
  cursor: Scalars['Cursor'];
  node?: Maybe<Project>;
};

export type ProjectPayload = {
  __typename?: 'ProjectPayload';
  project: Project;
};

export type ProjectPublication = {
  __typename?: 'ProjectPublication';
  assetPublic: Scalars['Boolean'];
  scope: ProjectPublicationScope;
};

export enum ProjectPublicationScope {
  Limited = 'LIMITED',
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export type PublishModelInput = {
  modelId: Scalars['ID'];
  status: Scalars['Boolean'];
};

export type PublishModelPayload = {
  __typename?: 'PublishModelPayload';
  modelId: Scalars['ID'];
  status: Scalars['Boolean'];
};

export type Query = {
  __typename?: 'Query';
  asset: Asset;
  assets: AssetConnection;
  checkModelKeyAvailability: KeyAvailability;
  checkProjectAlias: ProjectAliasAvailability;
  items: ItemConnection;
  me?: Maybe<Me>;
  models: ModelConnection;
  node?: Maybe<Node>;
  nodes: Array<Maybe<Node>>;
  projects: ProjectConnection;
  searchUser?: Maybe<User>;
  versionsByItem: Array<VersionedItem>;
};


export type QueryAssetArgs = {
  assetId: Scalars['ID'];
};


export type QueryAssetsArgs = {
  keyword?: InputMaybe<Scalars['String']>;
  pagination?: InputMaybe<Pagination>;
  projectId: Scalars['ID'];
  sort?: InputMaybe<AssetSortType>;
};


export type QueryCheckModelKeyAvailabilityArgs = {
  key: Scalars['String'];
  projectId: Scalars['ID'];
};


export type QueryCheckProjectAliasArgs = {
  alias: Scalars['String'];
};


export type QueryItemsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  schemaId: Scalars['ID'];
};


export type QueryModelsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  projectId: Scalars['ID'];
};


export type QueryNodeArgs = {
  id: Scalars['ID'];
  type: NodeType;
};


export type QueryNodesArgs = {
  id: Array<Scalars['ID']>;
  type: NodeType;
};


export type QueryProjectsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  workspaceId: Scalars['ID'];
};


export type QuerySearchUserArgs = {
  nameOrEmail: Scalars['String'];
};


export type QueryVersionsByItemArgs = {
  itemId: Scalars['ID'];
};

export type RemoveIntegrationFromWorkspaceInput = {
  integrationId: Scalars['ID'];
  workspaceId: Scalars['ID'];
};

export type RemoveMemberFromWorkspacePayload = {
  __typename?: 'RemoveMemberFromWorkspacePayload';
  workspace: Workspace;
};

export type RemoveMyAuthInput = {
  auth: Scalars['String'];
};

export type RemoveUserFromWorkspaceInput = {
  userId: Scalars['ID'];
  workspaceId: Scalars['ID'];
};

export enum Role {
  Owner = 'OWNER',
  Reader = 'READER',
  Writer = 'WRITER'
}

export type Schema = Node & {
  __typename?: 'Schema';
  fields: Array<SchemaField>;
  id: Scalars['ID'];
  project: Project;
  projectId: Scalars['ID'];
};

export type SchemaField = {
  __typename?: 'SchemaField';
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  key: Scalars['String'];
  model: Model;
  modelId: Scalars['ID'];
  multiValue: Scalars['Boolean'];
  required: Scalars['Boolean'];
  title: Scalars['String'];
  type: SchemaFiledType;
  typeProperty?: Maybe<SchemaFieldTypeProperty>;
  unique: Scalars['Boolean'];
  updatedAt: Scalars['DateTime'];
};

export type SchemaFieldAsset = {
  __typename?: 'SchemaFieldAsset';
  defaultValue?: Maybe<Scalars['ID']>;
};

export type SchemaFieldAssetInput = {
  defaultValue?: InputMaybe<Scalars['ID']>;
};

export type SchemaFieldBool = {
  __typename?: 'SchemaFieldBool';
  defaultValue?: Maybe<Scalars['Boolean']>;
};

export type SchemaFieldBoolInput = {
  defaultValue?: InputMaybe<Scalars['Boolean']>;
};

export type SchemaFieldDate = {
  __typename?: 'SchemaFieldDate';
  defaultValue?: Maybe<Scalars['DateTime']>;
};

export type SchemaFieldDateInput = {
  defaultValue?: InputMaybe<Scalars['DateTime']>;
};

export type SchemaFieldInteger = {
  __typename?: 'SchemaFieldInteger';
  defaultValue?: Maybe<Scalars['Int']>;
  max?: Maybe<Scalars['Int']>;
  min?: Maybe<Scalars['Int']>;
};

export type SchemaFieldIntegerInput = {
  defaultValue?: InputMaybe<Scalars['Int']>;
  max?: InputMaybe<Scalars['Int']>;
  min?: InputMaybe<Scalars['Int']>;
};

export type SchemaFieldMarkdown = {
  __typename?: 'SchemaFieldMarkdown';
  defaultValue?: Maybe<Scalars['String']>;
  maxLength?: Maybe<Scalars['Int']>;
};

export type SchemaFieldReference = {
  __typename?: 'SchemaFieldReference';
  modelId: Scalars['ID'];
};

export type SchemaFieldReferenceInput = {
  modelId: Scalars['ID'];
};

export type SchemaFieldRichText = {
  __typename?: 'SchemaFieldRichText';
  defaultValue?: Maybe<Scalars['String']>;
  maxLength?: Maybe<Scalars['Int']>;
};

export type SchemaFieldRichTextInput = {
  defaultValue?: InputMaybe<Scalars['String']>;
  maxLength?: InputMaybe<Scalars['Int']>;
};

export type SchemaFieldSelect = {
  __typename?: 'SchemaFieldSelect';
  defaultValue?: Maybe<Scalars['String']>;
  values: Array<Scalars['String']>;
};

export type SchemaFieldSelectInput = {
  defaultValue?: InputMaybe<Scalars['String']>;
  values: Array<Scalars['String']>;
};

export type SchemaFieldTag = {
  __typename?: 'SchemaFieldTag';
  defaultValue: Array<Scalars['String']>;
  values: Array<Scalars['String']>;
};

export type SchemaFieldTagInput = {
  defaultValue?: InputMaybe<Array<Scalars['String']>>;
  values: Array<Scalars['String']>;
};

export type SchemaFieldText = {
  __typename?: 'SchemaFieldText';
  defaultValue?: Maybe<Scalars['String']>;
  maxLength?: Maybe<Scalars['Int']>;
};

export type SchemaFieldTextArea = {
  __typename?: 'SchemaFieldTextArea';
  defaultValue?: Maybe<Scalars['String']>;
  maxLength?: Maybe<Scalars['Int']>;
};

export type SchemaFieldTextAreaInput = {
  defaultValue?: InputMaybe<Scalars['String']>;
  maxLength?: InputMaybe<Scalars['Int']>;
};

export type SchemaFieldTextInput = {
  defaultValue?: InputMaybe<Scalars['String']>;
  maxLength?: InputMaybe<Scalars['Int']>;
};

export type SchemaFieldTypeProperty = SchemaFieldAsset | SchemaFieldBool | SchemaFieldDate | SchemaFieldInteger | SchemaFieldMarkdown | SchemaFieldReference | SchemaFieldRichText | SchemaFieldSelect | SchemaFieldTag | SchemaFieldText | SchemaFieldTextArea | SchemaFieldUrl;

export type SchemaFieldTypePropertyInput = {
  asset?: InputMaybe<SchemaFieldAssetInput>;
  bool?: InputMaybe<SchemaFieldBoolInput>;
  date?: InputMaybe<SchemaFieldDateInput>;
  integer?: InputMaybe<SchemaFieldIntegerInput>;
  markdownText?: InputMaybe<SchemaMarkdownTextInput>;
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
  defaultValue?: Maybe<Scalars['String']>;
};

export type SchemaFieldUrlInput = {
  defaultValue?: InputMaybe<Scalars['String']>;
};

export enum SchemaFiledType {
  Asset = 'Asset',
  Bool = 'Bool',
  Date = 'Date',
  Integer = 'Integer',
  MarkdownText = 'MarkdownText',
  Reference = 'Reference',
  RichText = 'RichText',
  Select = 'Select',
  Tag = 'Tag',
  Text = 'Text',
  TextArea = 'TextArea',
  Url = 'URL'
}

export type SchemaMarkdownTextInput = {
  defaultValue?: InputMaybe<Scalars['String']>;
  maxLength?: InputMaybe<Scalars['Int']>;
};

export enum Theme {
  Dark = 'DARK',
  Default = 'DEFAULT',
  Light = 'LIGHT'
}

export type Thread = {
  __typename?: 'Thread';
  comments: Array<Comment>;
  id: Scalars['ID'];
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars['ID'];
};

export type UpdateAssetInput = {
  id: Scalars['ID'];
  previewType?: InputMaybe<PreviewType>;
};

export type UpdateAssetPayload = {
  __typename?: 'UpdateAssetPayload';
  asset: Asset;
};

export type UpdateCommentInput = {
  commentId: Scalars['ID'];
  content: Scalars['String'];
  threadId: Scalars['ID'];
};

export type UpdateCommentPayload = {
  __typename?: 'UpdateCommentPayload';
  comment: Comment;
};

export type UpdateFieldInput = {
  description?: InputMaybe<Scalars['String']>;
  fieldId: Scalars['ID'];
  key?: InputMaybe<Scalars['String']>;
  modelId: Scalars['ID'];
  title?: InputMaybe<Scalars['String']>;
  typeProperty?: InputMaybe<SchemaFieldTypePropertyInput>;
};

export type UpdateIntegrationInput = {
  description?: InputMaybe<Scalars['String']>;
  integrationId: Scalars['ID'];
  logoUrl?: InputMaybe<Scalars['URL']>;
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateIntegrationOfWorkspaceInput = {
  integrationId: Scalars['ID'];
  role: Role;
  workspaceId: Scalars['ID'];
};

export type UpdateItemInput = {
  fields: Array<ItemFieldInput>;
  itemId: Scalars['ID'];
};

export type UpdateMeInput = {
  email?: InputMaybe<Scalars['String']>;
  lang?: InputMaybe<Scalars['Lang']>;
  name?: InputMaybe<Scalars['String']>;
  password?: InputMaybe<Scalars['String']>;
  passwordConfirmation?: InputMaybe<Scalars['String']>;
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
  description?: InputMaybe<Scalars['String']>;
  key?: InputMaybe<Scalars['String']>;
  modelId: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  public: Scalars['Boolean'];
};

export type UpdateProjectInput = {
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  projectId: Scalars['ID'];
  publication?: InputMaybe<UpdateProjectPublicationInput>;
};

export type UpdateProjectPublicationInput = {
  assetPublic?: InputMaybe<Scalars['Boolean']>;
  scope?: InputMaybe<ProjectPublicationScope>;
};

export type UpdateUserOfWorkspaceInput = {
  role: Role;
  userId: Scalars['ID'];
  workspaceId: Scalars['ID'];
};

export type UpdateWebhookInput = {
  active?: InputMaybe<Scalars['Boolean']>;
  integrationId: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  trigger?: InputMaybe<WebhookTriggerInput>;
  url?: InputMaybe<Scalars['URL']>;
  webhookId: Scalars['ID'];
};

export type UpdateWorkspaceInput = {
  name: Scalars['String'];
  workspaceId: Scalars['ID'];
};

export type UpdateWorkspacePayload = {
  __typename?: 'UpdateWorkspacePayload';
  workspace: Workspace;
};

export type User = Node & {
  __typename?: 'User';
  email: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type VersionedItem = {
  __typename?: 'VersionedItem';
  parents?: Maybe<Array<Scalars['String']>>;
  refs: Array<Scalars['String']>;
  value: Item;
  version: Scalars['String'];
};

export type Webhook = Node & {
  __typename?: 'Webhook';
  active: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  name: Scalars['String'];
  trigger: WebhookTrigger;
  updatedAt: Scalars['DateTime'];
  url: Scalars['URL'];
};

export type WebhookPayload = {
  __typename?: 'WebhookPayload';
  webhook: Webhook;
};

export type WebhookTrigger = {
  __typename?: 'WebhookTrigger';
  onAssetDeleted?: Maybe<Scalars['Boolean']>;
  onAssetUpload?: Maybe<Scalars['Boolean']>;
  onItemCreate?: Maybe<Scalars['Boolean']>;
  onItemDelete?: Maybe<Scalars['Boolean']>;
  onItemPublish?: Maybe<Scalars['Boolean']>;
  onItemUnPublish?: Maybe<Scalars['Boolean']>;
  onItemUpdate?: Maybe<Scalars['Boolean']>;
};

export type WebhookTriggerInput = {
  onAssetDeleted?: InputMaybe<Scalars['Boolean']>;
  onAssetUpload?: InputMaybe<Scalars['Boolean']>;
  onItemCreate?: InputMaybe<Scalars['Boolean']>;
  onItemDelete?: InputMaybe<Scalars['Boolean']>;
  onItemPublish?: InputMaybe<Scalars['Boolean']>;
  onItemUnPublish?: InputMaybe<Scalars['Boolean']>;
  onItemUpdate?: InputMaybe<Scalars['Boolean']>;
};

export type Workspace = Node & {
  __typename?: 'Workspace';
  id: Scalars['ID'];
  members: Array<WorkspaceMember>;
  name: Scalars['String'];
  personal: Scalars['Boolean'];
};

export type WorkspaceIntegrationMember = {
  __typename?: 'WorkspaceIntegrationMember';
  active: Scalars['Boolean'];
  integration?: Maybe<Integration>;
  integrationId: Scalars['ID'];
  invitedBy?: Maybe<User>;
  invitedById: Scalars['ID'];
  role: Role;
};

export type WorkspaceMember = WorkspaceIntegrationMember | WorkspaceUserMember;

export type WorkspaceUserMember = {
  __typename?: 'WorkspaceUserMember';
  role: Role;
  user?: Maybe<User>;
  userId: Scalars['ID'];
};

export type IntegrationFragmentFragment = { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDeleted?: boolean | null } }> } | null };

export type WorkspaceFragmentFragment = { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', active: boolean, invitedById: string, integrationRole: Role, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDeleted?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> };

export type GetAssetsQueryVariables = Exact<{
  projectId: Scalars['ID'];
  keyword?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<AssetSortType>;
  pagination?: InputMaybe<Pagination>;
}>;


export type GetAssetsQuery = { __typename?: 'Query', assets: { __typename?: 'AssetConnection', totalCount: number, edges: Array<{ __typename?: 'AssetEdge', cursor: string, node?: { __typename?: 'Asset', id: string, projectId: string, createdAt: Date, fileName: string, size: number, previewType?: PreviewType | null, uuid: string, url: string, createdBy?: { __typename?: 'User', id: string, name: string, email: string } | null, file: { __typename?: 'AssetFile', name: string, size: number, contentType?: string | null, path: string } } | null }>, nodes: Array<{ __typename?: 'Asset', id: string, projectId: string, createdAt: Date, fileName: string, size: number, previewType?: PreviewType | null, uuid: string, url: string, createdBy?: { __typename?: 'User', id: string, name: string, email: string } | null, file: { __typename?: 'AssetFile', name: string, size: number, contentType?: string | null, path: string } } | null>, pageInfo: { __typename?: 'PageInfo', startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetAssetQueryVariables = Exact<{
  assetId: Scalars['ID'];
}>;


export type GetAssetQuery = { __typename?: 'Query', asset: { __typename?: 'Asset', id: string, projectId: string, createdAt: Date, fileName: string, size: number, previewType?: PreviewType | null, uuid: string, url: string, createdBy?: { __typename?: 'User', id: string, name: string, email: string } | null, file: { __typename?: 'AssetFile', name: string, size: number, contentType?: string | null, path: string } } };

export type CreateAssetMutationVariables = Exact<{
  projectId: Scalars['ID'];
  createdById: Scalars['ID'];
  file: Scalars['Upload'];
}>;


export type CreateAssetMutation = { __typename?: 'Mutation', createAsset?: { __typename?: 'CreateAssetPayload', asset: { __typename?: 'Asset', id: string, projectId: string, createdAt: Date, createdById: string, fileName: string, size: number, previewType?: PreviewType | null, uuid: string, url: string, file: { __typename?: 'AssetFile', name: string, size: number, contentType?: string | null, path: string } } } | null };

export type UpdateAssetMutationVariables = Exact<{
  id: Scalars['ID'];
  previewType?: InputMaybe<PreviewType>;
}>;


export type UpdateAssetMutation = { __typename?: 'Mutation', updateAsset?: { __typename?: 'UpdateAssetPayload', asset: { __typename?: 'Asset', id: string, projectId: string, createdAt: Date, createdById: string, fileName: string, size: number, previewType?: PreviewType | null, uuid: string, url: string, file: { __typename?: 'AssetFile', name: string, size: number, contentType?: string | null, path: string } } } | null };

export type DeleteAssetMutationVariables = Exact<{
  assetId: Scalars['ID'];
}>;


export type DeleteAssetMutation = { __typename?: 'Mutation', deleteAsset?: { __typename?: 'DeleteAssetPayload', assetId: string } | null };

export type CreateFieldMutationVariables = Exact<{
  modelId: Scalars['ID'];
  type: SchemaFiledType;
  title: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  key: Scalars['String'];
  multiValue: Scalars['Boolean'];
  unique: Scalars['Boolean'];
  required: Scalars['Boolean'];
  typeProperty: SchemaFieldTypePropertyInput;
}>;


export type CreateFieldMutation = { __typename?: 'Mutation', createField?: { __typename?: 'FieldPayload', field: { __typename?: 'SchemaField', id: string } } | null };

export type UpdateFieldMutationVariables = Exact<{
  modelId: Scalars['ID'];
  fieldId: Scalars['ID'];
  title: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  key: Scalars['String'];
  typeProperty: SchemaFieldTypePropertyInput;
}>;


export type UpdateFieldMutation = { __typename?: 'Mutation', updateField?: { __typename?: 'FieldPayload', field: { __typename?: 'SchemaField', id: string } } | null };

export type DeleteFieldMutationVariables = Exact<{
  modelId: Scalars['ID'];
  fieldId: Scalars['ID'];
}>;


export type DeleteFieldMutation = { __typename?: 'Mutation', deleteField?: { __typename?: 'DeleteFieldPayload', fieldId: string } | null };

export type CreateIntegrationMutationVariables = Exact<{
  name: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  logoUrl: Scalars['URL'];
  type: IntegrationType;
}>;


export type CreateIntegrationMutation = { __typename?: 'Mutation', createIntegration?: { __typename?: 'IntegrationPayload', integration: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType } } | null };

export type UpdateIntegrationMutationVariables = Exact<{
  integrationId: Scalars['ID'];
  name: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  logoUrl: Scalars['URL'];
}>;


export type UpdateIntegrationMutation = { __typename?: 'Mutation', updateIntegration?: { __typename?: 'IntegrationPayload', integration: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType } } | null };

export type GetItemsQueryVariables = Exact<{
  schemaId: Scalars['ID'];
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
}>;


export type GetItemsQuery = { __typename?: 'Query', items: { __typename?: 'ItemConnection', nodes: Array<{ __typename?: 'Item', id: string, schemaId: string, fields?: Array<{ __typename?: 'ItemField', schemaFieldId: string, type: SchemaFiledType, value: any }> | null } | null> } };

export type CreateItemMutationVariables = Exact<{
  schemaId: Scalars['ID'];
  fields: Array<ItemFieldInput> | ItemFieldInput;
}>;


export type CreateItemMutation = { __typename?: 'Mutation', createItem?: { __typename?: 'ItemPayload', item: { __typename?: 'Item', id: string, schemaId: string, fields?: Array<{ __typename?: 'ItemField', value: any, type: SchemaFiledType, schemaFieldId: string }> | null } } | null };

export type DeleteItemMutationVariables = Exact<{
  itemId: Scalars['ID'];
}>;


export type DeleteItemMutation = { __typename?: 'Mutation', deleteItem?: { __typename?: 'DeleteItemPayload', itemId: string } | null };

export type UpdateItemMutationVariables = Exact<{
  itemId: Scalars['ID'];
  fields: Array<ItemFieldInput> | ItemFieldInput;
}>;


export type UpdateItemMutation = { __typename?: 'Mutation', updateItem?: { __typename?: 'ItemPayload', item: { __typename?: 'Item', id: string, schemaId: string, fields?: Array<{ __typename?: 'ItemField', value: any, type: SchemaFiledType, schemaFieldId: string }> | null } } | null };

export type GetModelsQueryVariables = Exact<{
  projectId: Scalars['ID'];
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
}>;


export type GetModelsQuery = { __typename?: 'Query', models: { __typename?: 'ModelConnection', nodes: Array<{ __typename?: 'Model', id: string, name: string, description: string, key: string, public: boolean, schema: { __typename?: 'Schema', id: string, fields: Array<{ __typename?: 'SchemaField', id: string, type: SchemaFiledType, title: string, key: string, description?: string | null, required: boolean, unique: boolean, typeProperty?: { __typename?: 'SchemaFieldAsset', assetDefaultValue?: string | null } | { __typename?: 'SchemaFieldBool' } | { __typename?: 'SchemaFieldDate' } | { __typename?: 'SchemaFieldInteger', min?: number | null, max?: number | null, integerDefaultValue?: number | null } | { __typename?: 'SchemaFieldMarkdown', defaultValue?: string | null, maxLength?: number | null } | { __typename?: 'SchemaFieldReference' } | { __typename?: 'SchemaFieldRichText' } | { __typename?: 'SchemaFieldSelect', values: Array<string>, selectDefaultValue?: string | null } | { __typename?: 'SchemaFieldTag' } | { __typename?: 'SchemaFieldText', defaultValue?: string | null, maxLength?: number | null } | { __typename?: 'SchemaFieldTextArea', defaultValue?: string | null, maxLength?: number | null } | { __typename?: 'SchemaFieldURL', defaultValue?: string | null } | null }> } } | null> } };

export type CreateModelMutationVariables = Exact<{
  projectId: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  key?: InputMaybe<Scalars['String']>;
}>;


export type CreateModelMutation = { __typename?: 'Mutation', createModel?: { __typename?: 'ModelPayload', model: { __typename?: 'Model', id: string, name: string } } | null };

export type DeleteModelMutationVariables = Exact<{
  modelId: Scalars['ID'];
}>;


export type DeleteModelMutation = { __typename?: 'Mutation', deleteModel?: { __typename?: 'DeleteModelPayload', modelId: string } | null };

export type UpdateModelMutationVariables = Exact<{
  modelId: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  key?: InputMaybe<Scalars['String']>;
  public: Scalars['Boolean'];
}>;


export type UpdateModelMutation = { __typename?: 'Mutation', updateModel?: { __typename?: 'ModelPayload', model: { __typename?: 'Model', id: string, name: string } } | null };

export type CheckModelKeyAvailabilityQueryVariables = Exact<{
  projectId: Scalars['ID'];
  key: Scalars['String'];
}>;


export type CheckModelKeyAvailabilityQuery = { __typename?: 'Query', checkModelKeyAvailability: { __typename?: 'KeyAvailability', key: string, available: boolean } };

export type GetProjectQueryVariables = Exact<{
  projectId: Scalars['ID'];
}>;


export type GetProjectQuery = { __typename?: 'Query', node?: { __typename?: 'Asset', id: string } | { __typename?: 'Integration', id: string } | { __typename?: 'Item', id: string } | { __typename?: 'Model', id: string } | { __typename?: 'Project', name: string, description: string, alias: string, id: string, publication?: { __typename?: 'ProjectPublication', scope: ProjectPublicationScope, assetPublic: boolean } | null } | { __typename?: 'Schema', id: string } | { __typename?: 'User', id: string } | { __typename?: 'Webhook', id: string } | { __typename?: 'Workspace', id: string } | null };

export type GetProjectsQueryVariables = Exact<{
  workspaceId: Scalars['ID'];
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
}>;


export type GetProjectsQuery = { __typename?: 'Query', projects: { __typename?: 'ProjectConnection', nodes: Array<{ __typename?: 'Project', id: string, name: string, description: string, alias: string, publication?: { __typename?: 'ProjectPublication', scope: ProjectPublicationScope, assetPublic: boolean } | null } | null> } };

export type CheckProjectAliasQueryVariables = Exact<{
  alias: Scalars['String'];
}>;


export type CheckProjectAliasQuery = { __typename?: 'Query', checkProjectAlias: { __typename?: 'ProjectAliasAvailability', alias: string, available: boolean } };

export type CreateProjectMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  name: Scalars['String'];
  description: Scalars['String'];
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', createProject?: { __typename?: 'ProjectPayload', project: { __typename?: 'Project', id: string, name: string, description: string, publication?: { __typename?: 'ProjectPublication', scope: ProjectPublicationScope, assetPublic: boolean } | null } } | null };

export type DeleteProjectMutationVariables = Exact<{
  projectId: Scalars['ID'];
}>;


export type DeleteProjectMutation = { __typename?: 'Mutation', deleteProject?: { __typename?: 'DeleteProjectPayload', projectId: string } | null };

export type UpdateProjectMutationVariables = Exact<{
  projectId: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  publication?: InputMaybe<UpdateProjectPublicationInput>;
}>;


export type UpdateProjectMutation = { __typename?: 'Mutation', updateProject?: { __typename?: 'ProjectPayload', project: { __typename?: 'Project', id: string, name: string, description: string, alias: string, publication?: { __typename?: 'ProjectPublication', scope: ProjectPublicationScope, assetPublic: boolean } | null } } | null };

export type GetUserBySearchQueryVariables = Exact<{
  nameOrEmail: Scalars['String'];
}>;


export type GetUserBySearchQuery = { __typename?: 'Query', searchUser?: { __typename?: 'User', id: string, name: string, email: string } | null };

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, name: string, email: string, auths: Array<string>, myWorkspace: { __typename?: 'Workspace', id: string, name: string }, workspaces: Array<{ __typename?: 'Workspace', id: string, name: string, members: Array<{ __typename?: 'WorkspaceIntegrationMember', active: boolean, invitedById: string, integrationRole: Role, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDeleted?: boolean | null } }> } | null } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> }>, integrations: Array<{ __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDeleted?: boolean | null } }> } | null }> } | null };

export type GetProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProfileQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, name: string, email: string, lang: string, theme: Theme, auths: Array<string>, myWorkspace: { __typename?: 'Workspace', id: string, name: string } } | null };

export type GetLanguageQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLanguageQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, lang: string } | null };

export type GetThemeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetThemeQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, theme: Theme } | null };

export type UpdateMeMutationVariables = Exact<{
  name?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  lang?: InputMaybe<Scalars['Lang']>;
  theme?: InputMaybe<Theme>;
  password?: InputMaybe<Scalars['String']>;
  passwordConfirmation?: InputMaybe<Scalars['String']>;
}>;


export type UpdateMeMutation = { __typename?: 'Mutation', updateMe?: { __typename?: 'UpdateMePayload', me: { __typename?: 'Me', id: string, name: string, email: string, lang: string, theme: Theme, myWorkspace: { __typename?: 'Workspace', id: string, name: string } } } | null };

export type DeleteMeMutationVariables = Exact<{
  userId: Scalars['ID'];
}>;


export type DeleteMeMutation = { __typename?: 'Mutation', deleteMe?: { __typename?: 'DeleteMePayload', userId: string } | null };

export type CreateWebhookMutationVariables = Exact<{
  integrationId: Scalars['ID'];
  name: Scalars['String'];
  url: Scalars['URL'];
  active: Scalars['Boolean'];
  trigger: WebhookTriggerInput;
}>;


export type CreateWebhookMutation = { __typename?: 'Mutation', createWebhook?: { __typename?: 'WebhookPayload', webhook: { __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDeleted?: boolean | null } } } | null };

export type UpdateWebhookMutationVariables = Exact<{
  integrationId: Scalars['ID'];
  webhookId: Scalars['ID'];
  name: Scalars['String'];
  url: Scalars['URL'];
  active: Scalars['Boolean'];
  trigger: WebhookTriggerInput;
}>;


export type UpdateWebhookMutation = { __typename?: 'Mutation', updateWebhook?: { __typename?: 'WebhookPayload', webhook: { __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDeleted?: boolean | null } } } | null };

export type DeleteWebhookMutationVariables = Exact<{
  integrationId: Scalars['ID'];
  webhookId: Scalars['ID'];
}>;


export type DeleteWebhookMutation = { __typename?: 'Mutation', deleteWebhook?: { __typename?: 'DeleteWebhookPayload', webhookId: string } | null };

export type GetWorkspacesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkspacesQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, name: string, myWorkspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', active: boolean, invitedById: string, integrationRole: Role, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDeleted?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> }, workspaces: Array<{ __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', active: boolean, invitedById: string, integrationRole: Role, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDeleted?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> }> } | null };

export type UpdateWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  name: Scalars['String'];
}>;


export type UpdateWorkspaceMutation = { __typename?: 'Mutation', updateWorkspace?: { __typename?: 'UpdateWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', active: boolean, invitedById: string, integrationRole: Role, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDeleted?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type DeleteWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
}>;


export type DeleteWorkspaceMutation = { __typename?: 'Mutation', deleteWorkspace?: { __typename?: 'DeleteWorkspacePayload', workspaceId: string } | null };

export type AddUserToWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  userId: Scalars['ID'];
  role: Role;
}>;


export type AddUserToWorkspaceMutation = { __typename?: 'Mutation', addUserToWorkspace?: { __typename?: 'AddMemberToWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', active: boolean, invitedById: string, integrationRole: Role, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDeleted?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type UpdateMemberOfWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  userId: Scalars['ID'];
  role: Role;
}>;


export type UpdateMemberOfWorkspaceMutation = { __typename?: 'Mutation', updateUserOfWorkspace?: { __typename?: 'UpdateMemberOfWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', active: boolean, invitedById: string, integrationRole: Role, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDeleted?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type RemoveMemberFromWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  userId: Scalars['ID'];
}>;


export type RemoveMemberFromWorkspaceMutation = { __typename?: 'Mutation', removeUserFromWorkspace?: { __typename?: 'RemoveMemberFromWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', active: boolean, invitedById: string, integrationRole: Role, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDeleted?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type AddIntegrationToWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  integrationId: Scalars['ID'];
  role: Role;
}>;


export type AddIntegrationToWorkspaceMutation = { __typename?: 'Mutation', addIntegrationToWorkspace?: { __typename?: 'AddMemberToWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', active: boolean, invitedById: string, integrationRole: Role, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDeleted?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type UpdateIntegrationOfWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  integrationId: Scalars['ID'];
  role: Role;
}>;


export type UpdateIntegrationOfWorkspaceMutation = { __typename?: 'Mutation', updateIntegrationOfWorkspace?: { __typename?: 'UpdateMemberOfWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', active: boolean, invitedById: string, integrationRole: Role, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDeleted?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type RemoveIntegrationFromWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  integrationId: Scalars['ID'];
}>;


export type RemoveIntegrationFromWorkspaceMutation = { __typename?: 'Mutation', removeIntegrationFromWorkspace?: { __typename?: 'RemoveMemberFromWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', active: boolean, invitedById: string, integrationRole: Role, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDeleted?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type CreateWorkspaceMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type CreateWorkspaceMutation = { __typename?: 'Mutation', createWorkspace?: { __typename?: 'CreateWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceIntegrationMember', active: boolean, invitedById: string, integrationRole: Role, integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, logoUrl: string, iType: IntegrationType, developerId: string, createdAt: Date, updatedAt: Date, developer: { __typename?: 'User', id: string, name: string, email: string }, config?: { __typename?: 'IntegrationConfig', token: string, webhooks: Array<{ __typename?: 'Webhook', id: string, name: string, url: string, active: boolean, createdAt: Date, updatedAt: Date, trigger: { __typename?: 'WebhookTrigger', onItemCreate?: boolean | null, onItemUpdate?: boolean | null, onItemDelete?: boolean | null, onItemPublish?: boolean | null, onItemUnPublish?: boolean | null, onAssetUpload?: boolean | null, onAssetDeleted?: boolean | null } }> } | null } | null, invitedBy?: { __typename?: 'User', id: string, name: string, email: string } | null } | { __typename?: 'WorkspaceUserMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

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
      trigger {
        onItemCreate
        onItemUpdate
        onItemDelete
        onItemPublish
        onItemUnPublish
        onAssetUpload
        onAssetDeleted
      }
      createdAt
      updatedAt
    }
  }
  createdAt
  updatedAt
}
    `;
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
      integration {
        ...integrationFragment
      }
      integrationRole: role
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
    query GetAssets($projectId: ID!, $keyword: String, $sort: AssetSortType, $pagination: Pagination) {
  assets(
    projectId: $projectId
    keyword: $keyword
    sort: $sort
    pagination: $pagination
  ) {
    edges {
      cursor
      node {
        id
        projectId
        createdAt
        createdBy {
          id
          name
          email
        }
        fileName
        size
        previewType
        file {
          name
          size
          contentType
          path
        }
        uuid
        url
      }
    }
    nodes {
      id
      projectId
      createdAt
      createdBy {
        id
        name
        email
      }
      fileName
      size
      previewType
      file {
        name
        size
        contentType
        path
      }
      uuid
      url
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
    `;

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
export function useGetAssetsQuery(baseOptions: Apollo.QueryHookOptions<GetAssetsQuery, GetAssetsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAssetsQuery, GetAssetsQueryVariables>(GetAssetsDocument, options);
      }
export function useGetAssetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAssetsQuery, GetAssetsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAssetsQuery, GetAssetsQueryVariables>(GetAssetsDocument, options);
        }
export type GetAssetsQueryHookResult = ReturnType<typeof useGetAssetsQuery>;
export type GetAssetsLazyQueryHookResult = ReturnType<typeof useGetAssetsLazyQuery>;
export type GetAssetsQueryResult = Apollo.QueryResult<GetAssetsQuery, GetAssetsQueryVariables>;
export const GetAssetDocument = gql`
    query GetAsset($assetId: ID!) {
  asset(assetId: $assetId) {
    id
    projectId
    createdAt
    createdBy {
      id
      name
      email
    }
    fileName
    size
    previewType
    file {
      name
      size
      contentType
      path
    }
    uuid
    url
  }
}
    `;

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
export function useGetAssetQuery(baseOptions: Apollo.QueryHookOptions<GetAssetQuery, GetAssetQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAssetQuery, GetAssetQueryVariables>(GetAssetDocument, options);
      }
export function useGetAssetLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAssetQuery, GetAssetQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAssetQuery, GetAssetQueryVariables>(GetAssetDocument, options);
        }
export type GetAssetQueryHookResult = ReturnType<typeof useGetAssetQuery>;
export type GetAssetLazyQueryHookResult = ReturnType<typeof useGetAssetLazyQuery>;
export type GetAssetQueryResult = Apollo.QueryResult<GetAssetQuery, GetAssetQueryVariables>;
export const CreateAssetDocument = gql`
    mutation CreateAsset($projectId: ID!, $createdById: ID!, $file: Upload!) {
  createAsset(
    input: {projectId: $projectId, createdById: $createdById, file: $file}
  ) {
    asset {
      id
      projectId
      createdAt
      createdById
      fileName
      size
      previewType
      file {
        name
        size
        contentType
        path
      }
      uuid
      url
    }
  }
}
    `;
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
 *      createdById: // value for 'createdById'
 *      file: // value for 'file'
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
      id
      projectId
      createdAt
      createdById
      fileName
      size
      previewType
      file {
        name
        size
        contentType
        path
      }
      uuid
      url
    }
  }
}
    `;
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
export const CreateFieldDocument = gql`
    mutation CreateField($modelId: ID!, $type: SchemaFiledType!, $title: String!, $description: String, $key: String!, $multiValue: Boolean!, $unique: Boolean!, $required: Boolean!, $typeProperty: SchemaFieldTypePropertyInput!) {
  createField(
    input: {modelId: $modelId, type: $type, title: $title, description: $description, key: $key, multiValue: $multiValue, unique: $unique, required: $required, typeProperty: $typeProperty}
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
 *      type: // value for 'type'
 *      title: // value for 'title'
 *      description: // value for 'description'
 *      key: // value for 'key'
 *      multiValue: // value for 'multiValue'
 *      unique: // value for 'unique'
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
    mutation UpdateField($modelId: ID!, $fieldId: ID!, $title: String!, $description: String, $key: String!, $typeProperty: SchemaFieldTypePropertyInput!) {
  updateField(
    input: {modelId: $modelId, fieldId: $fieldId, title: $title, description: $description, key: $key, typeProperty: $typeProperty}
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
 *      fieldId: // value for 'fieldId'
 *      title: // value for 'title'
 *      description: // value for 'description'
 *      key: // value for 'key'
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
export const DeleteFieldDocument = gql`
    mutation DeleteField($modelId: ID!, $fieldId: ID!) {
  deleteField(input: {modelId: $modelId, fieldId: $fieldId}) {
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
 *      fieldId: // value for 'fieldId'
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
export const GetItemsDocument = gql`
    query GetItems($schemaId: ID!, $first: Int, $last: Int, $after: Cursor, $before: Cursor) {
  items(
    schemaId: $schemaId
    first: $first
    last: $last
    after: $after
    before: $before
  ) {
    nodes {
      id
      schemaId
      fields {
        schemaFieldId
        type
        value
      }
    }
  }
}
    `;

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
 *      schemaId: // value for 'schemaId'
 *      first: // value for 'first'
 *      last: // value for 'last'
 *      after: // value for 'after'
 *      before: // value for 'before'
 *   },
 * });
 */
export function useGetItemsQuery(baseOptions: Apollo.QueryHookOptions<GetItemsQuery, GetItemsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetItemsQuery, GetItemsQueryVariables>(GetItemsDocument, options);
      }
export function useGetItemsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetItemsQuery, GetItemsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetItemsQuery, GetItemsQueryVariables>(GetItemsDocument, options);
        }
export type GetItemsQueryHookResult = ReturnType<typeof useGetItemsQuery>;
export type GetItemsLazyQueryHookResult = ReturnType<typeof useGetItemsLazyQuery>;
export type GetItemsQueryResult = Apollo.QueryResult<GetItemsQuery, GetItemsQueryVariables>;
export const CreateItemDocument = gql`
    mutation CreateItem($schemaId: ID!, $fields: [ItemFieldInput!]!) {
  createItem(input: {schemaId: $schemaId, fields: $fields}) {
    item {
      id
      schemaId
      fields {
        value
        type
        schemaFieldId
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
 *      schemaId: // value for 'schemaId'
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
    mutation UpdateItem($itemId: ID!, $fields: [ItemFieldInput!]!) {
  updateItem(input: {itemId: $itemId, fields: $fields}) {
    item {
      id
      schemaId
      fields {
        value
        type
        schemaFieldId
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
export const GetModelsDocument = gql`
    query GetModels($projectId: ID!, $first: Int, $last: Int, $after: Cursor, $before: Cursor) {
  models(
    projectId: $projectId
    first: $first
    last: $last
    after: $after
    before: $before
  ) {
    nodes {
      id
      name
      description
      key
      public
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
            ... on SchemaFieldURL {
              defaultValue
            }
          }
        }
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
 *      first: // value for 'first'
 *      last: // value for 'last'
 *      after: // value for 'after'
 *      before: // value for 'before'
 *   },
 * });
 */
export function useGetModelsQuery(baseOptions: Apollo.QueryHookOptions<GetModelsQuery, GetModelsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetModelsQuery, GetModelsQueryVariables>(GetModelsDocument, options);
      }
export function useGetModelsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetModelsQuery, GetModelsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetModelsQuery, GetModelsQueryVariables>(GetModelsDocument, options);
        }
export type GetModelsQueryHookResult = ReturnType<typeof useGetModelsQuery>;
export type GetModelsLazyQueryHookResult = ReturnType<typeof useGetModelsLazyQuery>;
export type GetModelsQueryResult = Apollo.QueryResult<GetModelsQuery, GetModelsQueryVariables>;
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
export function useCheckModelKeyAvailabilityQuery(baseOptions: Apollo.QueryHookOptions<CheckModelKeyAvailabilityQuery, CheckModelKeyAvailabilityQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckModelKeyAvailabilityQuery, CheckModelKeyAvailabilityQueryVariables>(CheckModelKeyAvailabilityDocument, options);
      }
export function useCheckModelKeyAvailabilityLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckModelKeyAvailabilityQuery, CheckModelKeyAvailabilityQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckModelKeyAvailabilityQuery, CheckModelKeyAvailabilityQueryVariables>(CheckModelKeyAvailabilityDocument, options);
        }
export type CheckModelKeyAvailabilityQueryHookResult = ReturnType<typeof useCheckModelKeyAvailabilityQuery>;
export type CheckModelKeyAvailabilityLazyQueryHookResult = ReturnType<typeof useCheckModelKeyAvailabilityLazyQuery>;
export type CheckModelKeyAvailabilityQueryResult = Apollo.QueryResult<CheckModelKeyAvailabilityQuery, CheckModelKeyAvailabilityQueryVariables>;
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
      }
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
export function useGetProjectQuery(baseOptions: Apollo.QueryHookOptions<GetProjectQuery, GetProjectQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProjectQuery, GetProjectQueryVariables>(GetProjectDocument, options);
      }
export function useGetProjectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProjectQuery, GetProjectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProjectQuery, GetProjectQueryVariables>(GetProjectDocument, options);
        }
export type GetProjectQueryHookResult = ReturnType<typeof useGetProjectQuery>;
export type GetProjectLazyQueryHookResult = ReturnType<typeof useGetProjectLazyQuery>;
export type GetProjectQueryResult = Apollo.QueryResult<GetProjectQuery, GetProjectQueryVariables>;
export const GetProjectsDocument = gql`
    query GetProjects($workspaceId: ID!, $first: Int, $last: Int, $after: Cursor, $before: Cursor) {
  projects(
    workspaceId: $workspaceId
    first: $first
    last: $last
    after: $after
    before: $before
  ) {
    nodes {
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
 *      first: // value for 'first'
 *      last: // value for 'last'
 *      after: // value for 'after'
 *      before: // value for 'before'
 *   },
 * });
 */
export function useGetProjectsQuery(baseOptions: Apollo.QueryHookOptions<GetProjectsQuery, GetProjectsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProjectsQuery, GetProjectsQueryVariables>(GetProjectsDocument, options);
      }
export function useGetProjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProjectsQuery, GetProjectsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProjectsQuery, GetProjectsQueryVariables>(GetProjectsDocument, options);
        }
export type GetProjectsQueryHookResult = ReturnType<typeof useGetProjectsQuery>;
export type GetProjectsLazyQueryHookResult = ReturnType<typeof useGetProjectsLazyQuery>;
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
export function useCheckProjectAliasQuery(baseOptions: Apollo.QueryHookOptions<CheckProjectAliasQuery, CheckProjectAliasQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckProjectAliasQuery, CheckProjectAliasQueryVariables>(CheckProjectAliasDocument, options);
      }
export function useCheckProjectAliasLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckProjectAliasQuery, CheckProjectAliasQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckProjectAliasQuery, CheckProjectAliasQueryVariables>(CheckProjectAliasDocument, options);
        }
export type CheckProjectAliasQueryHookResult = ReturnType<typeof useCheckProjectAliasQuery>;
export type CheckProjectAliasLazyQueryHookResult = ReturnType<typeof useCheckProjectAliasLazyQuery>;
export type CheckProjectAliasQueryResult = Apollo.QueryResult<CheckProjectAliasQuery, CheckProjectAliasQueryVariables>;
export const CreateProjectDocument = gql`
    mutation CreateProject($workspaceId: ID!, $name: String!, $description: String!) {
  createProject(
    input: {workspaceId: $workspaceId, name: $name, description: $description}
  ) {
    project {
      id
      name
      description
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
    mutation UpdateProject($projectId: ID!, $name: String, $description: String, $publication: UpdateProjectPublicationInput) {
  updateProject(
    input: {projectId: $projectId, name: $name, description: $description, publication: $publication}
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
 *      publication: // value for 'publication'
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
export const GetUserBySearchDocument = gql`
    query GetUserBySearch($nameOrEmail: String!) {
  searchUser(nameOrEmail: $nameOrEmail) {
    id
    name
    email
  }
}
    `;

/**
 * __useGetUserBySearchQuery__
 *
 * To run a query within a React component, call `useGetUserBySearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserBySearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserBySearchQuery({
 *   variables: {
 *      nameOrEmail: // value for 'nameOrEmail'
 *   },
 * });
 */
export function useGetUserBySearchQuery(baseOptions: Apollo.QueryHookOptions<GetUserBySearchQuery, GetUserBySearchQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserBySearchQuery, GetUserBySearchQueryVariables>(GetUserBySearchDocument, options);
      }
export function useGetUserBySearchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserBySearchQuery, GetUserBySearchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserBySearchQuery, GetUserBySearchQueryVariables>(GetUserBySearchDocument, options);
        }
export type GetUserBySearchQueryHookResult = ReturnType<typeof useGetUserBySearchQuery>;
export type GetUserBySearchLazyQueryHookResult = ReturnType<typeof useGetUserBySearchLazyQuery>;
export type GetUserBySearchQueryResult = Apollo.QueryResult<GetUserBySearchQuery, GetUserBySearchQueryVariables>;
export const GetMeDocument = gql`
    query GetMe {
  me {
    id
    name
    email
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
          integration {
            ...integrationFragment
          }
          integrationRole: role
          active
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
export type GetMeQueryHookResult = ReturnType<typeof useGetMeQuery>;
export type GetMeLazyQueryHookResult = ReturnType<typeof useGetMeLazyQuery>;
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
export type GetProfileQueryHookResult = ReturnType<typeof useGetProfileQuery>;
export type GetProfileLazyQueryHookResult = ReturnType<typeof useGetProfileLazyQuery>;
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
export type GetLanguageQueryHookResult = ReturnType<typeof useGetLanguageQuery>;
export type GetLanguageLazyQueryHookResult = ReturnType<typeof useGetLanguageLazyQuery>;
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
export type GetThemeQueryHookResult = ReturnType<typeof useGetThemeQuery>;
export type GetThemeLazyQueryHookResult = ReturnType<typeof useGetThemeLazyQuery>;
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
export const CreateWebhookDocument = gql`
    mutation CreateWebhook($integrationId: ID!, $name: String!, $url: URL!, $active: Boolean!, $trigger: WebhookTriggerInput!) {
  createWebhook(
    input: {integrationId: $integrationId, name: $name, url: $url, active: $active, trigger: $trigger}
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
        onAssetDeleted
      }
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
    mutation UpdateWebhook($integrationId: ID!, $webhookId: ID!, $name: String!, $url: URL!, $active: Boolean!, $trigger: WebhookTriggerInput!) {
  updateWebhook(
    input: {integrationId: $integrationId, webhookId: $webhookId, name: $name, url: $url, active: $active, trigger: $trigger}
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
        onAssetDeleted
      }
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
export type GetWorkspacesQueryHookResult = ReturnType<typeof useGetWorkspacesQuery>;
export type GetWorkspacesLazyQueryHookResult = ReturnType<typeof useGetWorkspacesLazyQuery>;
export type GetWorkspacesQueryResult = Apollo.QueryResult<GetWorkspacesQuery, GetWorkspacesQueryVariables>;
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
export const AddUserToWorkspaceDocument = gql`
    mutation AddUserToWorkspace($workspaceId: ID!, $userId: ID!, $role: Role!) {
  addUserToWorkspace(
    input: {workspaceId: $workspaceId, userId: $userId, role: $role}
  ) {
    workspace {
      id
      ...WorkspaceFragment
    }
  }
}
    ${WorkspaceFragmentFragmentDoc}`;
export type AddUserToWorkspaceMutationFn = Apollo.MutationFunction<AddUserToWorkspaceMutation, AddUserToWorkspaceMutationVariables>;

/**
 * __useAddUserToWorkspaceMutation__
 *
 * To run a mutation, you first call `useAddUserToWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddUserToWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addUserToWorkspaceMutation, { data, loading, error }] = useAddUserToWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      userId: // value for 'userId'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useAddUserToWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<AddUserToWorkspaceMutation, AddUserToWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddUserToWorkspaceMutation, AddUserToWorkspaceMutationVariables>(AddUserToWorkspaceDocument, options);
      }
export type AddUserToWorkspaceMutationHookResult = ReturnType<typeof useAddUserToWorkspaceMutation>;
export type AddUserToWorkspaceMutationResult = Apollo.MutationResult<AddUserToWorkspaceMutation>;
export type AddUserToWorkspaceMutationOptions = Apollo.BaseMutationOptions<AddUserToWorkspaceMutation, AddUserToWorkspaceMutationVariables>;
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
export const RemoveMemberFromWorkspaceDocument = gql`
    mutation RemoveMemberFromWorkspace($workspaceId: ID!, $userId: ID!) {
  removeUserFromWorkspace(input: {workspaceId: $workspaceId, userId: $userId}) {
    workspace {
      id
      ...WorkspaceFragment
    }
  }
}
    ${WorkspaceFragmentFragmentDoc}`;
export type RemoveMemberFromWorkspaceMutationFn = Apollo.MutationFunction<RemoveMemberFromWorkspaceMutation, RemoveMemberFromWorkspaceMutationVariables>;

/**
 * __useRemoveMemberFromWorkspaceMutation__
 *
 * To run a mutation, you first call `useRemoveMemberFromWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveMemberFromWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeMemberFromWorkspaceMutation, { data, loading, error }] = useRemoveMemberFromWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useRemoveMemberFromWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<RemoveMemberFromWorkspaceMutation, RemoveMemberFromWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveMemberFromWorkspaceMutation, RemoveMemberFromWorkspaceMutationVariables>(RemoveMemberFromWorkspaceDocument, options);
      }
export type RemoveMemberFromWorkspaceMutationHookResult = ReturnType<typeof useRemoveMemberFromWorkspaceMutation>;
export type RemoveMemberFromWorkspaceMutationResult = Apollo.MutationResult<RemoveMemberFromWorkspaceMutation>;
export type RemoveMemberFromWorkspaceMutationOptions = Apollo.BaseMutationOptions<RemoveMemberFromWorkspaceMutation, RemoveMemberFromWorkspaceMutationVariables>;
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