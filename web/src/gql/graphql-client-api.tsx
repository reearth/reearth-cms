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

export type AddMemberToWorkspaceInput = {
  role: Role;
  userId: Scalars['ID'];
  workspaceId: Scalars['ID'];
};

export type AddMemberToWorkspacePayload = {
  __typename?: 'AddMemberToWorkspacePayload';
  workspace: Workspace;
};

export type Asset = Node & {
  __typename?: 'Asset';
  createdAt: Scalars['DateTime'];
  createdBy?: Maybe<User>;
  createdById: Scalars['ID'];
  file: AssetFile;
  fileName: Scalars['String'];
  hash: Scalars['String'];
  id: Scalars['ID'];
  previewType?: Maybe<PreviewType>;
  project: Project;
  projectId: Scalars['ID'];
  size: Scalars['FileSize'];
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

export type CreateAssetInput = {
  file: Scalars['Upload'];
  projectId: Scalars['ID'];
};

export type CreateAssetPayload = {
  __typename?: 'CreateAssetPayload';
  asset: Asset;
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

export type CreateItemInput = {
  fields: Array<ItemFieldInput>;
  modelId: Scalars['ID'];
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

export type DeleteFieldInput = {
  fieldId: Scalars['ID'];
};

export type DeleteFieldPayload = {
  __typename?: 'DeleteFieldPayload';
  fieldId: Scalars['ID'];
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

export type Item = Node & {
  __typename?: 'Item';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  latestVersion?: Maybe<ItemVersion>;
  model: Model;
  modelId: Scalars['ID'];
  publicVersion: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  versions: Array<ItemVersion>;
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
  fieldId: Scalars['ID'];
  value: Scalars['Any'];
};

export type ItemFieldInput = {
  fieldId: Scalars['ID'];
  value: Scalars['Any'];
};

export type ItemPayload = {
  __typename?: 'ItemPayload';
  item: Item;
};

export type ItemVersion = {
  __typename?: 'ItemVersion';
  fields: Array<ItemField>;
  parent: Array<Scalars['String']>;
  ref: Array<Scalars['String']>;
  version: Scalars['String'];
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
  addMemberToWorkspace?: Maybe<AddMemberToWorkspacePayload>;
  createAsset?: Maybe<CreateAssetPayload>;
  createField?: Maybe<FieldPayload>;
  createItem?: Maybe<ItemPayload>;
  createModel?: Maybe<ModelPayload>;
  createProject?: Maybe<ProjectPayload>;
  createWorkspace?: Maybe<CreateWorkspacePayload>;
  deleteAsset?: Maybe<DeleteAssetPayload>;
  deleteField?: Maybe<DeleteFieldPayload>;
  deleteItem?: Maybe<DeleteItemPayload>;
  deleteMe?: Maybe<DeleteMePayload>;
  deleteModel?: Maybe<DeleteModelPayload>;
  deleteProject?: Maybe<DeleteProjectPayload>;
  deleteWorkspace?: Maybe<DeleteWorkspacePayload>;
  publishModel?: Maybe<PublishModelPayload>;
  removeMemberFromWorkspace?: Maybe<RemoveMemberFromWorkspacePayload>;
  removeMyAuth?: Maybe<UpdateMePayload>;
  signup?: Maybe<SignupPayload>;
  updateField?: Maybe<FieldPayload>;
  updateItem?: Maybe<ItemPayload>;
  updateMe?: Maybe<UpdateMePayload>;
  updateMemberOfWorkspace?: Maybe<UpdateMemberOfWorkspacePayload>;
  updateModel?: Maybe<ModelPayload>;
  updateProject?: Maybe<ProjectPayload>;
  updateWorkspace?: Maybe<UpdateWorkspacePayload>;
};


export type MutationAddMemberToWorkspaceArgs = {
  input: AddMemberToWorkspaceInput;
};


export type MutationCreateAssetArgs = {
  input: CreateAssetInput;
};


export type MutationCreateFieldArgs = {
  input: CreateFieldInput;
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


export type MutationCreateWorkspaceArgs = {
  input: CreateWorkspaceInput;
};


export type MutationDeleteAssetArgs = {
  input: DeleteAssetInput;
};


export type MutationDeleteFieldArgs = {
  input: DeleteFieldInput;
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


export type MutationDeleteWorkspaceArgs = {
  input: DeleteWorkspaceInput;
};


export type MutationPublishModelArgs = {
  input: PublishModelInput;
};


export type MutationRemoveMemberFromWorkspaceArgs = {
  input: RemoveMemberFromWorkspaceInput;
};


export type MutationRemoveMyAuthArgs = {
  input: RemoveMyAuthInput;
};


export type MutationSignupArgs = {
  input: SignupInput;
};


export type MutationUpdateFieldArgs = {
  input: UpdateFieldInput;
};


export type MutationUpdateItemArgs = {
  input: UpdateItemInput;
};


export type MutationUpdateMeArgs = {
  input: UpdateMeInput;
};


export type MutationUpdateMemberOfWorkspaceArgs = {
  input: UpdateMemberOfWorkspaceInput;
};


export type MutationUpdateModelArgs = {
  input: UpdateModelInput;
};


export type MutationUpdateProjectArgs = {
  input: UpdateProjectInput;
};


export type MutationUpdateWorkspaceArgs = {
  input: UpdateWorkspaceInput;
};

export type Node = {
  id: Scalars['ID'];
};

export enum NodeType {
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
  modelId: Scalars['ID'];
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

export type RemoveMemberFromWorkspaceInput = {
  userId: Scalars['ID'];
  workspaceId: Scalars['ID'];
};

export type RemoveMemberFromWorkspacePayload = {
  __typename?: 'RemoveMemberFromWorkspacePayload';
  workspace: Workspace;
};

export type RemoveMyAuthInput = {
  auth: Scalars['String'];
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

export type SignupInput = {
  lang?: InputMaybe<Scalars['Lang']>;
  secret?: InputMaybe<Scalars['String']>;
  theme?: InputMaybe<Theme>;
  userId?: InputMaybe<Scalars['ID']>;
  workspaceId?: InputMaybe<Scalars['ID']>;
};

export type SignupPayload = {
  __typename?: 'SignupPayload';
  user: User;
  workspace: Workspace;
};

export enum Theme {
  Dark = 'DARK',
  Default = 'DEFAULT',
  Light = 'LIGHT'
}

export type UpdateFieldInput = {
  description?: InputMaybe<Scalars['String']>;
  fieldId: Scalars['ID'];
  key?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
  typeProperty?: InputMaybe<SchemaFieldTypePropertyInput>;
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

export type UpdateMemberOfWorkspaceInput = {
  role: Role;
  userId: Scalars['ID'];
  workspaceId: Scalars['ID'];
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
};

export type UpdateProjectInput = {
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  projectId: Scalars['ID'];
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

export type Workspace = Node & {
  __typename?: 'Workspace';
  id: Scalars['ID'];
  members: Array<WorkspaceMember>;
  name: Scalars['String'];
  personal: Scalars['Boolean'];
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  role: Role;
  user?: Maybe<User>;
  userId: Scalars['ID'];
};

export type WorkspaceFragmentFragment = { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> };

export type GetAssetsQueryVariables = Exact<{
  projectId: Scalars['ID'];
  keyword?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<AssetSortType>;
  pagination?: InputMaybe<Pagination>;
}>;


export type GetAssetsQuery = { __typename?: 'Query', assets: { __typename?: 'AssetConnection', totalCount: number, nodes: Array<{ __typename?: 'Asset', id: string, projectId: string, createdAt: Date, createdById: string, fileName: string, size: number, previewType?: PreviewType | null, hash: string, file: { __typename?: 'AssetFile', name: string, size: number, contentType?: string | null, path: string } } | null>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type CreateAssetMutationVariables = Exact<{
  projectId: Scalars['ID'];
  file: Scalars['Upload'];
}>;


export type CreateAssetMutation = { __typename?: 'Mutation', createAsset?: { __typename?: 'CreateAssetPayload', asset: { __typename?: 'Asset', id: string, projectId: string, createdAt: Date, createdById: string, fileName: string, size: number, previewType?: PreviewType | null, hash: string, file: { __typename?: 'AssetFile', name: string, size: number, contentType?: string | null, path: string } } } | null };

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

export type GetModelsQueryVariables = Exact<{
  projectId: Scalars['ID'];
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
}>;


export type GetModelsQuery = { __typename?: 'Query', models: { __typename?: 'ModelConnection', nodes: Array<{ __typename?: 'Model', id: string, name: string, description: string, key: string } | null> } };

export type CreateModelMutationVariables = Exact<{
  projectId: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  key?: InputMaybe<Scalars['String']>;
}>;


export type CreateModelMutation = { __typename?: 'Mutation', createModel?: { __typename?: 'ModelPayload', model: { __typename?: 'Model', id: string, name: string } } | null };

export type GetProjectsQueryVariables = Exact<{
  workspaceId: Scalars['ID'];
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
}>;


export type GetProjectsQuery = { __typename?: 'Query', projects: { __typename?: 'ProjectConnection', nodes: Array<{ __typename?: 'Project', id: string, name: string, description: string, alias: string } | null> } };

export type CheckProjectAliasQueryVariables = Exact<{
  alias: Scalars['String'];
}>;


export type CheckProjectAliasQuery = { __typename?: 'Query', checkProjectAlias: { __typename?: 'ProjectAliasAvailability', alias: string, available: boolean } };

export type CreateProjectMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  name: Scalars['String'];
  description: Scalars['String'];
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', createProject?: { __typename?: 'ProjectPayload', project: { __typename?: 'Project', id: string, name: string, description: string } } | null };

export type DeleteProjectMutationVariables = Exact<{
  projectId: Scalars['ID'];
}>;


export type DeleteProjectMutation = { __typename?: 'Mutation', deleteProject?: { __typename?: 'DeleteProjectPayload', projectId: string } | null };

export type UpdateProjectMutationVariables = Exact<{
  projectId: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
}>;


export type UpdateProjectMutation = { __typename?: 'Mutation', updateProject?: { __typename?: 'ProjectPayload', project: { __typename?: 'Project', id: string, name: string, description: string, alias: string } } | null };

export type GetUserBySearchQueryVariables = Exact<{
  nameOrEmail: Scalars['String'];
}>;


export type GetUserBySearchQuery = { __typename?: 'Query', searchUser?: { __typename?: 'User', id: string, name: string, email: string } | null };

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, name: string, email: string, auths: Array<string>, myWorkspace: { __typename?: 'Workspace', id: string, name: string }, workspaces: Array<{ __typename?: 'Workspace', id: string, name: string, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> }> } | null };

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

export type GetWorkspacesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkspacesQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, name: string, myWorkspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> }, workspaces: Array<{ __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> }> } | null };

export type UpdateWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  name: Scalars['String'];
}>;


export type UpdateWorkspaceMutation = { __typename?: 'Mutation', updateWorkspace?: { __typename?: 'UpdateWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type DeleteWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
}>;


export type DeleteWorkspaceMutation = { __typename?: 'Mutation', deleteWorkspace?: { __typename?: 'DeleteWorkspacePayload', workspaceId: string } | null };

export type AddMemberToWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  userId: Scalars['ID'];
  role: Role;
}>;


export type AddMemberToWorkspaceMutation = { __typename?: 'Mutation', addMemberToWorkspace?: { __typename?: 'AddMemberToWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type UpdateMemberOfWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  userId: Scalars['ID'];
  role: Role;
}>;


export type UpdateMemberOfWorkspaceMutation = { __typename?: 'Mutation', updateMemberOfWorkspace?: { __typename?: 'UpdateMemberOfWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type RemoveMemberFromWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  userId: Scalars['ID'];
}>;


export type RemoveMemberFromWorkspaceMutation = { __typename?: 'Mutation', removeMemberFromWorkspace?: { __typename?: 'RemoveMemberFromWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type CreateWorkspaceMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type CreateWorkspaceMutation = { __typename?: 'Mutation', createWorkspace?: { __typename?: 'CreateWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export const WorkspaceFragmentFragmentDoc = gql`
    fragment WorkspaceFragment on Workspace {
  id
  name
  members {
    user {
      id
      name
      email
    }
    userId
    role
  }
  personal
}
    `;
export const GetAssetsDocument = gql`
    query GetAssets($projectId: ID!, $keyword: String, $sort: AssetSortType, $pagination: Pagination) {
  assets(
    projectId: $projectId
    keyword: $keyword
    sort: $sort
    pagination: $pagination
  ) {
    nodes {
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
      hash
    }
    pageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
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
export const CreateAssetDocument = gql`
    mutation CreateAsset($projectId: ID!, $file: Upload!) {
  createAsset(input: {projectId: $projectId, file: $file}) {
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
      hash
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
    mutation UpdateProject($projectId: ID!, $name: String, $description: String) {
  updateProject(
    input: {projectId: $projectId, name: $name, description: $description}
  ) {
    project {
      id
      name
      description
      alias
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
        user {
          id
          name
          email
        }
        userId
        role
      }
    }
    auths
  }
}
    `;

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
export const AddMemberToWorkspaceDocument = gql`
    mutation AddMemberToWorkspace($workspaceId: ID!, $userId: ID!, $role: Role!) {
  addMemberToWorkspace(
    input: {workspaceId: $workspaceId, userId: $userId, role: $role}
  ) {
    workspace {
      id
      ...WorkspaceFragment
    }
  }
}
    ${WorkspaceFragmentFragmentDoc}`;
export type AddMemberToWorkspaceMutationFn = Apollo.MutationFunction<AddMemberToWorkspaceMutation, AddMemberToWorkspaceMutationVariables>;

/**
 * __useAddMemberToWorkspaceMutation__
 *
 * To run a mutation, you first call `useAddMemberToWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddMemberToWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addMemberToWorkspaceMutation, { data, loading, error }] = useAddMemberToWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      userId: // value for 'userId'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useAddMemberToWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<AddMemberToWorkspaceMutation, AddMemberToWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddMemberToWorkspaceMutation, AddMemberToWorkspaceMutationVariables>(AddMemberToWorkspaceDocument, options);
      }
export type AddMemberToWorkspaceMutationHookResult = ReturnType<typeof useAddMemberToWorkspaceMutation>;
export type AddMemberToWorkspaceMutationResult = Apollo.MutationResult<AddMemberToWorkspaceMutation>;
export type AddMemberToWorkspaceMutationOptions = Apollo.BaseMutationOptions<AddMemberToWorkspaceMutation, AddMemberToWorkspaceMutationVariables>;
export const UpdateMemberOfWorkspaceDocument = gql`
    mutation UpdateMemberOfWorkspace($workspaceId: ID!, $userId: ID!, $role: Role!) {
  updateMemberOfWorkspace(
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
  removeMemberFromWorkspace(input: {workspaceId: $workspaceId, userId: $userId}) {
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