import * as z from "zod";
import {
  ApiKeyPayload,
  AddCommentInput,
  AddIntegrationToWorkspaceInput,
  AddUsersToWorkspaceInput,
  AddUsersToWorkspacePayload,
  AndCondition,
  AndConditionInput,
  ApproveRequestInput,
  ArchiveExtractionStatus,
  Asset,
  AssetConnection,
  AssetEdge,
  AssetFile,
  AssetItem,
  AssetQueryInput,
  AssetSort,
  AssetSortType,
  BasicFieldCondition,
  BasicFieldConditionInput,
  BasicOperator,
  BoolFieldCondition,
  BoolFieldConditionInput,
  BoolOperator,
  CesiumResourceProps,
  CesiumResourcePropsInput,
  Column,
  ColumnSelectionInput,
  Comment,
  CommentPayload,
  ConditionInput,
  ContentTypesEnum,
  CorrespondingFieldInput,
  CreateApiKeyInput,
  CreateAssetInput,
  CreateAssetPayload,
  CreateAssetUploadInput,
  CreateAssetUploadPayload,
  CreateFieldInput,
  CreateGroupInput,
  CreateIntegrationInput,
  CreateItemInput,
  CreateModelInput,
  CreateProjectInput,
  CreateRequestInput,
  CreateThreadWithCommentInput,
  CreateViewInput,
  CreateWebhookInput,
  CreateWorkspaceInput,
  CreateWorkspacePayload,
  DecompressAssetInput,
  DecompressAssetPayload,
  DeleteApiKeyInput,
  DeleteApiKeyPayload,
  DeleteAssetInput,
  DeleteAssetPayload,
  DeleteAssetsInput,
  DeleteAssetsPayload,
  DeleteCommentInput,
  DeleteCommentPayload,
  DeleteFieldInput,
  DeleteFieldPayload,
  DeleteGroupInput,
  DeleteGroupPayload,
  DeleteIntegrationInput,
  DeleteIntegrationPayload,
  DeleteIntegrationsInput,
  DeleteIntegrationsPayload,
  DeleteItemInput,
  DeleteItemPayload,
  DeleteItemsInput,
  DeleteItemsPayload,
  DeleteMeInput,
  DeleteMePayload,
  DeleteModelInput,
  DeleteModelPayload,
  DeleteProjectInput,
  DeleteProjectPayload,
  DeleteRequestInput,
  DeleteRequestPayload,
  DeleteViewInput,
  DeleteViewPayload,
  DeleteWebhookInput,
  DeleteWebhookPayload,
  DeleteWorkspaceInput,
  DeleteWorkspacePayload,
  ExportFormat,
  ExportModelInput,
  ExportModelPayload,
  ExportModelSchemaInput,
  ExportModelSchemaPayload,
  FieldPayload,
  FieldSelector,
  FieldSelectorInput,
  FieldType,
  FieldsPayload,
  GeometryEditorSupportedType,
  GeometryObjectSupportedType,
  Group,
  GroupPayload,
  GroupsPayload,
  GuessSchemaField,
  GuessSchemaFieldResult,
  GuessSchemaFieldsInput,
  ImportItemsAsyncPayload,
  ImportItemsInput,
  ImportItemsPayload,
  Integration,
  IntegrationConfig,
  IntegrationPayload,
  IntegrationType,
  Item,
  ItemConnection,
  ItemEdge,
  ItemField,
  ItemFieldInput,
  ItemPayload,
  ItemQueryInput,
  ItemSort,
  ItemSortInput,
  ItemStatus,
  Job,
  JobProgress,
  JobState,
  JobStatus,
  JobType,
  KeyAvailability,
  Me,
  MemberInput,
  Model,
  ModelConnection,
  ModelEdge,
  ModelPayload,
  ModelsPayload,
  MultipleFieldCondition,
  MultipleFieldConditionInput,
  MultipleOperator,
  Node,
  NodeType,
  NullableFieldCondition,
  NullableFieldConditionInput,
  NullableOperator,
  NumberFieldCondition,
  NumberFieldConditionInput,
  NumberOperator,
  OperatorInput,
  OperatorType,
  OrCondition,
  OrConditionInput,
  PageInfo,
  Pagination,
  PreviewType,
  Project,
  ProjectApiKey,
  ProjectAccessibility,
  ProjectAliasAvailability,
  ProjectConnection,
  ProjectEdge,
  ProjectPayload,
  ProjectVisibility,
  PublicationSettings,
  PublishItemInput,
  PublishItemPayload,
  RegenerateApiKeyInput,
  RegenerateIntegrationTokenInput,
  RemoveIntegrationFromWorkspaceInput,
  RemoveIntegrationFromWorkspacePayload,
  RemoveIntegrationsFromWorkspaceInput,
  RemoveIntegrationsFromWorkspacePayload,
  RemoveMultipleMembersFromWorkspaceInput,
  RemoveMultipleMembersFromWorkspacePayload,
  RemoveMyAuthInput,
  Request,
  RequestConnection,
  RequestEdge,
  RequestItem,
  RequestItemInput,
  RequestPayload,
  RequestState,
  ResourceInput,
  ResourceList,
  ResourceType,
  ResourcesListInput,
  Role,
  Schema,
  SchemaField,
  SchemaFieldAsset,
  SchemaFieldAssetInput,
  SchemaFieldBool,
  SchemaFieldBoolInput,
  SchemaFieldCheckbox,
  SchemaFieldCheckboxInput,
  SchemaFieldDate,
  SchemaFieldDateInput,
  SchemaFieldGeometryEditor,
  SchemaFieldGeometryEditorInput,
  SchemaFieldGeometryObject,
  SchemaFieldGeometryObjectInput,
  SchemaFieldGroup,
  SchemaFieldGroupInput,
  SchemaFieldInteger,
  SchemaFieldIntegerInput,
  SchemaFieldLineStringInput,
  SchemaFieldMarkdown,
  SchemaFieldNumber,
  SchemaFieldNumberInput,
  SchemaFieldReference,
  SchemaFieldReferenceInput,
  SchemaFieldRichText,
  SchemaFieldRichTextInput,
  SchemaFieldSelect,
  SchemaFieldSelectInput,
  SchemaFieldTag,
  SchemaFieldTagColor,
  SchemaFieldTagInput,
  SchemaFieldTagValue,
  SchemaFieldTagValueInput,
  SchemaFieldText,
  SchemaFieldTextArea,
  SchemaFieldTextAreaInput,
  SchemaFieldTextInput,
  SchemaFieldType,
  SchemaFieldTypePropertyInput,
  SchemaFieldUrl,
  SchemaFieldUrlInput,
  SchemaMarkdownTextInput,
  SearchAssetsInput,
  SearchItemInput,
  Sort,
  SortDirection,
  StringFieldCondition,
  StringFieldConditionInput,
  StringOperator,
  TerrainResource,
  TerrainResourceInput,
  TerrainType,
  Theme,
  Thread,
  TileResource,
  TileResourceInput,
  TileType,
  TimeFieldCondition,
  TimeFieldConditionInput,
  TimeOperator,
  UnpublishItemInput,
  UnpublishItemPayload,
  UpdateApiKeyInput,
  UpdateAssetInput,
  UpdateAssetPayload,
  UpdateCommentInput,
  UpdateFieldInput,
  UpdateGroupInput,
  UpdateGroupsOrderInput,
  UpdateIntegrationInput,
  UpdateIntegrationOfWorkspaceInput,
  UpdateItemInput,
  UpdateMeInput,
  UpdateMePayload,
  UpdateMemberOfWorkspacePayload,
  UpdateModelInput,
  UpdateModelsOrderInput,
  UpdateProjectAccessibilityInput,
  UpdateProjectInput,
  UpdatePublicationSettingsInput,
  UpdateRequestInput,
  UpdateUserOfWorkspaceInput,
  UpdateViewInput,
  UpdateViewsOrderInput,
  UpdateWebhookInput,
  UpdateWorkspaceInput,
  UpdateWorkspacePayload,
  UpdateWorkspaceSettingsInput,
  UpdateWorkspaceSettingsPayload,
  UrlResourceProps,
  UrlResourcePropsInput,
  User,
  VersionedItem,
  View,
  ViewPayload,
  ViewsPayload,
  Webhook,
  WebhookPayload,
  WebhookTrigger,
  WebhookTriggerInput,
  Workspace,
  WorkspaceIntegrationMember,
  WorkspaceProjectLimits,
  WorkspaceSettings,
  WorkspaceUserMember,
  GetAssetsQuery,
  GetAssetsItemsQuery,
  GetAssetQuery,
  GetAssetFileQuery,
  GetAssetItemQuery,
  GuessSchemaFieldsQuery,
  CreateAssetMutation,
  UpdateAssetMutation,
  DeleteAssetMutation,
  DeleteAssetsMutation,
  DecompressAssetMutation,
  CreateAssetUploadMutation,
  AddCommentMutation,
  UpdateCommentMutation,
  DeleteCommentMutation,
  CreateFieldMutation,
  CreateFieldsMutation,
  UpdateFieldMutation,
  UpdateFieldsMutation,
  DeleteFieldMutation,
  GetGroupsQuery,
  GetGroupQuery,
  CreateGroupMutation,
  UpdateGroupMutation,
  DeleteGroupMutation,
  CheckGroupKeyAvailabilityQuery,
  ModelsByGroupQuery,
  UpdateGroupsOrderMutation,
  CreateIntegrationMutation,
  UpdateIntegrationMutation,
  DeleteIntegrationMutation,
  RegenerateIntegrationTokenMutation,
  GetItemsQuery,
  GetItemQuery,
  IsItemReferencedQuery,
  VersionsByItemQuery,
  SearchItemQuery,
  CreateItemMutation,
  DeleteItemMutation,
  DeleteItemsMutation,
  UpdateItemMutation,
  UnpublishItemMutation,
  PublishItemMutation,
  ImportItemsMutation,
  ImportItemsAsyncMutation,
  JobQuery,
  JobsQuery,
  JobStateSubscription,
  CancelJobMutation,
  GetModelsQuery,
  GetModelQuery,
  CreateModelMutation,
  DeleteModelMutation,
  UpdateModelMutation,
  CheckModelKeyAvailabilityQuery,
  UpdateModelsOrderMutation,
  ExportModelMutation,
  ExportModelSchemaMutation,
  GetProjectQuery,
  GetProjectsQuery,
  CheckProjectAliasQuery,
  CheckProjectLimitsQuery,
  CreateProjectMutation,
  DeleteProjectMutation,
  UpdateProjectMutation,
  CreateApiKeyMutation,
  UpdateApiKeyMutation,
  DeleteApiKeyMutation,
  RegenerateApiKeyMutation,
  GetRequestsQuery,
  GetModalRequestsQuery,
  GetRequestQuery,
  CreateRequestMutation,
  UpdateRequestMutation,
  ApproveRequestMutation,
  DeleteRequestMutation,
  CreateThreadWithCommentMutation,
  GetUserByNameOrEmailQuery,
  GetUsersQuery,
  GetMeQuery,
  GetProfileQuery,
  GetLanguageQuery,
  GetThemeQuery,
  UpdateMeMutation,
  DeleteMeMutation,
  GetViewsQuery,
  CreateViewMutation,
  UpdateViewMutation,
  DeleteViewMutation,
  UpdateViewsOrderMutation,
  CreateWebhookMutation,
  UpdateWebhookMutation,
  DeleteWebhookMutation,
  GetWorkspacesQuery,
  GetWorkspaceQuery,
  UpdateWorkspaceMutation,
  DeleteWorkspaceMutation,
  AddUsersToWorkspaceMutation,
  UpdateMemberOfWorkspaceMutation,
  RemoveMultipleMembersFromWorkspaceMutation,
  AddIntegrationToWorkspaceMutation,
  UpdateIntegrationOfWorkspaceMutation,
  RemoveIntegrationFromWorkspaceMutation,
  CreateWorkspaceMutation,
  GetWorkspaceSettingsQuery,
  UpdateWorkspaceSettingsMutation,
} from "./all-types.generated";

type Properties<T> = Required<{ [K in keyof T]: z.ZodType<T[K]> }>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny =>
  v !== undefined && v !== null;

export const definedNonNullAnySchema = z.any().refine(v => isDefinedNonNullAny(v));

export const ArchiveExtractionStatusSchema: z.ZodType<
  ArchiveExtractionStatus,
  ArchiveExtractionStatus
> = z.enum(ArchiveExtractionStatus);

export const AssetSortTypeSchema: z.ZodType<AssetSortType, AssetSortType> = z.enum(AssetSortType);

export const BasicOperatorSchema: z.ZodType<BasicOperator, BasicOperator> = z.enum(BasicOperator);

export const BoolOperatorSchema: z.ZodType<BoolOperator, BoolOperator> = z.enum(BoolOperator);

export const ContentTypesEnumSchema: z.ZodType<ContentTypesEnum, ContentTypesEnum> =
  z.enum(ContentTypesEnum);

export const ExportFormatSchema: z.ZodType<ExportFormat, ExportFormat> = z.enum(ExportFormat);

export const FieldTypeSchema: z.ZodType<FieldType, FieldType> = z.enum(FieldType);

export const GeometryEditorSupportedTypeSchema: z.ZodType<
  GeometryEditorSupportedType,
  GeometryEditorSupportedType
> = z.enum(GeometryEditorSupportedType);

export const GeometryObjectSupportedTypeSchema: z.ZodType<
  GeometryObjectSupportedType,
  GeometryObjectSupportedType
> = z.enum(GeometryObjectSupportedType);

export const IntegrationTypeSchema: z.ZodType<IntegrationType, IntegrationType> =
  z.enum(IntegrationType);

export const ItemStatusSchema: z.ZodType<ItemStatus, ItemStatus> = z.enum(ItemStatus);

export const JobStatusSchema: z.ZodType<JobStatus, JobStatus> = z.enum(JobStatus);

export const JobTypeSchema: z.ZodType<JobType, JobType> = z.enum(JobType);

export const MultipleOperatorSchema: z.ZodType<MultipleOperator, MultipleOperator> =
  z.enum(MultipleOperator);

export const NodeTypeSchema: z.ZodType<NodeType, NodeType> = z.enum(NodeType);

export const NullableOperatorSchema: z.ZodType<NullableOperator, NullableOperator> =
  z.enum(NullableOperator);

export const NumberOperatorSchema: z.ZodType<NumberOperator, NumberOperator> =
  z.enum(NumberOperator);

export const OperatorTypeSchema: z.ZodType<OperatorType, OperatorType> = z.enum(OperatorType);

export const PreviewTypeSchema: z.ZodType<PreviewType, PreviewType> = z.enum(PreviewType);

export const ProjectVisibilitySchema: z.ZodType<ProjectVisibility, ProjectVisibility> =
  z.enum(ProjectVisibility);

export const RequestStateSchema: z.ZodType<RequestState, RequestState> = z.enum(RequestState);

export const ResourceTypeSchema: z.ZodType<ResourceType, ResourceType> = z.enum(ResourceType);

export const RoleSchema: z.ZodType<Role, Role> = z.enum(Role);

export const SchemaFieldTagColorSchema: z.ZodType<SchemaFieldTagColor, SchemaFieldTagColor> =
  z.enum(SchemaFieldTagColor);

export const SchemaFieldTypeSchema: z.ZodType<SchemaFieldType, SchemaFieldType> =
  z.enum(SchemaFieldType);

export const SortDirectionSchema: z.ZodType<SortDirection, SortDirection> = z.enum(SortDirection);

export const StringOperatorSchema: z.ZodType<StringOperator, StringOperator> =
  z.enum(StringOperator);

export const TerrainTypeSchema: z.ZodType<TerrainType, TerrainType> = z.enum(TerrainType);

export const ThemeSchema: z.ZodType<Theme, Theme> = z.enum(Theme);

export const TileTypeSchema: z.ZodType<TileType, TileType> = z.enum(TileType);

export const TimeOperatorSchema: z.ZodType<TimeOperator, TimeOperator> = z.enum(TimeOperator);

export function ApiKeyPayloadSchema(): z.ZodObject<Properties<ApiKeyPayload>> {
  return z.object({
    __typename: z.literal("APIKeyPayload").optional(),
    apiKey: z.lazy(() => ProjectApiKeySchema()),
    public: z.lazy(() => PublicationSettingsSchema()),
  });
}

export function AddCommentInputSchema(): z.ZodObject<Properties<AddCommentInput>> {
  return z.object({
    content: z.string(),
    threadId: z.string(),
  });
}

export function AddIntegrationToWorkspaceInputSchema(): z.ZodObject<
  Properties<AddIntegrationToWorkspaceInput>
> {
  return z.object({
    integrationId: z.string(),
    role: RoleSchema,
    workspaceId: z.string(),
  });
}

export function AddUsersToWorkspaceInputSchema(): z.ZodObject<
  Properties<AddUsersToWorkspaceInput>
> {
  return z.object({
    users: z.array(z.lazy(() => MemberInputSchema())),
    workspaceId: z.string(),
  });
}

export function AddUsersToWorkspacePayloadSchema(): z.ZodObject<
  Properties<AddUsersToWorkspacePayload>
> {
  return z.object({
    __typename: z.literal("AddUsersToWorkspacePayload").optional(),
    workspace: z.lazy(() => WorkspaceSchema()),
  });
}

export function AndConditionSchema(): z.ZodObject<Properties<AndCondition>> {
  return z.object({
    __typename: z.literal("AndCondition").optional(),
    conditions: z.array(z.lazy(() => ConditionSchema())),
  });
}

export function AndConditionInputSchema(): z.ZodObject<Properties<AndConditionInput>> {
  return z.object({
    conditions: z.array(z.lazy(() => ConditionInputSchema())),
  });
}

export function ApproveRequestInputSchema(): z.ZodObject<Properties<ApproveRequestInput>> {
  return z.object({
    requestId: z.string(),
  });
}

export function AssetSchema(): z.ZodObject<Properties<Asset>> {
  return z.object({
    __typename: z.literal("Asset").optional(),
    archiveExtractionStatus: ArchiveExtractionStatusSchema.nullish(),
    contentEncoding: z.string().nullish(),
    contentType: z.string().nullish(),
    createdAt: z.string(),
    createdBy: z.lazy(() => OperatorSchema()),
    createdById: z.string(),
    createdByType: OperatorTypeSchema,
    fileName: z.string(),
    id: z.string(),
    items: z.array(z.lazy(() => AssetItemSchema())).nullish(),
    previewType: PreviewTypeSchema.nullish(),
    project: z.lazy(() => ProjectSchema()),
    projectId: z.string(),
    public: z.boolean(),
    size: z.number(),
    thread: z.lazy(() => ThreadSchema().nullish()),
    threadId: z.string().nullish(),
    url: z.string(),
    uuid: z.string(),
  });
}

export function AssetConnectionSchema(): z.ZodObject<Properties<AssetConnection>> {
  return z.object({
    __typename: z.literal("AssetConnection").optional(),
    edges: z.array(z.lazy(() => AssetEdgeSchema())),
    nodes: z.array(z.lazy(() => AssetSchema().nullable())),
    pageInfo: z.lazy(() => PageInfoSchema()),
    totalCount: z.number(),
  });
}

export function AssetEdgeSchema(): z.ZodObject<Properties<AssetEdge>> {
  return z.object({
    __typename: z.literal("AssetEdge").optional(),
    cursor: z.string(),
    node: z.lazy(() => AssetSchema().nullish()),
  });
}

export function AssetFileSchema(): z.ZodObject<Properties<AssetFile>> {
  return z.object({
    __typename: z.literal("AssetFile").optional(),
    contentEncoding: z.string().nullish(),
    contentType: z.string().nullish(),
    filePaths: z.array(z.string()).nullish(),
    name: z.string(),
    path: z.string(),
    size: z.number(),
  });
}

export function AssetItemSchema(): z.ZodObject<Properties<AssetItem>> {
  return z.object({
    __typename: z.literal("AssetItem").optional(),
    itemId: z.string(),
    modelId: z.string(),
  });
}

export function AssetQueryInputSchema(): z.ZodObject<Properties<AssetQueryInput>> {
  return z.object({
    contentTypes: z.array(ContentTypesEnumSchema).nullish(),
    keyword: z.string().nullish(),
    project: z.string(),
  });
}

export function AssetSortSchema(): z.ZodObject<Properties<AssetSort>> {
  return z.object({
    direction: SortDirectionSchema.nullish(),
    sortBy: AssetSortTypeSchema,
  });
}

export function BasicFieldConditionSchema(): z.ZodObject<Properties<BasicFieldCondition>> {
  return z.object({
    __typename: z.literal("BasicFieldCondition").optional(),
    fieldId: z.lazy(() => FieldSelectorSchema()),
    operator: BasicOperatorSchema,
    value: z.unknown(),
  });
}

export function BasicFieldConditionInputSchema(): z.ZodObject<
  Properties<BasicFieldConditionInput>
> {
  return z.object({
    fieldId: z.lazy(() => FieldSelectorInputSchema()),
    operator: BasicOperatorSchema,
    value: z.unknown(),
  });
}

export function BoolFieldConditionSchema(): z.ZodObject<Properties<BoolFieldCondition>> {
  return z.object({
    __typename: z.literal("BoolFieldCondition").optional(),
    fieldId: z.lazy(() => FieldSelectorSchema()),
    operator: BoolOperatorSchema,
    value: z.boolean(),
  });
}

export function BoolFieldConditionInputSchema(): z.ZodObject<Properties<BoolFieldConditionInput>> {
  return z.object({
    fieldId: z.lazy(() => FieldSelectorInputSchema()),
    operator: BoolOperatorSchema,
    value: z.boolean(),
  });
}

export function CesiumResourcePropsSchema(): z.ZodObject<Properties<CesiumResourceProps>> {
  return z.object({
    __typename: z.literal("CesiumResourceProps").optional(),
    cesiumIonAccessToken: z.string(),
    cesiumIonAssetId: z.string(),
    image: z.string(),
    name: z.string(),
    url: z.string(),
  });
}

export function CesiumResourcePropsInputSchema(): z.ZodObject<
  Properties<CesiumResourcePropsInput>
> {
  return z.object({
    cesiumIonAccessToken: z.string(),
    cesiumIonAssetId: z.string(),
    image: z.string(),
    name: z.string(),
    url: z.string(),
  });
}

export function ColumnSchema(): z.ZodObject<Properties<Column>> {
  return z.object({
    __typename: z.literal("Column").optional(),
    field: z.lazy(() => FieldSelectorSchema()),
    visible: z.boolean(),
  });
}

export function ColumnSelectionInputSchema(): z.ZodObject<Properties<ColumnSelectionInput>> {
  return z.object({
    field: z.lazy(() => FieldSelectorInputSchema()),
    visible: z.boolean(),
  });
}

export function CommentSchema(): z.ZodObject<Properties<Comment>> {
  return z.object({
    __typename: z.literal("Comment").optional(),
    author: z.lazy(() => OperatorSchema().nullish()),
    authorId: z.string(),
    authorType: OperatorTypeSchema,
    content: z.string(),
    createdAt: z.string(),
    id: z.string(),
    threadId: z.string(),
    workspaceId: z.string(),
  });
}

export function CommentPayloadSchema(): z.ZodObject<Properties<CommentPayload>> {
  return z.object({
    __typename: z.literal("CommentPayload").optional(),
    comment: z.lazy(() => CommentSchema()),
    thread: z.lazy(() => ThreadSchema()),
  });
}

export function ConditionSchema() {
  return z.union([
    AndConditionSchema(),
    BasicFieldConditionSchema(),
    BoolFieldConditionSchema(),
    MultipleFieldConditionSchema(),
    NullableFieldConditionSchema(),
    NumberFieldConditionSchema(),
    OrConditionSchema(),
    StringFieldConditionSchema(),
    TimeFieldConditionSchema(),
  ]);
}

export function ConditionInputSchema(): z.ZodObject<Properties<ConditionInput>> {
  return z.object({
    and: z.lazy(() => AndConditionInputSchema().nullish()),
    basic: z.lazy(() => BasicFieldConditionInputSchema().nullish()),
    bool: z.lazy(() => BoolFieldConditionInputSchema().nullish()),
    multiple: z.lazy(() => MultipleFieldConditionInputSchema().nullish()),
    nullable: z.lazy(() => NullableFieldConditionInputSchema().nullish()),
    number: z.lazy(() => NumberFieldConditionInputSchema().nullish()),
    or: z.lazy(() => OrConditionInputSchema().nullish()),
    string: z.lazy(() => StringFieldConditionInputSchema().nullish()),
    time: z.lazy(() => TimeFieldConditionInputSchema().nullish()),
  });
}

export function CorrespondingFieldInputSchema(): z.ZodObject<Properties<CorrespondingFieldInput>> {
  return z.object({
    description: z.string(),
    fieldId: z.string().nullish(),
    key: z.string(),
    required: z.boolean(),
    title: z.string(),
  });
}

export function CreateApiKeyInputSchema(): z.ZodObject<Properties<CreateApiKeyInput>> {
  return z.object({
    description: z.string(),
    name: z.string(),
    projectId: z.string(),
    publication: z.lazy(() => UpdatePublicationSettingsInputSchema()),
  });
}

export function CreateAssetInputSchema(): z.ZodObject<Properties<CreateAssetInput>> {
  return z.object({
    contentEncoding: z.string().nullish(),
    file: z.unknown().nullish(),
    projectId: z.string(),
    skipDecompression: z.boolean().nullish(),
    token: z.string().nullish(),
    url: z.string().nullish(),
  });
}

export function CreateAssetPayloadSchema(): z.ZodObject<Properties<CreateAssetPayload>> {
  return z.object({
    __typename: z.literal("CreateAssetPayload").optional(),
    asset: z.lazy(() => AssetSchema()),
  });
}

export function CreateAssetUploadInputSchema(): z.ZodObject<Properties<CreateAssetUploadInput>> {
  return z.object({
    contentEncoding: z.string().nullish(),
    contentLength: z.number().nullish(),
    cursor: z.string().nullish(),
    filename: z.string().nullish(),
    projectId: z.string(),
  });
}

export function CreateAssetUploadPayloadSchema(): z.ZodObject<
  Properties<CreateAssetUploadPayload>
> {
  return z.object({
    __typename: z.literal("CreateAssetUploadPayload").optional(),
    contentEncoding: z.string().nullish(),
    contentLength: z.number(),
    contentType: z.string().nullish(),
    next: z.string().nullish(),
    token: z.string(),
    url: z.string(),
  });
}

export function CreateFieldInputSchema(): z.ZodObject<Properties<CreateFieldInput>> {
  return z.object({
    description: z.string().nullish(),
    groupId: z.string().nullish(),
    isTitle: z.boolean(),
    key: z.string(),
    metadata: z.boolean().nullish(),
    modelId: z.string().nullish(),
    multiple: z.boolean(),
    required: z.boolean(),
    title: z.string(),
    type: SchemaFieldTypeSchema,
    typeProperty: z.lazy(() => SchemaFieldTypePropertyInputSchema()),
    unique: z.boolean(),
  });
}

export function CreateGroupInputSchema(): z.ZodObject<Properties<CreateGroupInput>> {
  return z.object({
    description: z.string().nullish(),
    key: z.string(),
    name: z.string(),
    projectId: z.string(),
  });
}

export function CreateIntegrationInputSchema(): z.ZodObject<Properties<CreateIntegrationInput>> {
  return z.object({
    description: z.string().nullish(),
    logoUrl: z.string(),
    name: z.string(),
    type: IntegrationTypeSchema,
  });
}

export function CreateItemInputSchema(): z.ZodObject<Properties<CreateItemInput>> {
  return z.object({
    fields: z.array(z.lazy(() => ItemFieldInputSchema())),
    metadataId: z.string().nullish(),
    modelId: z.string(),
    originalId: z.string().nullish(),
    schemaId: z.string(),
  });
}

export function CreateModelInputSchema(): z.ZodObject<Properties<CreateModelInput>> {
  return z.object({
    description: z.string().nullish(),
    key: z.string().nullish(),
    name: z.string().nullish(),
    projectId: z.string(),
  });
}

export function CreateProjectInputSchema(): z.ZodObject<Properties<CreateProjectInput>> {
  return z.object({
    alias: z.string().nullish(),
    description: z.string().nullish(),
    license: z.string().nullish(),
    name: z.string().nullish(),
    readme: z.string().nullish(),
    requestRoles: z.array(RoleSchema).nullish(),
    visibility: ProjectVisibilitySchema.nullish(),
    workspaceId: z.string(),
  });
}

export function CreateRequestInputSchema(): z.ZodObject<Properties<CreateRequestInput>> {
  return z.object({
    description: z.string().nullish(),
    items: z.array(z.lazy(() => RequestItemInputSchema())),
    projectId: z.string(),
    reviewersId: z.array(z.string()).nullish(),
    state: RequestStateSchema.nullish(),
    title: z.string(),
  });
}

export function CreateThreadWithCommentInputSchema(): z.ZodObject<
  Properties<CreateThreadWithCommentInput>
> {
  return z.object({
    content: z.string(),
    resourceId: z.string(),
    resourceType: ResourceTypeSchema,
    workspaceId: z.string(),
  });
}

export function CreateViewInputSchema(): z.ZodObject<Properties<CreateViewInput>> {
  return z.object({
    columns: z.array(z.lazy(() => ColumnSelectionInputSchema())).nullish(),
    filter: z.lazy(() => ConditionInputSchema().nullish()),
    modelId: z.string(),
    name: z.string(),
    projectId: z.string(),
    sort: z.lazy(() => ItemSortInputSchema().nullish()),
  });
}

export function CreateWebhookInputSchema(): z.ZodObject<Properties<CreateWebhookInput>> {
  return z.object({
    active: z.boolean(),
    integrationId: z.string(),
    name: z.string(),
    secret: z.string(),
    trigger: z.lazy(() => WebhookTriggerInputSchema()),
    url: z.string(),
  });
}

export function CreateWorkspaceInputSchema(): z.ZodObject<Properties<CreateWorkspaceInput>> {
  return z.object({
    name: z.string(),
  });
}

export function CreateWorkspacePayloadSchema(): z.ZodObject<Properties<CreateWorkspacePayload>> {
  return z.object({
    __typename: z.literal("CreateWorkspacePayload").optional(),
    workspace: z.lazy(() => WorkspaceSchema()),
  });
}

export function DecompressAssetInputSchema(): z.ZodObject<Properties<DecompressAssetInput>> {
  return z.object({
    assetId: z.string(),
  });
}

export function DecompressAssetPayloadSchema(): z.ZodObject<Properties<DecompressAssetPayload>> {
  return z.object({
    __typename: z.literal("DecompressAssetPayload").optional(),
    asset: z.lazy(() => AssetSchema()),
  });
}

export function DeleteApiKeyInputSchema(): z.ZodObject<Properties<DeleteApiKeyInput>> {
  return z.object({
    id: z.string(),
    projectId: z.string(),
  });
}

export function DeleteApiKeyPayloadSchema(): z.ZodObject<Properties<DeleteApiKeyPayload>> {
  return z.object({
    __typename: z.literal("DeleteAPIKeyPayload").optional(),
    apiKeyId: z.string(),
  });
}

export function DeleteAssetInputSchema(): z.ZodObject<Properties<DeleteAssetInput>> {
  return z.object({
    assetId: z.string(),
  });
}

export function DeleteAssetPayloadSchema(): z.ZodObject<Properties<DeleteAssetPayload>> {
  return z.object({
    __typename: z.literal("DeleteAssetPayload").optional(),
    assetId: z.string(),
  });
}

export function DeleteAssetsInputSchema(): z.ZodObject<Properties<DeleteAssetsInput>> {
  return z.object({
    assetIds: z.array(z.string()),
  });
}

export function DeleteAssetsPayloadSchema(): z.ZodObject<Properties<DeleteAssetsPayload>> {
  return z.object({
    __typename: z.literal("DeleteAssetsPayload").optional(),
    assetIds: z.array(z.string()).nullish(),
  });
}

export function DeleteCommentInputSchema(): z.ZodObject<Properties<DeleteCommentInput>> {
  return z.object({
    commentId: z.string(),
    threadId: z.string(),
  });
}

export function DeleteCommentPayloadSchema(): z.ZodObject<Properties<DeleteCommentPayload>> {
  return z.object({
    __typename: z.literal("DeleteCommentPayload").optional(),
    commentId: z.string(),
    thread: z.lazy(() => ThreadSchema()),
  });
}

export function DeleteFieldInputSchema(): z.ZodObject<Properties<DeleteFieldInput>> {
  return z.object({
    fieldId: z.string(),
    groupId: z.string().nullish(),
    metadata: z.boolean().nullish(),
    modelId: z.string().nullish(),
  });
}

export function DeleteFieldPayloadSchema(): z.ZodObject<Properties<DeleteFieldPayload>> {
  return z.object({
    __typename: z.literal("DeleteFieldPayload").optional(),
    fieldId: z.string(),
  });
}

export function DeleteGroupInputSchema(): z.ZodObject<Properties<DeleteGroupInput>> {
  return z.object({
    groupId: z.string(),
  });
}

export function DeleteGroupPayloadSchema(): z.ZodObject<Properties<DeleteGroupPayload>> {
  return z.object({
    __typename: z.literal("DeleteGroupPayload").optional(),
    groupId: z.string(),
  });
}

export function DeleteIntegrationInputSchema(): z.ZodObject<Properties<DeleteIntegrationInput>> {
  return z.object({
    integrationId: z.string(),
  });
}

export function DeleteIntegrationPayloadSchema(): z.ZodObject<
  Properties<DeleteIntegrationPayload>
> {
  return z.object({
    __typename: z.literal("DeleteIntegrationPayload").optional(),
    integrationId: z.string(),
  });
}

export function DeleteIntegrationsInputSchema(): z.ZodObject<Properties<DeleteIntegrationsInput>> {
  return z.object({
    integrationIDs: z.array(z.string()),
  });
}

export function DeleteIntegrationsPayloadSchema(): z.ZodObject<
  Properties<DeleteIntegrationsPayload>
> {
  return z.object({
    __typename: z.literal("DeleteIntegrationsPayload").optional(),
    integrationIDs: z.array(z.string()).nullish(),
  });
}

export function DeleteItemInputSchema(): z.ZodObject<Properties<DeleteItemInput>> {
  return z.object({
    itemId: z.string(),
  });
}

export function DeleteItemPayloadSchema(): z.ZodObject<Properties<DeleteItemPayload>> {
  return z.object({
    __typename: z.literal("DeleteItemPayload").optional(),
    itemId: z.string(),
  });
}

export function DeleteItemsInputSchema(): z.ZodObject<Properties<DeleteItemsInput>> {
  return z.object({
    itemIds: z.array(z.string()),
  });
}

export function DeleteItemsPayloadSchema(): z.ZodObject<Properties<DeleteItemsPayload>> {
  return z.object({
    __typename: z.literal("DeleteItemsPayload").optional(),
    itemIds: z.array(z.string()),
  });
}

export function DeleteMeInputSchema(): z.ZodObject<Properties<DeleteMeInput>> {
  return z.object({
    userId: z.string(),
  });
}

export function DeleteMePayloadSchema(): z.ZodObject<Properties<DeleteMePayload>> {
  return z.object({
    __typename: z.literal("DeleteMePayload").optional(),
    userId: z.string(),
  });
}

export function DeleteModelInputSchema(): z.ZodObject<Properties<DeleteModelInput>> {
  return z.object({
    modelId: z.string(),
  });
}

export function DeleteModelPayloadSchema(): z.ZodObject<Properties<DeleteModelPayload>> {
  return z.object({
    __typename: z.literal("DeleteModelPayload").optional(),
    modelId: z.string(),
  });
}

export function DeleteProjectInputSchema(): z.ZodObject<Properties<DeleteProjectInput>> {
  return z.object({
    projectId: z.string(),
  });
}

export function DeleteProjectPayloadSchema(): z.ZodObject<Properties<DeleteProjectPayload>> {
  return z.object({
    __typename: z.literal("DeleteProjectPayload").optional(),
    projectId: z.string(),
  });
}

export function DeleteRequestInputSchema(): z.ZodObject<Properties<DeleteRequestInput>> {
  return z.object({
    projectId: z.string(),
    requestsId: z.array(z.string()),
  });
}

export function DeleteRequestPayloadSchema(): z.ZodObject<Properties<DeleteRequestPayload>> {
  return z.object({
    __typename: z.literal("DeleteRequestPayload").optional(),
    requests: z.array(z.string()),
  });
}

export function DeleteViewInputSchema(): z.ZodObject<Properties<DeleteViewInput>> {
  return z.object({
    viewId: z.string(),
  });
}

export function DeleteViewPayloadSchema(): z.ZodObject<Properties<DeleteViewPayload>> {
  return z.object({
    __typename: z.literal("DeleteViewPayload").optional(),
    viewId: z.string(),
  });
}

export function DeleteWebhookInputSchema(): z.ZodObject<Properties<DeleteWebhookInput>> {
  return z.object({
    integrationId: z.string(),
    webhookId: z.string(),
  });
}

export function DeleteWebhookPayloadSchema(): z.ZodObject<Properties<DeleteWebhookPayload>> {
  return z.object({
    __typename: z.literal("DeleteWebhookPayload").optional(),
    webhookId: z.string(),
  });
}

export function DeleteWorkspaceInputSchema(): z.ZodObject<Properties<DeleteWorkspaceInput>> {
  return z.object({
    workspaceId: z.string(),
  });
}

export function DeleteWorkspacePayloadSchema(): z.ZodObject<Properties<DeleteWorkspacePayload>> {
  return z.object({
    __typename: z.literal("DeleteWorkspacePayload").optional(),
    workspaceId: z.string(),
  });
}

export function ExportModelInputSchema(): z.ZodObject<Properties<ExportModelInput>> {
  return z.object({
    format: ExportFormatSchema,
    modelId: z.string(),
  });
}

export function ExportModelPayloadSchema(): z.ZodObject<Properties<ExportModelPayload>> {
  return z.object({
    __typename: z.literal("ExportModelPayload").optional(),
    modelId: z.string(),
    url: z.string(),
  });
}

export function ExportModelSchemaInputSchema(): z.ZodObject<Properties<ExportModelSchemaInput>> {
  return z.object({
    modelId: z.string(),
  });
}

export function ExportModelSchemaPayloadSchema(): z.ZodObject<
  Properties<ExportModelSchemaPayload>
> {
  return z.object({
    __typename: z.literal("ExportModelSchemaPayload").optional(),
    modelId: z.string(),
    url: z.string(),
  });
}

export function FieldPayloadSchema(): z.ZodObject<Properties<FieldPayload>> {
  return z.object({
    __typename: z.literal("FieldPayload").optional(),
    field: z.lazy(() => SchemaFieldSchema()),
  });
}

export function FieldSelectorSchema(): z.ZodObject<Properties<FieldSelector>> {
  return z.object({
    __typename: z.literal("FieldSelector").optional(),
    id: z.string().nullish(),
    type: FieldTypeSchema,
  });
}

export function FieldSelectorInputSchema(): z.ZodObject<Properties<FieldSelectorInput>> {
  return z.object({
    id: z.string().nullish(),
    type: FieldTypeSchema,
  });
}

export function FieldsPayloadSchema(): z.ZodObject<Properties<FieldsPayload>> {
  return z.object({
    __typename: z.literal("FieldsPayload").optional(),
    fields: z.array(z.lazy(() => SchemaFieldSchema())),
  });
}

export function GroupSchema(): z.ZodObject<Properties<Group>> {
  return z.object({
    __typename: z.literal("Group").optional(),
    description: z.string(),
    fields: z.array(z.lazy(() => SchemaFieldSchema())),
    id: z.string(),
    key: z.string(),
    name: z.string(),
    order: z.number(),
    project: z.lazy(() => ProjectSchema()),
    projectId: z.string(),
    schema: z.lazy(() => SchemaSchema()),
    schemaId: z.string(),
  });
}

export function GroupPayloadSchema(): z.ZodObject<Properties<GroupPayload>> {
  return z.object({
    __typename: z.literal("GroupPayload").optional(),
    group: z.lazy(() => GroupSchema()),
  });
}

export function GroupsPayloadSchema(): z.ZodObject<Properties<GroupsPayload>> {
  return z.object({
    __typename: z.literal("GroupsPayload").optional(),
    groups: z.array(z.lazy(() => GroupSchema())),
  });
}

export function GuessSchemaFieldSchema(): z.ZodObject<Properties<GuessSchemaField>> {
  return z.object({
    __typename: z.literal("GuessSchemaField").optional(),
    key: z.string(),
    name: z.string(),
    type: z.string(),
  });
}

export function GuessSchemaFieldResultSchema(): z.ZodObject<Properties<GuessSchemaFieldResult>> {
  return z.object({
    __typename: z.literal("GuessSchemaFieldResult").optional(),
    fields: z.array(z.lazy(() => GuessSchemaFieldSchema())),
    total_count: z.number(),
  });
}

export function GuessSchemaFieldsInputSchema(): z.ZodObject<Properties<GuessSchemaFieldsInput>> {
  return z.object({
    assetId: z.string(),
    modelId: z.string(),
  });
}

export function ImportItemsAsyncPayloadSchema(): z.ZodObject<Properties<ImportItemsAsyncPayload>> {
  return z.object({
    __typename: z.literal("ImportItemsAsyncPayload").optional(),
    job: z.lazy(() => JobSchema()),
  });
}

export function ImportItemsInputSchema(): z.ZodObject<Properties<ImportItemsInput>> {
  return z.object({
    file: z.unknown(),
    geoField: z.string().nullish(),
    modelId: z.string(),
  });
}

export function ImportItemsPayloadSchema(): z.ZodObject<Properties<ImportItemsPayload>> {
  return z.object({
    __typename: z.literal("ImportItemsPayload").optional(),
    ignoredCount: z.number(),
    insertedCount: z.number(),
    modelId: z.string(),
    totalCount: z.number(),
    updatedCount: z.number(),
  });
}

export function IntegrationSchema(): z.ZodObject<Properties<Integration>> {
  return z.object({
    __typename: z.literal("Integration").optional(),
    config: z.lazy(() => IntegrationConfigSchema().nullish()),
    createdAt: z.string(),
    description: z.string().nullish(),
    developer: z.lazy(() => UserSchema()),
    developerId: z.string(),
    iType: IntegrationTypeSchema,
    id: z.string(),
    logoUrl: z.string(),
    name: z.string(),
    updatedAt: z.string(),
  });
}

export function IntegrationConfigSchema(): z.ZodObject<Properties<IntegrationConfig>> {
  return z.object({
    __typename: z.literal("IntegrationConfig").optional(),
    token: z.string(),
    webhooks: z.array(z.lazy(() => WebhookSchema())),
  });
}

export function IntegrationPayloadSchema(): z.ZodObject<Properties<IntegrationPayload>> {
  return z.object({
    __typename: z.literal("IntegrationPayload").optional(),
    integration: z.lazy(() => IntegrationSchema()),
  });
}

export function ItemSchema(): z.ZodObject<Properties<Item>> {
  return z.object({
    __typename: z.literal("Item").optional(),
    assets: z.array(z.lazy(() => AssetSchema().nullable())),
    createdAt: z.string(),
    createdBy: z.lazy(() => OperatorSchema().nullish()),
    fields: z.array(z.lazy(() => ItemFieldSchema())),
    id: z.string(),
    integrationId: z.string().nullish(),
    isMetadata: z.boolean(),
    metadata: z.lazy(() => ItemSchema().nullish()),
    metadataId: z.string().nullish(),
    model: z.lazy(() => ModelSchema()),
    modelId: z.string(),
    original: z.lazy(() => ItemSchema().nullish()),
    originalId: z.string().nullish(),
    project: z.lazy(() => ProjectSchema()),
    projectId: z.string(),
    referencedItems: z.array(z.lazy(() => ItemSchema())).nullish(),
    requests: z.array(z.lazy(() => RequestSchema())).nullish(),
    schema: z.lazy(() => SchemaSchema()),
    schemaId: z.string(),
    status: ItemStatusSchema,
    thread: z.lazy(() => ThreadSchema().nullish()),
    threadId: z.string().nullish(),
    title: z.string().nullish(),
    updatedAt: z.string(),
    updatedBy: z.lazy(() => OperatorSchema().nullish()),
    updatedByIntegrationId: z.string().nullish(),
    updatedByUserId: z.string().nullish(),
    userId: z.string().nullish(),
    version: z.string(),
  });
}

export function ItemConnectionSchema(): z.ZodObject<Properties<ItemConnection>> {
  return z.object({
    __typename: z.literal("ItemConnection").optional(),
    edges: z.array(z.lazy(() => ItemEdgeSchema())),
    nodes: z.array(z.lazy(() => ItemSchema().nullable())),
    pageInfo: z.lazy(() => PageInfoSchema()),
    totalCount: z.number(),
  });
}

export function ItemEdgeSchema(): z.ZodObject<Properties<ItemEdge>> {
  return z.object({
    __typename: z.literal("ItemEdge").optional(),
    cursor: z.string(),
    node: z.lazy(() => ItemSchema().nullish()),
  });
}

export function ItemFieldSchema(): z.ZodObject<Properties<ItemField>> {
  return z.object({
    __typename: z.literal("ItemField").optional(),
    itemGroupId: z.string().nullish(),
    schemaFieldId: z.string(),
    type: SchemaFieldTypeSchema,
    value: z.unknown().nullish(),
  });
}

export function ItemFieldInputSchema(): z.ZodObject<Properties<ItemFieldInput>> {
  return z.object({
    itemGroupId: z.string().nullish(),
    schemaFieldId: z.string(),
    type: SchemaFieldTypeSchema,
    value: z.unknown(),
  });
}

export function ItemPayloadSchema(): z.ZodObject<Properties<ItemPayload>> {
  return z.object({
    __typename: z.literal("ItemPayload").optional(),
    item: z.lazy(() => ItemSchema()),
  });
}

export function ItemQueryInputSchema(): z.ZodObject<Properties<ItemQueryInput>> {
  return z.object({
    model: z.string(),
    project: z.string(),
    q: z.string().nullish(),
    schema: z.string().nullish(),
  });
}

export function ItemSortSchema(): z.ZodObject<Properties<ItemSort>> {
  return z.object({
    __typename: z.literal("ItemSort").optional(),
    direction: SortDirectionSchema.nullish(),
    field: z.lazy(() => FieldSelectorSchema()),
  });
}

export function ItemSortInputSchema(): z.ZodObject<Properties<ItemSortInput>> {
  return z.object({
    direction: SortDirectionSchema.nullish(),
    field: z.lazy(() => FieldSelectorInputSchema()),
  });
}

export function JobSchema(): z.ZodObject<Properties<Job>> {
  return z.object({
    __typename: z.literal("Job").optional(),
    completedAt: z.string().nullish(),
    createdAt: z.string(),
    error: z.string().nullish(),
    id: z.string(),
    progress: z.lazy(() => JobProgressSchema()),
    projectId: z.string(),
    startedAt: z.string().nullish(),
    status: JobStatusSchema,
    type: JobTypeSchema,
    updatedAt: z.string(),
  });
}

export function JobProgressSchema(): z.ZodObject<Properties<JobProgress>> {
  return z.object({
    __typename: z.literal("JobProgress").optional(),
    percentage: z.number(),
    processed: z.number(),
    total: z.number(),
  });
}

export function JobStateSchema(): z.ZodObject<Properties<JobState>> {
  return z.object({
    __typename: z.literal("JobState").optional(),
    error: z.string().nullish(),
    progress: z.lazy(() => JobProgressSchema().nullish()),
    status: JobStatusSchema,
  });
}

export function KeyAvailabilitySchema(): z.ZodObject<Properties<KeyAvailability>> {
  return z.object({
    __typename: z.literal("KeyAvailability").optional(),
    available: z.boolean(),
    key: z.string(),
  });
}

export function MeSchema(): z.ZodObject<Properties<Me>> {
  return z.object({
    __typename: z.literal("Me").optional(),
    auths: z.array(z.string()),
    email: z.string(),
    host: z.string().nullish(),
    id: z.string(),
    integrations: z.array(z.lazy(() => IntegrationSchema())),
    lang: z.string(),
    myWorkspace: z.lazy(() => WorkspaceSchema().nullish()),
    myWorkspaceId: z.string(),
    name: z.string(),
    profilePictureUrl: z.string().nullish(),
    theme: ThemeSchema,
    workspaces: z.array(z.lazy(() => WorkspaceSchema())),
  });
}

export function MemberInputSchema(): z.ZodObject<Properties<MemberInput>> {
  return z.object({
    role: RoleSchema,
    userId: z.string(),
  });
}

export function ModelSchema(): z.ZodObject<Properties<Model>> {
  return z.object({
    __typename: z.literal("Model").optional(),
    createdAt: z.string(),
    description: z.string(),
    id: z.string(),
    key: z.string(),
    metadataSchema: z.lazy(() => SchemaSchema().nullish()),
    metadataSchemaId: z.string().nullish(),
    name: z.string(),
    order: z.number().nullish(),
    project: z.lazy(() => ProjectSchema()),
    projectId: z.string(),
    schema: z.lazy(() => SchemaSchema()),
    schemaId: z.string(),
    updatedAt: z.string(),
  });
}

export function ModelConnectionSchema(): z.ZodObject<Properties<ModelConnection>> {
  return z.object({
    __typename: z.literal("ModelConnection").optional(),
    edges: z.array(z.lazy(() => ModelEdgeSchema())),
    nodes: z.array(z.lazy(() => ModelSchema().nullable())),
    pageInfo: z.lazy(() => PageInfoSchema()),
    totalCount: z.number(),
  });
}

export function ModelEdgeSchema(): z.ZodObject<Properties<ModelEdge>> {
  return z.object({
    __typename: z.literal("ModelEdge").optional(),
    cursor: z.string(),
    node: z.lazy(() => ModelSchema().nullish()),
  });
}

export function ModelPayloadSchema(): z.ZodObject<Properties<ModelPayload>> {
  return z.object({
    __typename: z.literal("ModelPayload").optional(),
    model: z.lazy(() => ModelSchema()),
  });
}

export function ModelsPayloadSchema(): z.ZodObject<Properties<ModelsPayload>> {
  return z.object({
    __typename: z.literal("ModelsPayload").optional(),
    models: z.array(z.lazy(() => ModelSchema())),
  });
}

export function MultipleFieldConditionSchema(): z.ZodObject<Properties<MultipleFieldCondition>> {
  return z.object({
    __typename: z.literal("MultipleFieldCondition").optional(),
    fieldId: z.lazy(() => FieldSelectorSchema()),
    operator: MultipleOperatorSchema,
    value: z.array(z.unknown()),
  });
}

export function MultipleFieldConditionInputSchema(): z.ZodObject<
  Properties<MultipleFieldConditionInput>
> {
  return z.object({
    fieldId: z.lazy(() => FieldSelectorInputSchema()),
    operator: MultipleOperatorSchema,
    value: z.array(z.unknown()),
  });
}

export function NodeSchema(): z.ZodObject<Properties<Node>> {
  return z.object({
    id: z.string(),
  });
}

export function NullableFieldConditionSchema(): z.ZodObject<Properties<NullableFieldCondition>> {
  return z.object({
    __typename: z.literal("NullableFieldCondition").optional(),
    fieldId: z.lazy(() => FieldSelectorSchema()),
    operator: NullableOperatorSchema,
  });
}

export function NullableFieldConditionInputSchema(): z.ZodObject<
  Properties<NullableFieldConditionInput>
> {
  return z.object({
    fieldId: z.lazy(() => FieldSelectorInputSchema()),
    operator: NullableOperatorSchema,
  });
}

export function NumberFieldConditionSchema(): z.ZodObject<Properties<NumberFieldCondition>> {
  return z.object({
    __typename: z.literal("NumberFieldCondition").optional(),
    fieldId: z.lazy(() => FieldSelectorSchema()),
    operator: NumberOperatorSchema,
    value: z.number(),
  });
}

export function NumberFieldConditionInputSchema(): z.ZodObject<
  Properties<NumberFieldConditionInput>
> {
  return z.object({
    fieldId: z.lazy(() => FieldSelectorInputSchema()),
    operator: NumberOperatorSchema,
    value: z.number(),
  });
}

export function OperatorSchema() {
  return z.union([IntegrationSchema(), UserSchema()]);
}

export function OperatorInputSchema(): z.ZodObject<Properties<OperatorInput>> {
  return z.object({
    basic: BasicOperatorSchema.nullish(),
    bool: BoolOperatorSchema.nullish(),
    nullable: NullableOperatorSchema.nullish(),
    number: NumberOperatorSchema.nullish(),
    string: StringOperatorSchema.nullish(),
    time: TimeOperatorSchema.nullish(),
  });
}

export function OrConditionSchema(): z.ZodObject<Properties<OrCondition>> {
  return z.object({
    __typename: z.literal("OrCondition").optional(),
    conditions: z.array(z.lazy(() => ConditionSchema())),
  });
}

export function OrConditionInputSchema(): z.ZodObject<Properties<OrConditionInput>> {
  return z.object({
    conditions: z.array(z.lazy(() => ConditionInputSchema())),
  });
}

export function PageInfoSchema(): z.ZodObject<Properties<PageInfo>> {
  return z.object({
    __typename: z.literal("PageInfo").optional(),
    endCursor: z.string().nullish(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
    startCursor: z.string().nullish(),
  });
}

export function PaginationSchema(): z.ZodObject<Properties<Pagination>> {
  return z.object({
    after: z.string().nullish(),
    before: z.string().nullish(),
    first: z.number().nullish(),
    last: z.number().nullish(),
    offset: z.number().nullish(),
  });
}

export function ProjectSchema(): z.ZodObject<Properties<Project>> {
  return z.object({
    __typename: z.literal("Project").optional(),
    accessibility: z.lazy(() => ProjectAccessibilitySchema()),
    alias: z.string(),
    createdAt: z.string(),
    description: z.string(),
    id: z.string(),
    license: z.string(),
    name: z.string(),
    readme: z.string(),
    requestRoles: z.array(RoleSchema).nullish(),
    updatedAt: z.string(),
    workspace: z.lazy(() => WorkspaceSchema().nullish()),
    workspaceId: z.string(),
  });
}

export function ProjectApiKeySchema(): z.ZodObject<Properties<ProjectApiKey>> {
  return z.object({
    __typename: z.literal("ProjectAPIKey").optional(),
    description: z.string(),
    id: z.string(),
    key: z.string(),
    name: z.string(),
    publication: z.lazy(() => PublicationSettingsSchema()),
  });
}

export function ProjectAccessibilitySchema(): z.ZodObject<Properties<ProjectAccessibility>> {
  return z.object({
    __typename: z.literal("ProjectAccessibility").optional(),
    apiKeys: z.array(z.lazy(() => ProjectApiKeySchema())).nullish(),
    publication: z.lazy(() => PublicationSettingsSchema().nullish()),
    visibility: ProjectVisibilitySchema,
  });
}

export function ProjectAliasAvailabilitySchema(): z.ZodObject<
  Properties<ProjectAliasAvailability>
> {
  return z.object({
    __typename: z.literal("ProjectAliasAvailability").optional(),
    alias: z.string(),
    available: z.boolean(),
  });
}

export function ProjectConnectionSchema(): z.ZodObject<Properties<ProjectConnection>> {
  return z.object({
    __typename: z.literal("ProjectConnection").optional(),
    edges: z.array(z.lazy(() => ProjectEdgeSchema())),
    nodes: z.array(z.lazy(() => ProjectSchema().nullable())),
    pageInfo: z.lazy(() => PageInfoSchema()),
    totalCount: z.number(),
  });
}

export function ProjectEdgeSchema(): z.ZodObject<Properties<ProjectEdge>> {
  return z.object({
    __typename: z.literal("ProjectEdge").optional(),
    cursor: z.string(),
    node: z.lazy(() => ProjectSchema().nullish()),
  });
}

export function ProjectPayloadSchema(): z.ZodObject<Properties<ProjectPayload>> {
  return z.object({
    __typename: z.literal("ProjectPayload").optional(),
    project: z.lazy(() => ProjectSchema()),
  });
}

export function PublicationSettingsSchema(): z.ZodObject<Properties<PublicationSettings>> {
  return z.object({
    __typename: z.literal("PublicationSettings").optional(),
    publicAssets: z.boolean(),
    publicModels: z.array(z.string()),
  });
}

export function PublishItemInputSchema(): z.ZodObject<Properties<PublishItemInput>> {
  return z.object({
    itemIds: z.array(z.string()),
  });
}

export function PublishItemPayloadSchema(): z.ZodObject<Properties<PublishItemPayload>> {
  return z.object({
    __typename: z.literal("PublishItemPayload").optional(),
    items: z.array(z.lazy(() => ItemSchema())),
  });
}

export function RegenerateApiKeyInputSchema(): z.ZodObject<Properties<RegenerateApiKeyInput>> {
  return z.object({
    id: z.string(),
    projectId: z.string(),
  });
}

export function RegenerateIntegrationTokenInputSchema(): z.ZodObject<
  Properties<RegenerateIntegrationTokenInput>
> {
  return z.object({
    integrationId: z.string(),
  });
}

export function RemoveIntegrationFromWorkspaceInputSchema(): z.ZodObject<
  Properties<RemoveIntegrationFromWorkspaceInput>
> {
  return z.object({
    integrationId: z.string(),
    workspaceId: z.string(),
  });
}

export function RemoveIntegrationFromWorkspacePayloadSchema(): z.ZodObject<
  Properties<RemoveIntegrationFromWorkspacePayload>
> {
  return z.object({
    __typename: z.literal("RemoveIntegrationFromWorkspacePayload").optional(),
    workspace: z.lazy(() => WorkspaceSchema()),
  });
}

export function RemoveIntegrationsFromWorkspaceInputSchema(): z.ZodObject<
  Properties<RemoveIntegrationsFromWorkspaceInput>
> {
  return z.object({
    integrationIds: z.array(z.string()),
    workspaceId: z.string(),
  });
}

export function RemoveIntegrationsFromWorkspacePayloadSchema(): z.ZodObject<
  Properties<RemoveIntegrationsFromWorkspacePayload>
> {
  return z.object({
    __typename: z.literal("RemoveIntegrationsFromWorkspacePayload").optional(),
    workspace: z.lazy(() => WorkspaceSchema()),
  });
}

export function RemoveMultipleMembersFromWorkspaceInputSchema(): z.ZodObject<
  Properties<RemoveMultipleMembersFromWorkspaceInput>
> {
  return z.object({
    userIds: z.array(z.string()),
    workspaceId: z.string(),
  });
}

export function RemoveMultipleMembersFromWorkspacePayloadSchema(): z.ZodObject<
  Properties<RemoveMultipleMembersFromWorkspacePayload>
> {
  return z.object({
    __typename: z.literal("RemoveMultipleMembersFromWorkspacePayload").optional(),
    workspace: z.lazy(() => WorkspaceSchema()),
  });
}

export function RemoveMyAuthInputSchema(): z.ZodObject<Properties<RemoveMyAuthInput>> {
  return z.object({
    auth: z.string(),
  });
}

export function RequestSchema(): z.ZodObject<Properties<Request>> {
  return z.object({
    __typename: z.literal("Request").optional(),
    approvedAt: z.string().nullish(),
    closedAt: z.string().nullish(),
    createdAt: z.string(),
    createdBy: z.lazy(() => UserSchema().nullish()),
    createdById: z.string(),
    description: z.string().nullish(),
    id: z.string(),
    items: z.array(z.lazy(() => RequestItemSchema())),
    project: z.lazy(() => ProjectSchema().nullish()),
    projectId: z.string(),
    reviewers: z.array(z.lazy(() => UserSchema())),
    reviewersId: z.array(z.string()),
    state: RequestStateSchema,
    thread: z.lazy(() => ThreadSchema().nullish()),
    threadId: z.string().nullish(),
    title: z.string(),
    updatedAt: z.string(),
    workspace: z.lazy(() => WorkspaceSchema().nullish()),
    workspaceId: z.string(),
  });
}

export function RequestConnectionSchema(): z.ZodObject<Properties<RequestConnection>> {
  return z.object({
    __typename: z.literal("RequestConnection").optional(),
    edges: z.array(z.lazy(() => RequestEdgeSchema())),
    nodes: z.array(z.lazy(() => RequestSchema().nullable())),
    pageInfo: z.lazy(() => PageInfoSchema()),
    totalCount: z.number(),
  });
}

export function RequestEdgeSchema(): z.ZodObject<Properties<RequestEdge>> {
  return z.object({
    __typename: z.literal("RequestEdge").optional(),
    cursor: z.string(),
    node: z.lazy(() => RequestSchema().nullish()),
  });
}

export function RequestItemSchema(): z.ZodObject<Properties<RequestItem>> {
  return z.object({
    __typename: z.literal("RequestItem").optional(),
    item: z.lazy(() => VersionedItemSchema().nullish()),
    itemId: z.string(),
    ref: z.string().nullish(),
    version: z.string().nullish(),
  });
}

export function RequestItemInputSchema(): z.ZodObject<Properties<RequestItemInput>> {
  return z.object({
    itemId: z.string(),
    version: z.string().nullish(),
  });
}

export function RequestPayloadSchema(): z.ZodObject<Properties<RequestPayload>> {
  return z.object({
    __typename: z.literal("RequestPayload").optional(),
    request: z.lazy(() => RequestSchema()),
  });
}

export function ResourceSchema() {
  return z.union([TerrainResourceSchema(), TileResourceSchema()]);
}

export function ResourceInputSchema(): z.ZodObject<Properties<ResourceInput>> {
  return z.object({
    terrain: z.lazy(() => TerrainResourceInputSchema().nullish()),
    tile: z.lazy(() => TileResourceInputSchema().nullish()),
  });
}

export function ResourceListSchema(): z.ZodObject<Properties<ResourceList>> {
  return z.object({
    __typename: z.literal("ResourceList").optional(),
    enabled: z.boolean().nullish(),
    resources: z.array(z.lazy(() => ResourceSchema())),
    selectedResource: z.string().nullish(),
  });
}

export function ResourcesListInputSchema(): z.ZodObject<Properties<ResourcesListInput>> {
  return z.object({
    enabled: z.boolean().nullish(),
    resources: z.array(z.lazy(() => ResourceInputSchema())),
    selectedResource: z.string().nullish(),
  });
}

export function SchemaSchema(): z.ZodObject<Properties<Schema>> {
  return z.object({
    __typename: z.literal("Schema").optional(),
    fields: z.array(z.lazy(() => SchemaFieldSchema())),
    id: z.string(),
    project: z.lazy(() => ProjectSchema()),
    projectId: z.string(),
    titleField: z.lazy(() => SchemaFieldSchema().nullish()),
    titleFieldId: z.string().nullish(),
  });
}

export function SchemaFieldSchema(): z.ZodObject<Properties<SchemaField>> {
  return z.object({
    __typename: z.literal("SchemaField").optional(),
    createdAt: z.string(),
    description: z.string().nullish(),
    group: z.lazy(() => GroupSchema().nullish()),
    groupId: z.string().nullish(),
    id: z.string(),
    isTitle: z.boolean(),
    key: z.string(),
    model: z.lazy(() => ModelSchema().nullish()),
    modelId: z.string().nullish(),
    multiple: z.boolean(),
    order: z.number().nullish(),
    required: z.boolean(),
    title: z.string(),
    type: SchemaFieldTypeSchema,
    typeProperty: z.lazy(() => SchemaFieldTypePropertySchema().nullish()),
    unique: z.boolean(),
    updatedAt: z.string(),
  });
}

export function SchemaFieldAssetSchema(): z.ZodObject<Properties<SchemaFieldAsset>> {
  return z.object({
    __typename: z.literal("SchemaFieldAsset").optional(),
    defaultValue: z.unknown().nullish(),
  });
}

export function SchemaFieldAssetInputSchema(): z.ZodObject<Properties<SchemaFieldAssetInput>> {
  return z.object({
    defaultValue: z.unknown().nullish(),
  });
}

export function SchemaFieldBoolSchema(): z.ZodObject<Properties<SchemaFieldBool>> {
  return z.object({
    __typename: z.literal("SchemaFieldBool").optional(),
    defaultValue: z.unknown().nullish(),
  });
}

export function SchemaFieldBoolInputSchema(): z.ZodObject<Properties<SchemaFieldBoolInput>> {
  return z.object({
    defaultValue: z.unknown().nullish(),
  });
}

export function SchemaFieldCheckboxSchema(): z.ZodObject<Properties<SchemaFieldCheckbox>> {
  return z.object({
    __typename: z.literal("SchemaFieldCheckbox").optional(),
    defaultValue: z.unknown().nullish(),
  });
}

export function SchemaFieldCheckboxInputSchema(): z.ZodObject<
  Properties<SchemaFieldCheckboxInput>
> {
  return z.object({
    defaultValue: z.unknown().nullish(),
  });
}

export function SchemaFieldDateSchema(): z.ZodObject<Properties<SchemaFieldDate>> {
  return z.object({
    __typename: z.literal("SchemaFieldDate").optional(),
    defaultValue: z.unknown().nullish(),
  });
}

export function SchemaFieldDateInputSchema(): z.ZodObject<Properties<SchemaFieldDateInput>> {
  return z.object({
    defaultValue: z.unknown().nullish(),
  });
}

export function SchemaFieldGeometryEditorSchema(): z.ZodObject<
  Properties<SchemaFieldGeometryEditor>
> {
  return z.object({
    __typename: z.literal("SchemaFieldGeometryEditor").optional(),
    defaultValue: z.unknown().nullish(),
    supportedTypes: z.array(GeometryEditorSupportedTypeSchema),
  });
}

export function SchemaFieldGeometryEditorInputSchema(): z.ZodObject<
  Properties<SchemaFieldGeometryEditorInput>
> {
  return z.object({
    defaultValue: z.unknown().nullish(),
    supportedTypes: z.array(GeometryEditorSupportedTypeSchema),
  });
}

export function SchemaFieldGeometryObjectSchema(): z.ZodObject<
  Properties<SchemaFieldGeometryObject>
> {
  return z.object({
    __typename: z.literal("SchemaFieldGeometryObject").optional(),
    defaultValue: z.unknown().nullish(),
    supportedTypes: z.array(GeometryObjectSupportedTypeSchema),
  });
}

export function SchemaFieldGeometryObjectInputSchema(): z.ZodObject<
  Properties<SchemaFieldGeometryObjectInput>
> {
  return z.object({
    defaultValue: z.unknown().nullish(),
    supportedTypes: z.array(GeometryObjectSupportedTypeSchema),
  });
}

export function SchemaFieldGroupSchema(): z.ZodObject<Properties<SchemaFieldGroup>> {
  return z.object({
    __typename: z.literal("SchemaFieldGroup").optional(),
    groupId: z.string(),
  });
}

export function SchemaFieldGroupInputSchema(): z.ZodObject<Properties<SchemaFieldGroupInput>> {
  return z.object({
    groupId: z.string(),
  });
}

export function SchemaFieldIntegerSchema(): z.ZodObject<Properties<SchemaFieldInteger>> {
  return z.object({
    __typename: z.literal("SchemaFieldInteger").optional(),
    defaultValue: z.unknown().nullish(),
    max: z.number().nullish(),
    min: z.number().nullish(),
  });
}

export function SchemaFieldIntegerInputSchema(): z.ZodObject<Properties<SchemaFieldIntegerInput>> {
  return z.object({
    defaultValue: z.unknown().nullish(),
    max: z.number().nullish(),
    min: z.number().nullish(),
  });
}

export function SchemaFieldLineStringInputSchema(): z.ZodObject<
  Properties<SchemaFieldLineStringInput>
> {
  return z.object({
    defaultValue: z.unknown().nullish(),
  });
}

export function SchemaFieldMarkdownSchema(): z.ZodObject<Properties<SchemaFieldMarkdown>> {
  return z.object({
    __typename: z.literal("SchemaFieldMarkdown").optional(),
    defaultValue: z.unknown().nullish(),
    maxLength: z.number().nullish(),
  });
}

export function SchemaFieldNumberSchema(): z.ZodObject<Properties<SchemaFieldNumber>> {
  return z.object({
    __typename: z.literal("SchemaFieldNumber").optional(),
    defaultValue: z.unknown().nullish(),
    max: z.number().nullish(),
    min: z.number().nullish(),
  });
}

export function SchemaFieldNumberInputSchema(): z.ZodObject<Properties<SchemaFieldNumberInput>> {
  return z.object({
    defaultValue: z.unknown().nullish(),
    max: z.number().nullish(),
    min: z.number().nullish(),
  });
}

export function SchemaFieldReferenceSchema(): z.ZodObject<Properties<SchemaFieldReference>> {
  return z.object({
    __typename: z.literal("SchemaFieldReference").optional(),
    correspondingField: z.lazy(() => SchemaFieldSchema().nullish()),
    correspondingFieldId: z.string().nullish(),
    modelId: z.string(),
    schema: z.lazy(() => SchemaSchema()),
    schemaId: z.string(),
  });
}

export function SchemaFieldReferenceInputSchema(): z.ZodObject<
  Properties<SchemaFieldReferenceInput>
> {
  return z.object({
    correspondingField: z.lazy(() => CorrespondingFieldInputSchema().nullish()),
    modelId: z.string(),
    schemaId: z.string(),
  });
}

export function SchemaFieldRichTextSchema(): z.ZodObject<Properties<SchemaFieldRichText>> {
  return z.object({
    __typename: z.literal("SchemaFieldRichText").optional(),
    defaultValue: z.unknown().nullish(),
    maxLength: z.number().nullish(),
  });
}

export function SchemaFieldRichTextInputSchema(): z.ZodObject<
  Properties<SchemaFieldRichTextInput>
> {
  return z.object({
    defaultValue: z.unknown().nullish(),
    maxLength: z.number().nullish(),
  });
}

export function SchemaFieldSelectSchema(): z.ZodObject<Properties<SchemaFieldSelect>> {
  return z.object({
    __typename: z.literal("SchemaFieldSelect").optional(),
    defaultValue: z.unknown().nullish(),
    values: z.array(z.string()),
  });
}

export function SchemaFieldSelectInputSchema(): z.ZodObject<Properties<SchemaFieldSelectInput>> {
  return z.object({
    defaultValue: z.unknown().nullish(),
    values: z.array(z.string()),
  });
}

export function SchemaFieldTagSchema(): z.ZodObject<Properties<SchemaFieldTag>> {
  return z.object({
    __typename: z.literal("SchemaFieldTag").optional(),
    defaultValue: z.unknown().nullish(),
    tags: z.array(z.lazy(() => SchemaFieldTagValueSchema())),
  });
}

export function SchemaFieldTagInputSchema(): z.ZodObject<Properties<SchemaFieldTagInput>> {
  return z.object({
    defaultValue: z.unknown().nullish(),
    tags: z.array(z.lazy(() => SchemaFieldTagValueInputSchema())),
  });
}

export function SchemaFieldTagValueSchema(): z.ZodObject<Properties<SchemaFieldTagValue>> {
  return z.object({
    __typename: z.literal("SchemaFieldTagValue").optional(),
    color: SchemaFieldTagColorSchema,
    id: z.string(),
    name: z.string(),
  });
}

export function SchemaFieldTagValueInputSchema(): z.ZodObject<
  Properties<SchemaFieldTagValueInput>
> {
  return z.object({
    color: SchemaFieldTagColorSchema.nullish(),
    id: z.string().nullish(),
    name: z.string().nullish(),
  });
}

export function SchemaFieldTextSchema(): z.ZodObject<Properties<SchemaFieldText>> {
  return z.object({
    __typename: z.literal("SchemaFieldText").optional(),
    defaultValue: z.unknown().nullish(),
    maxLength: z.number().nullish(),
  });
}

export function SchemaFieldTextAreaSchema(): z.ZodObject<Properties<SchemaFieldTextArea>> {
  return z.object({
    __typename: z.literal("SchemaFieldTextArea").optional(),
    defaultValue: z.unknown().nullish(),
    maxLength: z.number().nullish(),
  });
}

export function SchemaFieldTextAreaInputSchema(): z.ZodObject<
  Properties<SchemaFieldTextAreaInput>
> {
  return z.object({
    defaultValue: z.unknown().nullish(),
    maxLength: z.number().nullish(),
  });
}

export function SchemaFieldTextInputSchema(): z.ZodObject<Properties<SchemaFieldTextInput>> {
  return z.object({
    defaultValue: z.unknown().nullish(),
    maxLength: z.number().nullish(),
  });
}

export function SchemaFieldTypePropertySchema() {
  return z.union([
    SchemaFieldAssetSchema(),
    SchemaFieldBoolSchema(),
    SchemaFieldCheckboxSchema(),
    SchemaFieldDateSchema(),
    SchemaFieldGeometryEditorSchema(),
    SchemaFieldGeometryObjectSchema(),
    SchemaFieldGroupSchema(),
    SchemaFieldIntegerSchema(),
    SchemaFieldMarkdownSchema(),
    SchemaFieldNumberSchema(),
    SchemaFieldReferenceSchema(),
    SchemaFieldRichTextSchema(),
    SchemaFieldSelectSchema(),
    SchemaFieldTagSchema(),
    SchemaFieldTextSchema(),
    SchemaFieldTextAreaSchema(),
    SchemaFieldUrlSchema(),
  ]);
}

export function SchemaFieldTypePropertyInputSchema(): z.ZodObject<
  Properties<SchemaFieldTypePropertyInput>
> {
  return z.object({
    asset: z.lazy(() => SchemaFieldAssetInputSchema().nullish()),
    bool: z.lazy(() => SchemaFieldBoolInputSchema().nullish()),
    checkbox: z.lazy(() => SchemaFieldCheckboxInputSchema().nullish()),
    date: z.lazy(() => SchemaFieldDateInputSchema().nullish()),
    geometryEditor: z.lazy(() => SchemaFieldGeometryEditorInputSchema().nullish()),
    geometryObject: z.lazy(() => SchemaFieldGeometryObjectInputSchema().nullish()),
    group: z.lazy(() => SchemaFieldGroupInputSchema().nullish()),
    integer: z.lazy(() => SchemaFieldIntegerInputSchema().nullish()),
    markdownText: z.lazy(() => SchemaMarkdownTextInputSchema().nullish()),
    number: z.lazy(() => SchemaFieldNumberInputSchema().nullish()),
    reference: z.lazy(() => SchemaFieldReferenceInputSchema().nullish()),
    richText: z.lazy(() => SchemaFieldRichTextInputSchema().nullish()),
    select: z.lazy(() => SchemaFieldSelectInputSchema().nullish()),
    tag: z.lazy(() => SchemaFieldTagInputSchema().nullish()),
    text: z.lazy(() => SchemaFieldTextInputSchema().nullish()),
    textArea: z.lazy(() => SchemaFieldTextAreaInputSchema().nullish()),
    url: z.lazy(() => SchemaFieldUrlInputSchema().nullish()),
  });
}

export function SchemaFieldUrlSchema(): z.ZodObject<Properties<SchemaFieldUrl>> {
  return z.object({
    __typename: z.literal("SchemaFieldURL").optional(),
    defaultValue: z.unknown().nullish(),
  });
}

export function SchemaFieldUrlInputSchema(): z.ZodObject<Properties<SchemaFieldUrlInput>> {
  return z.object({
    defaultValue: z.unknown().nullish(),
  });
}

export function SchemaMarkdownTextInputSchema(): z.ZodObject<Properties<SchemaMarkdownTextInput>> {
  return z.object({
    defaultValue: z.unknown().nullish(),
    maxLength: z.number().nullish(),
  });
}

export function SearchAssetsInputSchema(): z.ZodObject<Properties<SearchAssetsInput>> {
  return z.object({
    pagination: z.lazy(() => PaginationSchema().nullish()),
    query: z.lazy(() => AssetQueryInputSchema()),
    sort: z.lazy(() => AssetSortSchema().nullish()),
  });
}

export function SearchItemInputSchema(): z.ZodObject<Properties<SearchItemInput>> {
  return z.object({
    filter: z.lazy(() => ConditionInputSchema().nullish()),
    pagination: z.lazy(() => PaginationSchema().nullish()),
    query: z.lazy(() => ItemQueryInputSchema()),
    sort: z.lazy(() => ItemSortInputSchema().nullish()),
  });
}

export function SortSchema(): z.ZodObject<Properties<Sort>> {
  return z.object({
    key: z.string(),
    reverted: z.boolean().nullish(),
  });
}

export function StringFieldConditionSchema(): z.ZodObject<Properties<StringFieldCondition>> {
  return z.object({
    __typename: z.literal("StringFieldCondition").optional(),
    fieldId: z.lazy(() => FieldSelectorSchema()),
    operator: StringOperatorSchema,
    value: z.string(),
  });
}

export function StringFieldConditionInputSchema(): z.ZodObject<
  Properties<StringFieldConditionInput>
> {
  return z.object({
    fieldId: z.lazy(() => FieldSelectorInputSchema()),
    operator: StringOperatorSchema,
    value: z.string(),
  });
}

export function TerrainResourceSchema(): z.ZodObject<Properties<TerrainResource>> {
  return z.object({
    __typename: z.literal("TerrainResource").optional(),
    id: z.string(),
    props: z.lazy(() => CesiumResourcePropsSchema().nullish()),
    type: TerrainTypeSchema,
  });
}

export function TerrainResourceInputSchema(): z.ZodObject<Properties<TerrainResourceInput>> {
  return z.object({
    id: z.string(),
    props: z.lazy(() => CesiumResourcePropsInputSchema().nullish()),
    type: TerrainTypeSchema,
  });
}

export function ThreadSchema(): z.ZodObject<Properties<Thread>> {
  return z.object({
    __typename: z.literal("Thread").optional(),
    comments: z.array(z.lazy(() => CommentSchema())),
    id: z.string(),
    workspace: z.lazy(() => WorkspaceSchema().nullish()),
    workspaceId: z.string(),
  });
}

export function TileResourceSchema(): z.ZodObject<Properties<TileResource>> {
  return z.object({
    __typename: z.literal("TileResource").optional(),
    id: z.string(),
    props: z.lazy(() => UrlResourcePropsSchema().nullish()),
    type: TileTypeSchema,
  });
}

export function TileResourceInputSchema(): z.ZodObject<Properties<TileResourceInput>> {
  return z.object({
    id: z.string(),
    props: z.lazy(() => UrlResourcePropsInputSchema().nullish()),
    type: TileTypeSchema,
  });
}

export function TimeFieldConditionSchema(): z.ZodObject<Properties<TimeFieldCondition>> {
  return z.object({
    __typename: z.literal("TimeFieldCondition").optional(),
    fieldId: z.lazy(() => FieldSelectorSchema()),
    operator: TimeOperatorSchema,
    value: z.string(),
  });
}

export function TimeFieldConditionInputSchema(): z.ZodObject<Properties<TimeFieldConditionInput>> {
  return z.object({
    fieldId: z.lazy(() => FieldSelectorInputSchema()),
    operator: TimeOperatorSchema,
    value: z.string(),
  });
}

export function UnpublishItemInputSchema(): z.ZodObject<Properties<UnpublishItemInput>> {
  return z.object({
    itemIds: z.array(z.string()),
  });
}

export function UnpublishItemPayloadSchema(): z.ZodObject<Properties<UnpublishItemPayload>> {
  return z.object({
    __typename: z.literal("UnpublishItemPayload").optional(),
    items: z.array(z.lazy(() => ItemSchema())),
  });
}

export function UpdateApiKeyInputSchema(): z.ZodObject<Properties<UpdateApiKeyInput>> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
    name: z.string().nullish(),
    projectId: z.string(),
    publication: z.lazy(() => UpdatePublicationSettingsInputSchema().nullish()),
  });
}

export function UpdateAssetInputSchema(): z.ZodObject<Properties<UpdateAssetInput>> {
  return z.object({
    id: z.string(),
    previewType: PreviewTypeSchema.nullish(),
  });
}

export function UpdateAssetPayloadSchema(): z.ZodObject<Properties<UpdateAssetPayload>> {
  return z.object({
    __typename: z.literal("UpdateAssetPayload").optional(),
    asset: z.lazy(() => AssetSchema()),
  });
}

export function UpdateCommentInputSchema(): z.ZodObject<Properties<UpdateCommentInput>> {
  return z.object({
    commentId: z.string(),
    content: z.string(),
    threadId: z.string(),
  });
}

export function UpdateFieldInputSchema(): z.ZodObject<Properties<UpdateFieldInput>> {
  return z.object({
    description: z.string().nullish(),
    fieldId: z.string(),
    groupId: z.string().nullish(),
    isTitle: z.boolean().nullish(),
    key: z.string().nullish(),
    metadata: z.boolean().nullish(),
    modelId: z.string().nullish(),
    multiple: z.boolean().nullish(),
    order: z.number().nullish(),
    required: z.boolean().nullish(),
    title: z.string().nullish(),
    typeProperty: z.lazy(() => SchemaFieldTypePropertyInputSchema().nullish()),
    unique: z.boolean().nullish(),
  });
}

export function UpdateGroupInputSchema(): z.ZodObject<Properties<UpdateGroupInput>> {
  return z.object({
    description: z.string().nullish(),
    groupId: z.string(),
    key: z.string().nullish(),
    name: z.string().nullish(),
  });
}

export function UpdateGroupsOrderInputSchema(): z.ZodObject<Properties<UpdateGroupsOrderInput>> {
  return z.object({
    groupIds: z.array(z.string()),
  });
}

export function UpdateIntegrationInputSchema(): z.ZodObject<Properties<UpdateIntegrationInput>> {
  return z.object({
    description: z.string().nullish(),
    integrationId: z.string(),
    logoUrl: z.string().nullish(),
    name: z.string().nullish(),
  });
}

export function UpdateIntegrationOfWorkspaceInputSchema(): z.ZodObject<
  Properties<UpdateIntegrationOfWorkspaceInput>
> {
  return z.object({
    integrationId: z.string(),
    role: RoleSchema,
    workspaceId: z.string(),
  });
}

export function UpdateItemInputSchema(): z.ZodObject<Properties<UpdateItemInput>> {
  return z.object({
    fields: z.array(z.lazy(() => ItemFieldInputSchema())),
    itemId: z.string(),
    metadataId: z.string().nullish(),
    originalId: z.string().nullish(),
    version: z.string().nullish(),
  });
}

export function UpdateMeInputSchema(): z.ZodObject<Properties<UpdateMeInput>> {
  return z.object({
    email: z.string().nullish(),
    lang: z.string().nullish(),
    name: z.string().nullish(),
    password: z.string().nullish(),
    passwordConfirmation: z.string().nullish(),
    theme: ThemeSchema.nullish(),
  });
}

export function UpdateMePayloadSchema(): z.ZodObject<Properties<UpdateMePayload>> {
  return z.object({
    __typename: z.literal("UpdateMePayload").optional(),
    me: z.lazy(() => MeSchema()),
  });
}

export function UpdateMemberOfWorkspacePayloadSchema(): z.ZodObject<
  Properties<UpdateMemberOfWorkspacePayload>
> {
  return z.object({
    __typename: z.literal("UpdateMemberOfWorkspacePayload").optional(),
    workspace: z.lazy(() => WorkspaceSchema()),
  });
}

export function UpdateModelInputSchema(): z.ZodObject<Properties<UpdateModelInput>> {
  return z.object({
    description: z.string().nullish(),
    key: z.string().nullish(),
    modelId: z.string(),
    name: z.string().nullish(),
  });
}

export function UpdateModelsOrderInputSchema(): z.ZodObject<Properties<UpdateModelsOrderInput>> {
  return z.object({
    modelIds: z.array(z.string()),
  });
}

export function UpdateProjectAccessibilityInputSchema(): z.ZodObject<
  Properties<UpdateProjectAccessibilityInput>
> {
  return z.object({
    publication: z.lazy(() => UpdatePublicationSettingsInputSchema().nullish()),
    visibility: ProjectVisibilitySchema.nullish(),
  });
}

export function UpdateProjectInputSchema(): z.ZodObject<Properties<UpdateProjectInput>> {
  return z.object({
    accessibility: z.lazy(() => UpdateProjectAccessibilityInputSchema().nullish()),
    alias: z.string().nullish(),
    description: z.string().nullish(),
    license: z.string().nullish(),
    name: z.string().nullish(),
    projectId: z.string(),
    readme: z.string().nullish(),
    requestRoles: z.array(RoleSchema).nullish(),
  });
}

export function UpdatePublicationSettingsInputSchema(): z.ZodObject<
  Properties<UpdatePublicationSettingsInput>
> {
  return z.object({
    publicAssets: z.boolean(),
    publicModels: z.array(z.string()),
  });
}

export function UpdateRequestInputSchema(): z.ZodObject<Properties<UpdateRequestInput>> {
  return z.object({
    description: z.string().nullish(),
    items: z.array(z.lazy(() => RequestItemInputSchema())).nullish(),
    requestId: z.string(),
    reviewersId: z.array(z.string()).nullish(),
    state: RequestStateSchema.nullish(),
    title: z.string().nullish(),
  });
}

export function UpdateUserOfWorkspaceInputSchema(): z.ZodObject<
  Properties<UpdateUserOfWorkspaceInput>
> {
  return z.object({
    role: RoleSchema,
    userId: z.string(),
    workspaceId: z.string(),
  });
}

export function UpdateViewInputSchema(): z.ZodObject<Properties<UpdateViewInput>> {
  return z.object({
    columns: z.array(z.lazy(() => ColumnSelectionInputSchema())).nullish(),
    filter: z.lazy(() => ConditionInputSchema().nullish()),
    name: z.string().nullish(),
    sort: z.lazy(() => ItemSortInputSchema().nullish()),
    viewId: z.string(),
  });
}

export function UpdateViewsOrderInputSchema(): z.ZodObject<Properties<UpdateViewsOrderInput>> {
  return z.object({
    viewIds: z.array(z.string()),
  });
}

export function UpdateWebhookInputSchema(): z.ZodObject<Properties<UpdateWebhookInput>> {
  return z.object({
    active: z.boolean().nullish(),
    integrationId: z.string(),
    name: z.string().nullish(),
    secret: z.string().nullish(),
    trigger: z.lazy(() => WebhookTriggerInputSchema().nullish()),
    url: z.string().nullish(),
    webhookId: z.string(),
  });
}

export function UpdateWorkspaceInputSchema(): z.ZodObject<Properties<UpdateWorkspaceInput>> {
  return z.object({
    name: z.string(),
    workspaceId: z.string(),
  });
}

export function UpdateWorkspacePayloadSchema(): z.ZodObject<Properties<UpdateWorkspacePayload>> {
  return z.object({
    __typename: z.literal("UpdateWorkspacePayload").optional(),
    workspace: z.lazy(() => WorkspaceSchema()),
  });
}

export function UpdateWorkspaceSettingsInputSchema(): z.ZodObject<
  Properties<UpdateWorkspaceSettingsInput>
> {
  return z.object({
    id: z.string(),
    terrains: z.lazy(() => ResourcesListInputSchema().nullish()),
    tiles: z.lazy(() => ResourcesListInputSchema().nullish()),
  });
}

export function UpdateWorkspaceSettingsPayloadSchema(): z.ZodObject<
  Properties<UpdateWorkspaceSettingsPayload>
> {
  return z.object({
    __typename: z.literal("UpdateWorkspaceSettingsPayload").optional(),
    workspaceSettings: z.lazy(() => WorkspaceSettingsSchema()),
  });
}

export function UrlResourcePropsSchema(): z.ZodObject<Properties<UrlResourceProps>> {
  return z.object({
    __typename: z.literal("UrlResourceProps").optional(),
    image: z.string(),
    name: z.string(),
    url: z.string(),
  });
}

export function UrlResourcePropsInputSchema(): z.ZodObject<Properties<UrlResourcePropsInput>> {
  return z.object({
    image: z.string(),
    name: z.string(),
    url: z.string(),
  });
}

export function UserSchema(): z.ZodObject<Properties<User>> {
  return z.object({
    __typename: z.literal("User").optional(),
    email: z.string(),
    host: z.string().nullish(),
    id: z.string(),
    name: z.string(),
  });
}

export function VersionedItemSchema(): z.ZodObject<Properties<VersionedItem>> {
  return z.object({
    __typename: z.literal("VersionedItem").optional(),
    parents: z.array(z.string()).nullish(),
    refs: z.array(z.string()),
    value: z.lazy(() => ItemSchema()),
    version: z.string(),
  });
}

export function ViewSchema(): z.ZodObject<Properties<View>> {
  return z.object({
    __typename: z.literal("View").optional(),
    columns: z.array(z.lazy(() => ColumnSchema())).nullish(),
    filter: z.lazy(() => ConditionSchema().nullish()),
    id: z.string(),
    modelId: z.string(),
    name: z.string(),
    order: z.number(),
    projectId: z.string(),
    sort: z.lazy(() => ItemSortSchema().nullish()),
  });
}

export function ViewPayloadSchema(): z.ZodObject<Properties<ViewPayload>> {
  return z.object({
    __typename: z.literal("ViewPayload").optional(),
    view: z.lazy(() => ViewSchema()),
  });
}

export function ViewsPayloadSchema(): z.ZodObject<Properties<ViewsPayload>> {
  return z.object({
    __typename: z.literal("ViewsPayload").optional(),
    views: z.array(z.lazy(() => ViewSchema())),
  });
}

export function WebhookSchema(): z.ZodObject<Properties<Webhook>> {
  return z.object({
    __typename: z.literal("Webhook").optional(),
    active: z.boolean(),
    createdAt: z.string(),
    id: z.string(),
    name: z.string(),
    secret: z.string(),
    trigger: z.lazy(() => WebhookTriggerSchema()),
    updatedAt: z.string(),
    url: z.string(),
  });
}

export function WebhookPayloadSchema(): z.ZodObject<Properties<WebhookPayload>> {
  return z.object({
    __typename: z.literal("WebhookPayload").optional(),
    webhook: z.lazy(() => WebhookSchema()),
  });
}

export function WebhookTriggerSchema(): z.ZodObject<Properties<WebhookTrigger>> {
  return z.object({
    __typename: z.literal("WebhookTrigger").optional(),
    onAssetDecompress: z.boolean().nullish(),
    onAssetDelete: z.boolean().nullish(),
    onAssetUpload: z.boolean().nullish(),
    onItemCreate: z.boolean().nullish(),
    onItemDelete: z.boolean().nullish(),
    onItemPublish: z.boolean().nullish(),
    onItemUnPublish: z.boolean().nullish(),
    onItemUpdate: z.boolean().nullish(),
  });
}

export function WebhookTriggerInputSchema(): z.ZodObject<Properties<WebhookTriggerInput>> {
  return z.object({
    onAssetDecompress: z.boolean().nullish(),
    onAssetDelete: z.boolean().nullish(),
    onAssetUpload: z.boolean().nullish(),
    onItemCreate: z.boolean().nullish(),
    onItemDelete: z.boolean().nullish(),
    onItemPublish: z.boolean().nullish(),
    onItemUnPublish: z.boolean().nullish(),
    onItemUpdate: z.boolean().nullish(),
  });
}

export function WorkspaceSchema(): z.ZodObject<Properties<Workspace>> {
  return z.object({
    __typename: z.literal("Workspace").optional(),
    alias: z.string().nullish(),
    id: z.string(),
    members: z.array(z.lazy(() => WorkspaceMemberSchema())),
    name: z.string(),
    personal: z.boolean(),
  });
}

export function WorkspaceIntegrationMemberSchema(): z.ZodObject<
  Properties<WorkspaceIntegrationMember>
> {
  return z.object({
    __typename: z.literal("WorkspaceIntegrationMember").optional(),
    active: z.boolean(),
    integration: z.lazy(() => IntegrationSchema().nullish()),
    integrationId: z.string(),
    invitedBy: z.lazy(() => UserSchema().nullish()),
    invitedById: z.string(),
    role: RoleSchema,
  });
}

export function WorkspaceMemberSchema() {
  return z.union([WorkspaceIntegrationMemberSchema(), WorkspaceUserMemberSchema()]);
}

export function WorkspaceProjectLimitsSchema(): z.ZodObject<Properties<WorkspaceProjectLimits>> {
  return z.object({
    __typename: z.literal("WorkspaceProjectLimits").optional(),
    privateProjectsAllowed: z.boolean(),
    publicProjectsAllowed: z.boolean(),
  });
}

export function WorkspaceSettingsSchema(): z.ZodObject<Properties<WorkspaceSettings>> {
  return z.object({
    __typename: z.literal("WorkspaceSettings").optional(),
    id: z.string(),
    terrains: z.lazy(() => ResourceListSchema().nullish()),
    tiles: z.lazy(() => ResourceListSchema().nullish()),
  });
}

export function WorkspaceUserMemberSchema(): z.ZodObject<Properties<WorkspaceUserMember>> {
  return z.object({
    __typename: z.literal("WorkspaceUserMember").optional(),
    host: z.string().nullish(),
    role: RoleSchema,
    user: z.lazy(() => UserSchema().nullish()),
    userId: z.string(),
  });
}

export function GetAssetsQuerySchema() {
  return z.object({
    assets: z.object({
      nodes: z.array(
        z
          .object({
            id: z.string(),
            fileName: z.string(),
            projectId: z.string(),
            createdAt: z.string(),
            createdBy: z.union([
              z.object({
                id: z.string(),
                name: z.string(),
                description: z.string().nullable(),
                logoUrl: z.string(),
                iType: IntegrationTypeSchema,
                developerId: z.string(),
                developer: z.object({
                  id: z.string(),
                  name: z.string(),
                  email: z.string(),
                }),
                config: z
                  .object({
                    token: z.string(),
                    webhooks: z.array(
                      z.object({
                        id: z.string(),
                        name: z.string(),
                        url: z.string(),
                        active: z.boolean(),
                        secret: z.string(),
                        trigger: z.object({
                          onItemCreate: z.boolean().nullable(),
                          onItemUpdate: z.boolean().nullable(),
                          onItemDelete: z.boolean().nullable(),
                          onItemPublish: z.boolean().nullable(),
                          onItemUnPublish: z.boolean().nullable(),
                          onAssetUpload: z.boolean().nullable(),
                          onAssetDecompress: z.boolean().nullable(),
                          onAssetDelete: z.boolean().nullable(),
                        }),
                        createdAt: z.string(),
                        updatedAt: z.string(),
                      }),
                    ),
                  })
                  .nullable(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
              z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
              }),
            ]),
            size: z.number(),
            previewType: PreviewTypeSchema.nullable(),
            uuid: z.string(),
            url: z.string(),
            thread: z
              .object({
                id: z.string(),
                workspaceId: z.string(),
                comments: z.array(
                  z.object({
                    id: z.string(),
                    author: z
                      .union([
                        z.object({
                          id: z.string(),
                          name: z.string(),
                        }),
                        z.object({
                          id: z.string(),
                          name: z.string(),
                          email: z.string(),
                        }),
                      ])
                      .nullable(),
                    authorId: z.string(),
                    content: z.string(),
                    createdAt: z.string(),
                  }),
                ),
              })
              .nullable(),
            archiveExtractionStatus: ArchiveExtractionStatusSchema.nullable(),
            public: z.boolean(),
          })
          .nullable(),
      ),
      pageInfo: z.object({
        startCursor: z.string().nullable(),
        endCursor: z.string().nullable(),
        hasNextPage: z.boolean(),
        hasPreviousPage: z.boolean(),
      }),
      totalCount: z.number(),
    }),
  });
}

export function GetAssetsItemsQuerySchema() {
  return z.object({
    assets: z.object({
      nodes: z.array(
        z
          .object({
            id: z.string(),
            fileName: z.string(),
            projectId: z.string(),
            createdAt: z.string(),
            createdBy: z.union([
              z.object({
                id: z.string(),
                name: z.string(),
                description: z.string().nullable(),
                logoUrl: z.string(),
                iType: IntegrationTypeSchema,
                developerId: z.string(),
                developer: z.object({
                  id: z.string(),
                  name: z.string(),
                  email: z.string(),
                }),
                config: z
                  .object({
                    token: z.string(),
                    webhooks: z.array(
                      z.object({
                        id: z.string(),
                        name: z.string(),
                        url: z.string(),
                        active: z.boolean(),
                        secret: z.string(),
                        trigger: z.object({
                          onItemCreate: z.boolean().nullable(),
                          onItemUpdate: z.boolean().nullable(),
                          onItemDelete: z.boolean().nullable(),
                          onItemPublish: z.boolean().nullable(),
                          onItemUnPublish: z.boolean().nullable(),
                          onAssetUpload: z.boolean().nullable(),
                          onAssetDecompress: z.boolean().nullable(),
                          onAssetDelete: z.boolean().nullable(),
                        }),
                        createdAt: z.string(),
                        updatedAt: z.string(),
                      }),
                    ),
                  })
                  .nullable(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
              z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
              }),
            ]),
            size: z.number(),
            previewType: PreviewTypeSchema.nullable(),
            uuid: z.string(),
            url: z.string(),
            thread: z
              .object({
                id: z.string(),
                workspaceId: z.string(),
                comments: z.array(
                  z.object({
                    id: z.string(),
                    author: z
                      .union([
                        z.object({
                          id: z.string(),
                          name: z.string(),
                        }),
                        z.object({
                          id: z.string(),
                          name: z.string(),
                          email: z.string(),
                        }),
                      ])
                      .nullable(),
                    authorId: z.string(),
                    content: z.string(),
                    createdAt: z.string(),
                  }),
                ),
              })
              .nullable(),
            archiveExtractionStatus: ArchiveExtractionStatusSchema.nullable(),
            public: z.boolean(),
            items: z
              .array(
                z.object({
                  itemId: z.string(),
                  modelId: z.string(),
                }),
              )
              .nullable(),
          })
          .nullable(),
      ),
      pageInfo: z.object({
        startCursor: z.string().nullable(),
        endCursor: z.string().nullable(),
        hasNextPage: z.boolean(),
        hasPreviousPage: z.boolean(),
      }),
      totalCount: z.number(),
    }),
  });
}

export function GetAssetQuerySchema() {
  return z.object({
    node: z
      .union([
        z.object({
          id: z.string(),
          fileName: z.string(),
          projectId: z.string(),
          createdAt: z.string(),
          createdBy: z.union([
            z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              logoUrl: z.string(),
              iType: IntegrationTypeSchema,
              developerId: z.string(),
              developer: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
              }),
              config: z
                .object({
                  token: z.string(),
                  webhooks: z.array(
                    z.object({
                      id: z.string(),
                      name: z.string(),
                      url: z.string(),
                      active: z.boolean(),
                      secret: z.string(),
                      trigger: z.object({
                        onItemCreate: z.boolean().nullable(),
                        onItemUpdate: z.boolean().nullable(),
                        onItemDelete: z.boolean().nullable(),
                        onItemPublish: z.boolean().nullable(),
                        onItemUnPublish: z.boolean().nullable(),
                        onAssetUpload: z.boolean().nullable(),
                        onAssetDecompress: z.boolean().nullable(),
                        onAssetDelete: z.boolean().nullable(),
                      }),
                      createdAt: z.string(),
                      updatedAt: z.string(),
                    }),
                  ),
                })
                .nullable(),
              createdAt: z.string(),
              updatedAt: z.string(),
            }),
            z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            }),
          ]),
          size: z.number(),
          previewType: PreviewTypeSchema.nullable(),
          uuid: z.string(),
          url: z.string(),
          thread: z
            .object({
              id: z.string(),
              workspaceId: z.string(),
              comments: z.array(
                z.object({
                  id: z.string(),
                  author: z
                    .union([
                      z.object({
                        id: z.string(),
                        name: z.string(),
                      }),
                      z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                      }),
                    ])
                    .nullable(),
                  authorId: z.string(),
                  content: z.string(),
                  createdAt: z.string(),
                }),
              ),
            })
            .nullable(),
          archiveExtractionStatus: ArchiveExtractionStatusSchema.nullable(),
          public: z.boolean(),
        }),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
      ])
      .nullable(),
  });
}

export function GetAssetFileQuerySchema() {
  return z.object({
    assetFile: z.object({
      name: z.string(),
      path: z.string(),
      filePaths: z.array(z.string()).nullable(),
    }),
  });
}

export function GetAssetItemQuerySchema() {
  return z.object({
    node: z
      .union([
        z.object({
          id: z.string(),
          fileName: z.string(),
          projectId: z.string(),
          createdAt: z.string(),
          createdBy: z.union([
            z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              logoUrl: z.string(),
              iType: IntegrationTypeSchema,
              developerId: z.string(),
              developer: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
              }),
              config: z
                .object({
                  token: z.string(),
                  webhooks: z.array(
                    z.object({
                      id: z.string(),
                      name: z.string(),
                      url: z.string(),
                      active: z.boolean(),
                      secret: z.string(),
                      trigger: z.object({
                        onItemCreate: z.boolean().nullable(),
                        onItemUpdate: z.boolean().nullable(),
                        onItemDelete: z.boolean().nullable(),
                        onItemPublish: z.boolean().nullable(),
                        onItemUnPublish: z.boolean().nullable(),
                        onAssetUpload: z.boolean().nullable(),
                        onAssetDecompress: z.boolean().nullable(),
                        onAssetDelete: z.boolean().nullable(),
                      }),
                      createdAt: z.string(),
                      updatedAt: z.string(),
                    }),
                  ),
                })
                .nullable(),
              createdAt: z.string(),
              updatedAt: z.string(),
            }),
            z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            }),
          ]),
          size: z.number(),
          previewType: PreviewTypeSchema.nullable(),
          uuid: z.string(),
          url: z.string(),
          thread: z
            .object({
              id: z.string(),
              workspaceId: z.string(),
              comments: z.array(
                z.object({
                  id: z.string(),
                  author: z
                    .union([
                      z.object({
                        id: z.string(),
                        name: z.string(),
                      }),
                      z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                      }),
                    ])
                    .nullable(),
                  authorId: z.string(),
                  content: z.string(),
                  createdAt: z.string(),
                }),
              ),
            })
            .nullable(),
          archiveExtractionStatus: ArchiveExtractionStatusSchema.nullable(),
          public: z.boolean(),
          items: z
            .array(
              z.object({
                itemId: z.string(),
                modelId: z.string(),
              }),
            )
            .nullable(),
        }),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
      ])
      .nullable(),
  });
}

export function GuessSchemaFieldsQuerySchema() {
  return z.object({
    guessSchemaFields: z.object({
      total_count: z.number(),
      fields: z.array(
        z.object({
          name: z.string(),
          type: z.string(),
        }),
      ),
    }),
  });
}

export function CreateAssetMutationSchema() {
  return z.object({
    createAsset: z
      .object({
        asset: z.object({
          id: z.string(),
          fileName: z.string(),
          projectId: z.string(),
          createdAt: z.string(),
          createdBy: z.union([
            z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              logoUrl: z.string(),
              iType: IntegrationTypeSchema,
              developerId: z.string(),
              developer: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
              }),
              config: z
                .object({
                  token: z.string(),
                  webhooks: z.array(
                    z.object({
                      id: z.string(),
                      name: z.string(),
                      url: z.string(),
                      active: z.boolean(),
                      secret: z.string(),
                      trigger: z.object({
                        onItemCreate: z.boolean().nullable(),
                        onItemUpdate: z.boolean().nullable(),
                        onItemDelete: z.boolean().nullable(),
                        onItemPublish: z.boolean().nullable(),
                        onItemUnPublish: z.boolean().nullable(),
                        onAssetUpload: z.boolean().nullable(),
                        onAssetDecompress: z.boolean().nullable(),
                        onAssetDelete: z.boolean().nullable(),
                      }),
                      createdAt: z.string(),
                      updatedAt: z.string(),
                    }),
                  ),
                })
                .nullable(),
              createdAt: z.string(),
              updatedAt: z.string(),
            }),
            z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            }),
          ]),
          size: z.number(),
          previewType: PreviewTypeSchema.nullable(),
          uuid: z.string(),
          url: z.string(),
          thread: z
            .object({
              id: z.string(),
              workspaceId: z.string(),
              comments: z.array(
                z.object({
                  id: z.string(),
                  author: z
                    .union([
                      z.object({
                        id: z.string(),
                        name: z.string(),
                      }),
                      z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                      }),
                    ])
                    .nullable(),
                  authorId: z.string(),
                  content: z.string(),
                  createdAt: z.string(),
                }),
              ),
            })
            .nullable(),
          archiveExtractionStatus: ArchiveExtractionStatusSchema.nullable(),
          public: z.boolean(),
        }),
      })
      .nullable(),
  });
}

export function UpdateAssetMutationSchema() {
  return z.object({
    updateAsset: z
      .object({
        asset: z.object({
          id: z.string(),
          fileName: z.string(),
          projectId: z.string(),
          createdAt: z.string(),
          createdBy: z.union([
            z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              logoUrl: z.string(),
              iType: IntegrationTypeSchema,
              developerId: z.string(),
              developer: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
              }),
              config: z
                .object({
                  token: z.string(),
                  webhooks: z.array(
                    z.object({
                      id: z.string(),
                      name: z.string(),
                      url: z.string(),
                      active: z.boolean(),
                      secret: z.string(),
                      trigger: z.object({
                        onItemCreate: z.boolean().nullable(),
                        onItemUpdate: z.boolean().nullable(),
                        onItemDelete: z.boolean().nullable(),
                        onItemPublish: z.boolean().nullable(),
                        onItemUnPublish: z.boolean().nullable(),
                        onAssetUpload: z.boolean().nullable(),
                        onAssetDecompress: z.boolean().nullable(),
                        onAssetDelete: z.boolean().nullable(),
                      }),
                      createdAt: z.string(),
                      updatedAt: z.string(),
                    }),
                  ),
                })
                .nullable(),
              createdAt: z.string(),
              updatedAt: z.string(),
            }),
            z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            }),
          ]),
          size: z.number(),
          previewType: PreviewTypeSchema.nullable(),
          uuid: z.string(),
          url: z.string(),
          thread: z
            .object({
              id: z.string(),
              workspaceId: z.string(),
              comments: z.array(
                z.object({
                  id: z.string(),
                  author: z
                    .union([
                      z.object({
                        id: z.string(),
                        name: z.string(),
                      }),
                      z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                      }),
                    ])
                    .nullable(),
                  authorId: z.string(),
                  content: z.string(),
                  createdAt: z.string(),
                }),
              ),
            })
            .nullable(),
          archiveExtractionStatus: ArchiveExtractionStatusSchema.nullable(),
          public: z.boolean(),
        }),
      })
      .nullable(),
  });
}

export function DeleteAssetMutationSchema() {
  return z.object({
    deleteAsset: z
      .object({
        assetId: z.string(),
      })
      .nullable(),
  });
}

export function DeleteAssetsMutationSchema() {
  return z.object({
    deleteAssets: z
      .object({
        assetIds: z.array(z.string()).nullable(),
      })
      .nullable(),
  });
}

export function DecompressAssetMutationSchema() {
  return z.object({
    decompressAsset: z
      .object({
        asset: z.object({
          id: z.string(),
          fileName: z.string(),
          projectId: z.string(),
          createdAt: z.string(),
          createdBy: z.union([
            z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              logoUrl: z.string(),
              iType: IntegrationTypeSchema,
              developerId: z.string(),
              developer: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
              }),
              config: z
                .object({
                  token: z.string(),
                  webhooks: z.array(
                    z.object({
                      id: z.string(),
                      name: z.string(),
                      url: z.string(),
                      active: z.boolean(),
                      secret: z.string(),
                      trigger: z.object({
                        onItemCreate: z.boolean().nullable(),
                        onItemUpdate: z.boolean().nullable(),
                        onItemDelete: z.boolean().nullable(),
                        onItemPublish: z.boolean().nullable(),
                        onItemUnPublish: z.boolean().nullable(),
                        onAssetUpload: z.boolean().nullable(),
                        onAssetDecompress: z.boolean().nullable(),
                        onAssetDelete: z.boolean().nullable(),
                      }),
                      createdAt: z.string(),
                      updatedAt: z.string(),
                    }),
                  ),
                })
                .nullable(),
              createdAt: z.string(),
              updatedAt: z.string(),
            }),
            z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            }),
          ]),
          size: z.number(),
          previewType: PreviewTypeSchema.nullable(),
          uuid: z.string(),
          url: z.string(),
          thread: z
            .object({
              id: z.string(),
              workspaceId: z.string(),
              comments: z.array(
                z.object({
                  id: z.string(),
                  author: z
                    .union([
                      z.object({
                        id: z.string(),
                        name: z.string(),
                      }),
                      z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                      }),
                    ])
                    .nullable(),
                  authorId: z.string(),
                  content: z.string(),
                  createdAt: z.string(),
                }),
              ),
            })
            .nullable(),
          archiveExtractionStatus: ArchiveExtractionStatusSchema.nullable(),
          public: z.boolean(),
        }),
      })
      .nullable(),
  });
}

export function CreateAssetUploadMutationSchema() {
  return z.object({
    createAssetUpload: z
      .object({
        url: z.string(),
        token: z.string(),
        contentType: z.string().nullable(),
        contentLength: z.number(),
        contentEncoding: z.string().nullable(),
        next: z.string().nullable(),
      })
      .nullable(),
  });
}

export function AddCommentMutationSchema() {
  return z.object({
    addComment: z
      .object({
        comment: z.object({
          id: z.string(),
          author: z
            .union([
              z.object({
                id: z.string(),
                name: z.string(),
              }),
              z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
              }),
            ])
            .nullable(),
          authorType: OperatorTypeSchema,
          authorId: z.string(),
          content: z.string(),
          createdAt: z.string(),
        }),
      })
      .nullable(),
  });
}

export function UpdateCommentMutationSchema() {
  return z.object({
    updateComment: z
      .object({
        comment: z.object({
          id: z.string(),
          author: z
            .union([
              z.object({
                id: z.string(),
                name: z.string(),
              }),
              z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
              }),
            ])
            .nullable(),
          authorType: OperatorTypeSchema,
          authorId: z.string(),
          content: z.string(),
          createdAt: z.string(),
        }),
      })
      .nullable(),
  });
}

export function DeleteCommentMutationSchema() {
  return z.object({
    deleteComment: z
      .object({
        commentId: z.string(),
      })
      .nullable(),
  });
}

export function CreateFieldMutationSchema() {
  return z.object({
    createField: z
      .object({
        field: z.object({
          id: z.string(),
        }),
      })
      .nullable(),
  });
}

export function CreateFieldsMutationSchema() {
  return z.object({
    createFields: z
      .object({
        fields: z.array(
          z.object({
            id: z.string(),
          }),
        ),
      })
      .nullable(),
  });
}

export function UpdateFieldMutationSchema() {
  return z.object({
    updateField: z
      .object({
        field: z.object({
          id: z.string(),
        }),
      })
      .nullable(),
  });
}

export function UpdateFieldsMutationSchema() {
  return z.object({
    updateFields: z
      .object({
        fields: z.array(
          z.object({
            id: z.string(),
          }),
        ),
      })
      .nullable(),
  });
}

export function DeleteFieldMutationSchema() {
  return z.object({
    deleteField: z
      .object({
        fieldId: z.string(),
      })
      .nullable(),
  });
}

export function GetGroupsQuerySchema() {
  return z.object({
    groups: z.array(
      z
        .object({
          id: z.string(),
          name: z.string(),
          key: z.string(),
          order: z.number(),
        })
        .nullable(),
    ),
  });
}

export function GetGroupQuerySchema() {
  return z.object({
    node: z
      .union([
        z.object({}),
        z.object({
          id: z.string(),
          schemaId: z.string(),
          projectId: z.string(),
          name: z.string(),
          description: z.string(),
          key: z.string(),
          schema: z.object({
            id: z.string(),
            fields: z.array(
              z.object({
                id: z.string(),
                type: SchemaFieldTypeSchema,
                title: z.string(),
                key: z.string(),
                description: z.string().nullable(),
                required: z.boolean(),
                unique: z.boolean(),
                isTitle: z.boolean(),
                multiple: z.boolean(),
                typeProperty: z
                  .union([
                    z.object({
                      assetDefaultValue: z.unknown().nullable(),
                    }),
                    z.object({
                      defaultValue: z.unknown().nullable(),
                    }),
                    z.object({}),
                    z.object({
                      defaultValue: z.unknown().nullable(),
                    }),
                    z.object({
                      defaultValue: z.unknown().nullable(),
                      editorSupportedTypes: z.array(GeometryEditorSupportedTypeSchema),
                    }),
                    z.object({
                      defaultValue: z.unknown().nullable(),
                      objectSupportedTypes: z.array(GeometryObjectSupportedTypeSchema),
                    }),
                    z.object({}),
                    z.object({
                      integerDefaultValue: z.unknown().nullable(),
                      min: z.number().nullable(),
                      max: z.number().nullable(),
                    }),
                    z.object({
                      defaultValue: z.unknown().nullable(),
                      maxLength: z.number().nullable(),
                    }),
                    z.object({}),
                    z.object({}),
                    z.object({}),
                    z.object({
                      selectDefaultValue: z.unknown().nullable(),
                      values: z.array(z.string()),
                    }),
                    z.object({}),
                    z.object({
                      defaultValue: z.unknown().nullable(),
                      maxLength: z.number().nullable(),
                    }),
                    z.object({
                      defaultValue: z.unknown().nullable(),
                      maxLength: z.number().nullable(),
                    }),
                    z.object({
                      defaultValue: z.unknown().nullable(),
                    }),
                  ])
                  .nullable(),
              }),
            ),
          }),
        }),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
      ])
      .nullable(),
  });
}

export function CreateGroupMutationSchema() {
  return z.object({
    createGroup: z
      .object({
        group: z.object({
          id: z.string(),
        }),
      })
      .nullable(),
  });
}

export function UpdateGroupMutationSchema() {
  return z.object({
    updateGroup: z
      .object({
        group: z.object({
          id: z.string(),
        }),
      })
      .nullable(),
  });
}

export function DeleteGroupMutationSchema() {
  return z.object({
    deleteGroup: z
      .object({
        groupId: z.string(),
      })
      .nullable(),
  });
}

export function CheckGroupKeyAvailabilityQuerySchema() {
  return z.object({
    checkGroupKeyAvailability: z.object({
      key: z.string(),
      available: z.boolean(),
    }),
  });
}

export function ModelsByGroupQuerySchema() {
  return z.object({
    modelsByGroup: z.array(
      z
        .object({
          name: z.string(),
        })
        .nullable(),
    ),
  });
}

export function UpdateGroupsOrderMutationSchema() {
  return z.object({
    updateGroupsOrder: z
      .object({
        groups: z.array(
          z.object({
            id: z.string(),
          }),
        ),
      })
      .nullable(),
  });
}

export function CreateIntegrationMutationSchema() {
  return z.object({
    createIntegration: z
      .object({
        integration: z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().nullable(),
          logoUrl: z.string(),
          iType: IntegrationTypeSchema,
        }),
      })
      .nullable(),
  });
}

export function UpdateIntegrationMutationSchema() {
  return z.object({
    updateIntegration: z
      .object({
        integration: z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().nullable(),
          logoUrl: z.string(),
          iType: IntegrationTypeSchema,
        }),
      })
      .nullable(),
  });
}

export function DeleteIntegrationMutationSchema() {
  return z.object({
    deleteIntegration: z
      .object({
        integrationId: z.string(),
      })
      .nullable(),
  });
}

export function RegenerateIntegrationTokenMutationSchema() {
  return z.object({
    regenerateIntegrationToken: z
      .object({
        integration: z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().nullable(),
          logoUrl: z.string(),
          iType: IntegrationTypeSchema,
        }),
      })
      .nullable(),
  });
}

export function GetItemsQuerySchema() {
  return z.object({
    searchItem: z.object({
      nodes: z.array(
        z
          .object({
            id: z.string(),
            title: z.string().nullable(),
            schemaId: z.string(),
            createdAt: z.string(),
            updatedAt: z.string(),
            status: ItemStatusSchema,
            version: z.string(),
            referencedItems: z
              .array(
                z.object({
                  id: z.string(),
                  title: z.string().nullable(),
                  schemaId: z.string(),
                  createdBy: z
                    .union([
                      z.object({
                        name: z.string(),
                      }),
                      z.object({
                        name: z.string(),
                      }),
                    ])
                    .nullable(),
                  status: ItemStatusSchema,
                  version: z.string(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              )
              .nullable(),
            createdBy: z
              .union([
                z.object({
                  name: z.string(),
                }),
                z.object({
                  name: z.string(),
                }),
              ])
              .nullable(),
            fields: z.array(
              z.object({
                schemaFieldId: z.string(),
                itemGroupId: z.string().nullable(),
                type: SchemaFieldTypeSchema,
                value: z.unknown().nullable(),
              }),
            ),
            thread: z
              .object({
                id: z.string(),
                workspaceId: z.string(),
                comments: z.array(
                  z.object({
                    id: z.string(),
                    author: z
                      .union([
                        z.object({
                          id: z.string(),
                          name: z.string(),
                        }),
                        z.object({
                          id: z.string(),
                          name: z.string(),
                          email: z.string(),
                        }),
                      ])
                      .nullable(),
                    authorId: z.string(),
                    content: z.string(),
                    createdAt: z.string(),
                  }),
                ),
              })
              .nullable(),
            metadata: z
              .object({
                id: z.string(),
                version: z.string(),
                fields: z.array(
                  z.object({
                    schemaFieldId: z.string(),
                    itemGroupId: z.string().nullable(),
                    type: SchemaFieldTypeSchema,
                    value: z.unknown().nullable(),
                  }),
                ),
              })
              .nullable(),
          })
          .nullable(),
      ),
      totalCount: z.number(),
    }),
  });
}

export function GetItemQuerySchema() {
  return z.object({
    node: z
      .union([
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({
          id: z.string(),
          title: z.string().nullable(),
          schemaId: z.string(),
          createdAt: z.string(),
          updatedAt: z.string(),
          status: ItemStatusSchema,
          referencedItems: z
            .array(
              z.object({
                id: z.string(),
                title: z.string().nullable(),
                schemaId: z.string(),
                createdBy: z
                  .union([
                    z.object({
                      name: z.string(),
                    }),
                    z.object({
                      name: z.string(),
                    }),
                  ])
                  .nullable(),
                status: ItemStatusSchema,
                version: z.string(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            )
            .nullable(),
          version: z.string(),
          assets: z.array(
            z
              .object({
                id: z.string(),
                url: z.string(),
                fileName: z.string(),
              })
              .nullable(),
          ),
          createdBy: z
            .union([
              z.object({
                id: z.string(),
                name: z.string(),
              }),
              z.object({
                id: z.string(),
                name: z.string(),
              }),
            ])
            .nullable(),
          updatedBy: z
            .union([
              z.object({
                name: z.string(),
              }),
              z.object({
                name: z.string(),
              }),
            ])
            .nullable(),
          fields: z.array(
            z.object({
              schemaFieldId: z.string(),
              itemGroupId: z.string().nullable(),
              type: SchemaFieldTypeSchema,
              value: z.unknown().nullable(),
            }),
          ),
          metadata: z
            .object({
              id: z.string(),
              version: z.string(),
              fields: z.array(
                z.object({
                  schemaFieldId: z.string(),
                  type: SchemaFieldTypeSchema,
                  value: z.unknown().nullable(),
                }),
              ),
            })
            .nullable(),
          thread: z
            .object({
              id: z.string(),
              workspaceId: z.string(),
              comments: z.array(
                z.object({
                  id: z.string(),
                  author: z
                    .union([
                      z.object({
                        id: z.string(),
                        name: z.string(),
                      }),
                      z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                      }),
                    ])
                    .nullable(),
                  authorId: z.string(),
                  content: z.string(),
                  createdAt: z.string(),
                }),
              ),
            })
            .nullable(),
          requests: z
            .array(
              z.object({
                id: z.string(),
                state: RequestStateSchema,
                title: z.string(),
              }),
            )
            .nullable(),
        }),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
      ])
      .nullable(),
  });
}

export function IsItemReferencedQuerySchema() {
  return z.object({
    isItemReferenced: z.boolean(),
  });
}

export function VersionsByItemQuerySchema() {
  return z.object({
    versionsByItem: z.array(
      z.object({
        version: z.string(),
        refs: z.array(z.string()),
        value: z.object({
          id: z.string(),
          version: z.string(),
          modelId: z.string(),
          status: ItemStatusSchema,
          createdAt: z.string(),
          updatedAt: z.string(),
          createdBy: z
            .union([
              z.object({
                name: z.string(),
              }),
              z.object({
                name: z.string(),
              }),
            ])
            .nullable(),
          updatedBy: z
            .union([
              z.object({
                name: z.string(),
              }),
              z.object({
                name: z.string(),
              }),
            ])
            .nullable(),
          fields: z.array(
            z.object({
              schemaFieldId: z.string(),
              itemGroupId: z.string().nullable(),
              type: SchemaFieldTypeSchema,
              value: z.unknown().nullable(),
            }),
          ),
          requests: z
            .array(
              z.object({
                id: z.string(),
                title: z.string(),
                state: RequestStateSchema,
                items: z.array(
                  z.object({
                    itemId: z.string(),
                    version: z.string().nullable(),
                    item: z
                      .object({
                        value: z.object({
                          modelId: z.string(),
                        }),
                      })
                      .nullable(),
                  }),
                ),
              }),
            )
            .nullable(),
        }),
      }),
    ),
  });
}

export function SearchItemQuerySchema() {
  return z.object({
    searchItem: z.object({
      nodes: z.array(
        z
          .object({
            id: z.string(),
            title: z.string().nullable(),
            schemaId: z.string(),
            createdAt: z.string(),
            updatedAt: z.string(),
            status: ItemStatusSchema,
            referencedItems: z
              .array(
                z.object({
                  id: z.string(),
                  title: z.string().nullable(),
                  schemaId: z.string(),
                  createdBy: z
                    .union([
                      z.object({
                        name: z.string(),
                      }),
                      z.object({
                        name: z.string(),
                      }),
                    ])
                    .nullable(),
                  status: ItemStatusSchema,
                  version: z.string(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              )
              .nullable(),
            version: z.string(),
            assets: z.array(
              z
                .object({
                  id: z.string(),
                  url: z.string(),
                })
                .nullable(),
            ),
            fields: z.array(
              z.object({
                schemaFieldId: z.string(),
                itemGroupId: z.string().nullable(),
                type: SchemaFieldTypeSchema,
                value: z.unknown().nullable(),
              }),
            ),
            createdBy: z
              .union([
                z.object({
                  id: z.string(),
                  name: z.string(),
                }),
                z.object({
                  id: z.string(),
                  name: z.string(),
                }),
              ])
              .nullable(),
            updatedBy: z
              .union([
                z.object({
                  name: z.string(),
                  __typename: z.literal("Integration"),
                }),
                z.object({
                  name: z.string(),
                  __typename: z.literal("User"),
                }),
              ])
              .nullable(),
            metadata: z
              .object({
                id: z.string(),
                version: z.string(),
                fields: z.array(
                  z.object({
                    schemaFieldId: z.string(),
                    type: SchemaFieldTypeSchema,
                    value: z.unknown().nullable(),
                  }),
                ),
              })
              .nullable(),
            thread: z
              .object({
                id: z.string(),
                workspaceId: z.string(),
                comments: z.array(
                  z.object({
                    id: z.string(),
                    author: z
                      .union([
                        z.object({
                          id: z.string(),
                          name: z.string(),
                        }),
                        z.object({
                          id: z.string(),
                          name: z.string(),
                          email: z.string(),
                        }),
                      ])
                      .nullable(),
                    authorId: z.string(),
                    content: z.string(),
                    createdAt: z.string(),
                  }),
                ),
              })
              .nullable(),
          })
          .nullable(),
      ),
      totalCount: z.number(),
      pageInfo: z.object({
        hasNextPage: z.boolean(),
        hasPreviousPage: z.boolean(),
        startCursor: z.string().nullable(),
        endCursor: z.string().nullable(),
      }),
    }),
  });
}

export function CreateItemMutationSchema() {
  return z.object({
    createItem: z
      .object({
        item: z.object({
          id: z.string(),
          schemaId: z.string(),
          version: z.string(),
          fields: z.array(
            z.object({
              value: z.unknown().nullable(),
              type: SchemaFieldTypeSchema,
              schemaFieldId: z.string(),
              itemGroupId: z.string().nullable(),
            }),
          ),
          referencedItems: z
            .array(
              z.object({
                id: z.string(),
                title: z.string().nullable(),
                schemaId: z.string(),
                createdBy: z
                  .union([
                    z.object({
                      name: z.string(),
                    }),
                    z.object({
                      name: z.string(),
                    }),
                  ])
                  .nullable(),
                status: ItemStatusSchema,
                version: z.string(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            )
            .nullable(),
        }),
      })
      .nullable(),
  });
}

export function DeleteItemMutationSchema() {
  return z.object({
    deleteItem: z
      .object({
        itemId: z.string(),
      })
      .nullable(),
  });
}

export function DeleteItemsMutationSchema() {
  return z.object({
    deleteItems: z
      .object({
        itemIds: z.array(z.string()),
      })
      .nullable(),
  });
}

export function UpdateItemMutationSchema() {
  return z.object({
    updateItem: z
      .object({
        item: z.object({
          id: z.string(),
          schemaId: z.string(),
          version: z.string(),
          fields: z.array(
            z.object({
              value: z.unknown().nullable(),
              type: SchemaFieldTypeSchema,
              schemaFieldId: z.string(),
              itemGroupId: z.string().nullable(),
            }),
          ),
          referencedItems: z
            .array(
              z.object({
                id: z.string(),
                title: z.string().nullable(),
                schemaId: z.string(),
                createdBy: z
                  .union([
                    z.object({
                      name: z.string(),
                    }),
                    z.object({
                      name: z.string(),
                    }),
                  ])
                  .nullable(),
                status: ItemStatusSchema,
                version: z.string(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            )
            .nullable(),
        }),
      })
      .nullable(),
  });
}

export function UnpublishItemMutationSchema() {
  return z.object({
    unpublishItem: z
      .object({
        items: z.array(
          z.object({
            id: z.string(),
            version: z.string(),
            referencedItems: z
              .array(
                z.object({
                  id: z.string(),
                  title: z.string().nullable(),
                  schemaId: z.string(),
                  createdBy: z
                    .union([
                      z.object({
                        name: z.string(),
                      }),
                      z.object({
                        name: z.string(),
                      }),
                    ])
                    .nullable(),
                  status: ItemStatusSchema,
                  version: z.string(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              )
              .nullable(),
          }),
        ),
      })
      .nullable(),
  });
}

export function PublishItemMutationSchema() {
  return z.object({
    publishItem: z
      .object({
        items: z.array(
          z.object({
            id: z.string(),
            version: z.string(),
            referencedItems: z
              .array(
                z.object({
                  id: z.string(),
                  title: z.string().nullable(),
                  schemaId: z.string(),
                  createdBy: z
                    .union([
                      z.object({
                        name: z.string(),
                      }),
                      z.object({
                        name: z.string(),
                      }),
                    ])
                    .nullable(),
                  status: ItemStatusSchema,
                  version: z.string(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              )
              .nullable(),
          }),
        ),
      })
      .nullable(),
  });
}

export function ImportItemsMutationSchema() {
  return z.object({
    importItems: z
      .object({
        modelId: z.string(),
        totalCount: z.number(),
        insertedCount: z.number(),
        updatedCount: z.number(),
        ignoredCount: z.number(),
      })
      .nullable(),
  });
}

export function ImportItemsAsyncMutationSchema() {
  return z.object({
    importItemsAsync: z
      .object({
        job: z.object({
          id: z.string(),
          type: JobTypeSchema,
          status: JobStatusSchema,
          projectId: z.string(),
          progress: z.object({
            processed: z.number(),
            total: z.number(),
            percentage: z.number(),
          }),
        }),
      })
      .nullable(),
  });
}

export function JobQuerySchema() {
  return z.object({
    job: z
      .object({
        id: z.string(),
        type: JobTypeSchema,
        status: JobStatusSchema,
        projectId: z.string(),
        progress: z.object({
          processed: z.number(),
          total: z.number(),
          percentage: z.number(),
        }),
        error: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
        startedAt: z.string().nullable(),
        completedAt: z.string().nullable(),
      })
      .nullable(),
  });
}

export function JobsQuerySchema() {
  return z.object({
    jobs: z.array(
      z.object({
        id: z.string(),
        type: JobTypeSchema,
        status: JobStatusSchema,
        projectId: z.string(),
        progress: z.object({
          processed: z.number(),
          total: z.number(),
          percentage: z.number(),
        }),
      }),
    ),
  });
}

export function JobStateSubscriptionSchema() {
  return z.object({
    jobState: z.object({
      status: JobStatusSchema,
      progress: z
        .object({
          processed: z.number(),
          total: z.number(),
          percentage: z.number(),
        })
        .nullable(),
      error: z.string().nullable(),
    }),
  });
}

export function CancelJobMutationSchema() {
  return z.object({
    cancelJob: z
      .object({
        id: z.string(),
        status: JobStatusSchema,
      })
      .nullable(),
  });
}

export function GetModelsQuerySchema() {
  return z.object({
    models: z.object({
      nodes: z.array(
        z
          .object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            key: z.string(),
            order: z.number().nullable(),
            createdAt: z.string(),
            updatedAt: z.string(),
            schema: z.object({
              id: z.string(),
              fields: z.array(
                z.object({
                  id: z.string(),
                  type: SchemaFieldTypeSchema,
                }),
              ),
            }),
          })
          .nullable(),
      ),
    }),
  });
}

export function GetModelQuerySchema() {
  return z.object({
    node: z
      .union([
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          key: z.string(),
          order: z.number().nullable(),
          metadataSchema: z
            .object({
              id: z.string(),
              fields: z.array(
                z.object({
                  id: z.string(),
                  type: SchemaFieldTypeSchema,
                  title: z.string(),
                  key: z.string(),
                  description: z.string().nullable(),
                  required: z.boolean(),
                  unique: z.boolean(),
                  isTitle: z.boolean(),
                  multiple: z.boolean(),
                  order: z.number().nullable(),
                  typeProperty: z
                    .union([
                      z.object({}),
                      z.object({
                        defaultValue: z.unknown().nullable(),
                      }),
                      z.object({
                        defaultValue: z.unknown().nullable(),
                      }),
                      z.object({
                        defaultValue: z.unknown().nullable(),
                      }),
                      z.object({}),
                      z.object({}),
                      z.object({}),
                      z.object({}),
                      z.object({}),
                      z.object({}),
                      z.object({}),
                      z.object({}),
                      z.object({}),
                      z.object({
                        selectDefaultValue: z.unknown().nullable(),
                        tags: z.array(
                          z.object({
                            id: z.string(),
                            name: z.string(),
                            color: SchemaFieldTagColorSchema,
                          }),
                        ),
                      }),
                      z.object({
                        defaultValue: z.unknown().nullable(),
                        maxLength: z.number().nullable(),
                      }),
                      z.object({}),
                      z.object({
                        defaultValue: z.unknown().nullable(),
                      }),
                    ])
                    .nullable(),
                }),
              ),
            })
            .nullable(),
          schema: z.object({
            id: z.string(),
            fields: z.array(
              z.object({
                id: z.string(),
                type: SchemaFieldTypeSchema,
                title: z.string(),
                key: z.string(),
                description: z.string().nullable(),
                required: z.boolean(),
                unique: z.boolean(),
                isTitle: z.boolean(),
                multiple: z.boolean(),
                order: z.number().nullable(),
                typeProperty: z
                  .union([
                    z.object({
                      assetDefaultValue: z.unknown().nullable(),
                    }),
                    z.object({
                      defaultValue: z.unknown().nullable(),
                    }),
                    z.object({}),
                    z.object({
                      defaultValue: z.unknown().nullable(),
                    }),
                    z.object({
                      defaultValue: z.unknown().nullable(),
                      editorSupportedTypes: z.array(GeometryEditorSupportedTypeSchema),
                    }),
                    z.object({
                      defaultValue: z.unknown().nullable(),
                      objectSupportedTypes: z.array(GeometryObjectSupportedTypeSchema),
                    }),
                    z.object({
                      groupId: z.string(),
                    }),
                    z.object({
                      integerDefaultValue: z.unknown().nullable(),
                      min: z.number().nullable(),
                      max: z.number().nullable(),
                    }),
                    z.object({
                      defaultValue: z.unknown().nullable(),
                      maxLength: z.number().nullable(),
                    }),
                    z.object({
                      defaultValue: z.unknown().nullable(),
                      numberMin: z.number().nullable(),
                      numberMax: z.number().nullable(),
                    }),
                    z.object({
                      modelId: z.string(),
                      schema: z.object({
                        id: z.string(),
                        titleFieldId: z.string().nullable(),
                      }),
                      correspondingField: z
                        .object({
                          id: z.string(),
                          type: SchemaFieldTypeSchema,
                          title: z.string(),
                          key: z.string(),
                          description: z.string().nullable(),
                          required: z.boolean(),
                          unique: z.boolean(),
                          multiple: z.boolean(),
                          order: z.number().nullable(),
                        })
                        .nullable(),
                    }),
                    z.object({}),
                    z.object({
                      selectDefaultValue: z.unknown().nullable(),
                      values: z.array(z.string()),
                    }),
                    z.object({}),
                    z.object({
                      defaultValue: z.unknown().nullable(),
                      maxLength: z.number().nullable(),
                    }),
                    z.object({
                      defaultValue: z.unknown().nullable(),
                      maxLength: z.number().nullable(),
                    }),
                    z.object({
                      defaultValue: z.unknown().nullable(),
                    }),
                  ])
                  .nullable(),
              }),
            ),
          }),
        }),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
      ])
      .nullable(),
  });
}

export function CreateModelMutationSchema() {
  return z.object({
    createModel: z
      .object({
        model: z.object({
          id: z.string(),
          name: z.string(),
        }),
      })
      .nullable(),
  });
}

export function DeleteModelMutationSchema() {
  return z.object({
    deleteModel: z
      .object({
        modelId: z.string(),
      })
      .nullable(),
  });
}

export function UpdateModelMutationSchema() {
  return z.object({
    updateModel: z
      .object({
        model: z.object({
          id: z.string(),
          name: z.string(),
        }),
      })
      .nullable(),
  });
}

export function CheckModelKeyAvailabilityQuerySchema() {
  return z.object({
    checkModelKeyAvailability: z.object({
      key: z.string(),
      available: z.boolean(),
    }),
  });
}

export function UpdateModelsOrderMutationSchema() {
  return z.object({
    updateModelsOrder: z
      .object({
        models: z.array(
          z.object({
            id: z.string(),
          }),
        ),
      })
      .nullable(),
  });
}

export function ExportModelMutationSchema() {
  return z.object({
    exportModel: z
      .object({
        modelId: z.string(),
        url: z.string(),
      })
      .nullable(),
  });
}

export function ExportModelSchemaMutationSchema() {
  return z.object({
    exportModelSchema: z
      .object({
        modelId: z.string(),
        url: z.string(),
      })
      .nullable(),
  });
}

export function GetProjectQuerySchema() {
  return z.object({
    node: z
      .union([
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          alias: z.string(),
          license: z.string(),
          readme: z.string(),
          accessibility: z.object({
            visibility: ProjectVisibilitySchema,
            publication: z
              .object({
                publicModels: z.array(z.string()),
                publicAssets: z.boolean(),
              })
              .nullable(),
            apiKeys: z
              .array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  description: z.string(),
                  key: z.string(),
                  publication: z.object({
                    publicModels: z.array(z.string()),
                    publicAssets: z.boolean(),
                  }),
                }),
              )
              .nullable(),
          }),
          requestRoles: z.array(RoleSchema).nullable(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
      ])
      .nullable(),
  });
}

export function GetProjectsQuerySchema() {
  return z.object({
    projects: z.object({
      nodes: z.array(
        z
          .object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            alias: z.string(),
            license: z.string(),
            readme: z.string(),
            createdAt: z.string(),
            updatedAt: z.string(),
            accessibility: z.object({
              visibility: ProjectVisibilitySchema,
              publication: z
                .object({
                  publicModels: z.array(z.string()),
                  publicAssets: z.boolean(),
                })
                .nullable(),
              apiKeys: z
                .array(
                  z.object({
                    id: z.string(),
                    name: z.string(),
                    description: z.string(),
                    key: z.string(),
                    publication: z.object({
                      publicModels: z.array(z.string()),
                      publicAssets: z.boolean(),
                    }),
                  }),
                )
                .nullable(),
            }),
            requestRoles: z.array(RoleSchema).nullable(),
          })
          .nullable(),
      ),
      totalCount: z.number(),
    }),
  });
}

export function CheckProjectAliasQuerySchema() {
  return z.object({
    checkProjectAlias: z.object({
      alias: z.string(),
      available: z.boolean(),
    }),
  });
}

export function CheckProjectLimitsQuerySchema() {
  return z.object({
    checkWorkspaceProjectLimits: z.object({
      publicProjectsAllowed: z.boolean(),
      privateProjectsAllowed: z.boolean(),
    }),
  });
}

export function CreateProjectMutationSchema() {
  return z.object({
    createProject: z
      .object({
        project: z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          alias: z.string(),
          license: z.string(),
          accessibility: z.object({
            visibility: ProjectVisibilitySchema,
            publication: z
              .object({
                publicModels: z.array(z.string()),
                publicAssets: z.boolean(),
              })
              .nullable(),
            apiKeys: z
              .array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  description: z.string(),
                  key: z.string(),
                  publication: z.object({
                    publicModels: z.array(z.string()),
                    publicAssets: z.boolean(),
                  }),
                }),
              )
              .nullable(),
          }),
          requestRoles: z.array(RoleSchema).nullable(),
        }),
      })
      .nullable(),
  });
}

export function DeleteProjectMutationSchema() {
  return z.object({
    deleteProject: z
      .object({
        projectId: z.string(),
      })
      .nullable(),
  });
}

export function UpdateProjectMutationSchema() {
  return z.object({
    updateProject: z
      .object({
        project: z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          alias: z.string(),
          license: z.string(),
          readme: z.string(),
          accessibility: z.object({
            visibility: ProjectVisibilitySchema,
            publication: z
              .object({
                publicModels: z.array(z.string()),
                publicAssets: z.boolean(),
              })
              .nullable(),
            apiKeys: z
              .array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  description: z.string(),
                  key: z.string(),
                  publication: z.object({
                    publicModels: z.array(z.string()),
                    publicAssets: z.boolean(),
                  }),
                }),
              )
              .nullable(),
          }),
          requestRoles: z.array(RoleSchema).nullable(),
        }),
      })
      .nullable(),
  });
}

export function CreateApiKeyMutationSchema() {
  return z.object({
    createAPIKey: z
      .object({
        apiKey: z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          key: z.string(),
          publication: z.object({
            publicModels: z.array(z.string()),
            publicAssets: z.boolean(),
          }),
        }),
      })
      .nullable(),
  });
}

export function UpdateApiKeyMutationSchema() {
  return z.object({
    updateAPIKey: z
      .object({
        apiKey: z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          key: z.string(),
          publication: z.object({
            publicModels: z.array(z.string()),
            publicAssets: z.boolean(),
          }),
        }),
      })
      .nullable(),
  });
}

export function DeleteApiKeyMutationSchema() {
  return z.object({
    deleteAPIKey: z
      .object({
        apiKeyId: z.string(),
      })
      .nullable(),
  });
}

export function RegenerateApiKeyMutationSchema() {
  return z.object({
    regenerateAPIKey: z
      .object({
        apiKey: z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          key: z.string(),
          publication: z.object({
            publicModels: z.array(z.string()),
            publicAssets: z.boolean(),
          }),
        }),
      })
      .nullable(),
  });
}

export function GetRequestsQuerySchema() {
  return z.object({
    requests: z.object({
      nodes: z.array(
        z
          .object({
            id: z.string(),
            title: z.string(),
            description: z.string().nullable(),
            createdBy: z
              .object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
              })
              .nullable(),
            workspaceId: z.string(),
            projectId: z.string(),
            threadId: z.string().nullable(),
            reviewersId: z.array(z.string()),
            reviewers: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
              }),
            ),
            state: RequestStateSchema,
            createdAt: z.string(),
            updatedAt: z.string(),
            approvedAt: z.string().nullable(),
            closedAt: z.string().nullable(),
            thread: z
              .object({
                id: z.string(),
                workspaceId: z.string(),
                comments: z.array(
                  z.object({
                    id: z.string(),
                    author: z
                      .union([
                        z.object({
                          id: z.string(),
                          name: z.string(),
                        }),
                        z.object({
                          id: z.string(),
                          name: z.string(),
                          email: z.string(),
                        }),
                      ])
                      .nullable(),
                    authorId: z.string(),
                    content: z.string(),
                    createdAt: z.string(),
                  }),
                ),
              })
              .nullable(),
          })
          .nullable(),
      ),
      totalCount: z.number(),
    }),
  });
}

export function GetModalRequestsQuerySchema() {
  return z.object({
    requests: z.object({
      nodes: z.array(
        z
          .object({
            id: z.string(),
            title: z.string(),
            description: z.string().nullable(),
            createdBy: z
              .object({
                name: z.string(),
              })
              .nullable(),
            items: z.array(
              z.object({
                itemId: z.string(),
                version: z.string().nullable(),
              }),
            ),
            reviewers: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
              }),
            ),
            state: RequestStateSchema,
            createdAt: z.string(),
          })
          .nullable(),
      ),
      totalCount: z.number(),
    }),
  });
}

export function GetRequestQuerySchema() {
  return z.object({
    node: z
      .union([
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
          items: z.array(
            z.object({
              itemId: z.string(),
              version: z.string().nullable(),
              ref: z.string().nullable(),
              item: z
                .object({
                  version: z.string(),
                  parents: z.array(z.string()).nullable(),
                  refs: z.array(z.string()),
                  value: z.object({
                    id: z.string(),
                    title: z.string().nullable(),
                    schemaId: z.string(),
                    modelId: z.string(),
                    model: z.object({
                      name: z.string(),
                    }),
                    fields: z.array(
                      z.object({
                        schemaFieldId: z.string(),
                        type: SchemaFieldTypeSchema,
                        value: z.unknown().nullable(),
                        itemGroupId: z.string().nullable(),
                      }),
                    ),
                    referencedItems: z
                      .array(
                        z.object({
                          id: z.string(),
                          title: z.string().nullable(),
                          schemaId: z.string(),
                          createdBy: z
                            .union([
                              z.object({
                                name: z.string(),
                              }),
                              z.object({
                                name: z.string(),
                              }),
                            ])
                            .nullable(),
                          status: ItemStatusSchema,
                          version: z.string(),
                          createdAt: z.string(),
                          updatedAt: z.string(),
                        }),
                      )
                      .nullable(),
                    schema: z.object({
                      id: z.string(),
                      fields: z.array(
                        z.object({
                          id: z.string(),
                          type: SchemaFieldTypeSchema,
                          title: z.string(),
                          key: z.string(),
                          description: z.string().nullable(),
                          required: z.boolean(),
                          unique: z.boolean(),
                          isTitle: z.boolean(),
                          multiple: z.boolean(),
                          typeProperty: z
                            .union([
                              z.object({
                                assetDefaultValue: z.unknown().nullable(),
                              }),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                              }),
                              z.object({}),
                              z.object({}),
                              z.object({}),
                              z.object({}),
                              z.object({
                                groupId: z.string(),
                              }),
                              z.object({
                                integerDefaultValue: z.unknown().nullable(),
                                min: z.number().nullable(),
                                max: z.number().nullable(),
                              }),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                                maxLength: z.number().nullable(),
                              }),
                              z.object({}),
                              z.object({
                                modelId: z.string(),
                              }),
                              z.object({}),
                              z.object({
                                selectDefaultValue: z.unknown().nullable(),
                                values: z.array(z.string()),
                              }),
                              z.object({}),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                                maxLength: z.number().nullable(),
                              }),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                                maxLength: z.number().nullable(),
                              }),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                              }),
                            ])
                            .nullable(),
                        }),
                      ),
                    }),
                  }),
                })
                .nullable(),
            }),
          ),
          title: z.string(),
          description: z.string().nullable(),
          createdBy: z
            .object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            })
            .nullable(),
          workspaceId: z.string(),
          projectId: z.string(),
          threadId: z.string().nullable(),
          reviewersId: z.array(z.string()),
          state: RequestStateSchema,
          createdAt: z.string(),
          updatedAt: z.string(),
          approvedAt: z.string().nullable(),
          closedAt: z.string().nullable(),
          thread: z
            .object({
              id: z.string(),
              workspaceId: z.string(),
              comments: z.array(
                z.object({
                  id: z.string(),
                  author: z
                    .union([
                      z.object({
                        id: z.string(),
                        name: z.string(),
                      }),
                      z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                      }),
                    ])
                    .nullable(),
                  authorId: z.string(),
                  content: z.string(),
                  createdAt: z.string(),
                }),
              ),
            })
            .nullable(),
          project: z
            .object({
              id: z.string(),
              name: z.string(),
              createdAt: z.string(),
              updatedAt: z.string(),
            })
            .nullable(),
          reviewers: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            }),
          ),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
      ])
      .nullable(),
  });
}

export function CreateRequestMutationSchema() {
  return z.object({
    createRequest: z
      .object({
        request: z.object({
          id: z.string(),
          items: z.array(
            z.object({
              itemId: z.string(),
              version: z.string().nullable(),
              ref: z.string().nullable(),
              item: z
                .object({
                  version: z.string(),
                  parents: z.array(z.string()).nullable(),
                  refs: z.array(z.string()),
                  value: z.object({
                    id: z.string(),
                    title: z.string().nullable(),
                    schemaId: z.string(),
                    modelId: z.string(),
                    model: z.object({
                      name: z.string(),
                    }),
                    fields: z.array(
                      z.object({
                        schemaFieldId: z.string(),
                        type: SchemaFieldTypeSchema,
                        value: z.unknown().nullable(),
                        itemGroupId: z.string().nullable(),
                      }),
                    ),
                    referencedItems: z
                      .array(
                        z.object({
                          id: z.string(),
                          title: z.string().nullable(),
                          schemaId: z.string(),
                          createdBy: z
                            .union([
                              z.object({
                                name: z.string(),
                              }),
                              z.object({
                                name: z.string(),
                              }),
                            ])
                            .nullable(),
                          status: ItemStatusSchema,
                          version: z.string(),
                          createdAt: z.string(),
                          updatedAt: z.string(),
                        }),
                      )
                      .nullable(),
                    schema: z.object({
                      id: z.string(),
                      fields: z.array(
                        z.object({
                          id: z.string(),
                          type: SchemaFieldTypeSchema,
                          title: z.string(),
                          key: z.string(),
                          description: z.string().nullable(),
                          required: z.boolean(),
                          unique: z.boolean(),
                          isTitle: z.boolean(),
                          multiple: z.boolean(),
                          typeProperty: z
                            .union([
                              z.object({
                                assetDefaultValue: z.unknown().nullable(),
                              }),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                              }),
                              z.object({}),
                              z.object({}),
                              z.object({}),
                              z.object({}),
                              z.object({
                                groupId: z.string(),
                              }),
                              z.object({
                                integerDefaultValue: z.unknown().nullable(),
                                min: z.number().nullable(),
                                max: z.number().nullable(),
                              }),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                                maxLength: z.number().nullable(),
                              }),
                              z.object({}),
                              z.object({
                                modelId: z.string(),
                              }),
                              z.object({}),
                              z.object({
                                selectDefaultValue: z.unknown().nullable(),
                                values: z.array(z.string()),
                              }),
                              z.object({}),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                                maxLength: z.number().nullable(),
                              }),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                                maxLength: z.number().nullable(),
                              }),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                              }),
                            ])
                            .nullable(),
                        }),
                      ),
                    }),
                  }),
                })
                .nullable(),
            }),
          ),
          title: z.string(),
          description: z.string().nullable(),
          createdBy: z
            .object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            })
            .nullable(),
          workspaceId: z.string(),
          projectId: z.string(),
          threadId: z.string().nullable(),
          reviewersId: z.array(z.string()),
          state: RequestStateSchema,
          createdAt: z.string(),
          updatedAt: z.string(),
          approvedAt: z.string().nullable(),
          closedAt: z.string().nullable(),
          thread: z
            .object({
              id: z.string(),
              workspaceId: z.string(),
              comments: z.array(
                z.object({
                  id: z.string(),
                  author: z
                    .union([
                      z.object({
                        id: z.string(),
                        name: z.string(),
                      }),
                      z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                      }),
                    ])
                    .nullable(),
                  authorId: z.string(),
                  content: z.string(),
                  createdAt: z.string(),
                }),
              ),
            })
            .nullable(),
          project: z
            .object({
              id: z.string(),
              name: z.string(),
              createdAt: z.string(),
              updatedAt: z.string(),
            })
            .nullable(),
          reviewers: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            }),
          ),
        }),
      })
      .nullable(),
  });
}

export function UpdateRequestMutationSchema() {
  return z.object({
    updateRequest: z
      .object({
        request: z.object({
          id: z.string(),
          items: z.array(
            z.object({
              itemId: z.string(),
              version: z.string().nullable(),
              ref: z.string().nullable(),
              item: z
                .object({
                  version: z.string(),
                  parents: z.array(z.string()).nullable(),
                  refs: z.array(z.string()),
                  value: z.object({
                    id: z.string(),
                    title: z.string().nullable(),
                    schemaId: z.string(),
                    modelId: z.string(),
                    model: z.object({
                      name: z.string(),
                    }),
                    fields: z.array(
                      z.object({
                        schemaFieldId: z.string(),
                        type: SchemaFieldTypeSchema,
                        value: z.unknown().nullable(),
                        itemGroupId: z.string().nullable(),
                      }),
                    ),
                    referencedItems: z
                      .array(
                        z.object({
                          id: z.string(),
                          title: z.string().nullable(),
                          schemaId: z.string(),
                          createdBy: z
                            .union([
                              z.object({
                                name: z.string(),
                              }),
                              z.object({
                                name: z.string(),
                              }),
                            ])
                            .nullable(),
                          status: ItemStatusSchema,
                          version: z.string(),
                          createdAt: z.string(),
                          updatedAt: z.string(),
                        }),
                      )
                      .nullable(),
                    schema: z.object({
                      id: z.string(),
                      fields: z.array(
                        z.object({
                          id: z.string(),
                          type: SchemaFieldTypeSchema,
                          title: z.string(),
                          key: z.string(),
                          description: z.string().nullable(),
                          required: z.boolean(),
                          unique: z.boolean(),
                          isTitle: z.boolean(),
                          multiple: z.boolean(),
                          typeProperty: z
                            .union([
                              z.object({
                                assetDefaultValue: z.unknown().nullable(),
                              }),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                              }),
                              z.object({}),
                              z.object({}),
                              z.object({}),
                              z.object({}),
                              z.object({
                                groupId: z.string(),
                              }),
                              z.object({
                                integerDefaultValue: z.unknown().nullable(),
                                min: z.number().nullable(),
                                max: z.number().nullable(),
                              }),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                                maxLength: z.number().nullable(),
                              }),
                              z.object({}),
                              z.object({
                                modelId: z.string(),
                              }),
                              z.object({}),
                              z.object({
                                selectDefaultValue: z.unknown().nullable(),
                                values: z.array(z.string()),
                              }),
                              z.object({}),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                                maxLength: z.number().nullable(),
                              }),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                                maxLength: z.number().nullable(),
                              }),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                              }),
                            ])
                            .nullable(),
                        }),
                      ),
                    }),
                  }),
                })
                .nullable(),
            }),
          ),
          title: z.string(),
          description: z.string().nullable(),
          createdBy: z
            .object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            })
            .nullable(),
          workspaceId: z.string(),
          projectId: z.string(),
          threadId: z.string().nullable(),
          reviewersId: z.array(z.string()),
          state: RequestStateSchema,
          createdAt: z.string(),
          updatedAt: z.string(),
          approvedAt: z.string().nullable(),
          closedAt: z.string().nullable(),
          thread: z
            .object({
              id: z.string(),
              workspaceId: z.string(),
              comments: z.array(
                z.object({
                  id: z.string(),
                  author: z
                    .union([
                      z.object({
                        id: z.string(),
                        name: z.string(),
                      }),
                      z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                      }),
                    ])
                    .nullable(),
                  authorId: z.string(),
                  content: z.string(),
                  createdAt: z.string(),
                }),
              ),
            })
            .nullable(),
          project: z
            .object({
              id: z.string(),
              name: z.string(),
              createdAt: z.string(),
              updatedAt: z.string(),
            })
            .nullable(),
          reviewers: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            }),
          ),
        }),
      })
      .nullable(),
  });
}

export function ApproveRequestMutationSchema() {
  return z.object({
    approveRequest: z
      .object({
        request: z.object({
          id: z.string(),
          items: z.array(
            z.object({
              itemId: z.string(),
              version: z.string().nullable(),
              ref: z.string().nullable(),
              item: z
                .object({
                  version: z.string(),
                  parents: z.array(z.string()).nullable(),
                  refs: z.array(z.string()),
                  value: z.object({
                    id: z.string(),
                    title: z.string().nullable(),
                    schemaId: z.string(),
                    modelId: z.string(),
                    model: z.object({
                      name: z.string(),
                    }),
                    fields: z.array(
                      z.object({
                        schemaFieldId: z.string(),
                        type: SchemaFieldTypeSchema,
                        value: z.unknown().nullable(),
                        itemGroupId: z.string().nullable(),
                      }),
                    ),
                    referencedItems: z
                      .array(
                        z.object({
                          id: z.string(),
                          title: z.string().nullable(),
                          schemaId: z.string(),
                          createdBy: z
                            .union([
                              z.object({
                                name: z.string(),
                              }),
                              z.object({
                                name: z.string(),
                              }),
                            ])
                            .nullable(),
                          status: ItemStatusSchema,
                          version: z.string(),
                          createdAt: z.string(),
                          updatedAt: z.string(),
                        }),
                      )
                      .nullable(),
                    schema: z.object({
                      id: z.string(),
                      fields: z.array(
                        z.object({
                          id: z.string(),
                          type: SchemaFieldTypeSchema,
                          title: z.string(),
                          key: z.string(),
                          description: z.string().nullable(),
                          required: z.boolean(),
                          unique: z.boolean(),
                          isTitle: z.boolean(),
                          multiple: z.boolean(),
                          typeProperty: z
                            .union([
                              z.object({
                                assetDefaultValue: z.unknown().nullable(),
                              }),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                              }),
                              z.object({}),
                              z.object({}),
                              z.object({}),
                              z.object({}),
                              z.object({
                                groupId: z.string(),
                              }),
                              z.object({
                                integerDefaultValue: z.unknown().nullable(),
                                min: z.number().nullable(),
                                max: z.number().nullable(),
                              }),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                                maxLength: z.number().nullable(),
                              }),
                              z.object({}),
                              z.object({
                                modelId: z.string(),
                              }),
                              z.object({}),
                              z.object({
                                selectDefaultValue: z.unknown().nullable(),
                                values: z.array(z.string()),
                              }),
                              z.object({}),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                                maxLength: z.number().nullable(),
                              }),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                                maxLength: z.number().nullable(),
                              }),
                              z.object({
                                defaultValue: z.unknown().nullable(),
                              }),
                            ])
                            .nullable(),
                        }),
                      ),
                    }),
                  }),
                })
                .nullable(),
            }),
          ),
          title: z.string(),
          description: z.string().nullable(),
          createdBy: z
            .object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            })
            .nullable(),
          workspaceId: z.string(),
          projectId: z.string(),
          threadId: z.string().nullable(),
          reviewersId: z.array(z.string()),
          state: RequestStateSchema,
          createdAt: z.string(),
          updatedAt: z.string(),
          approvedAt: z.string().nullable(),
          closedAt: z.string().nullable(),
          thread: z
            .object({
              id: z.string(),
              workspaceId: z.string(),
              comments: z.array(
                z.object({
                  id: z.string(),
                  author: z
                    .union([
                      z.object({
                        id: z.string(),
                        name: z.string(),
                      }),
                      z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                      }),
                    ])
                    .nullable(),
                  authorId: z.string(),
                  content: z.string(),
                  createdAt: z.string(),
                }),
              ),
            })
            .nullable(),
          project: z
            .object({
              id: z.string(),
              name: z.string(),
              createdAt: z.string(),
              updatedAt: z.string(),
            })
            .nullable(),
          reviewers: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            }),
          ),
        }),
      })
      .nullable(),
  });
}

export function DeleteRequestMutationSchema() {
  return z.object({
    deleteRequest: z
      .object({
        requests: z.array(z.string()),
      })
      .nullable(),
  });
}

export function CreateThreadWithCommentMutationSchema() {
  return z.object({
    createThreadWithComment: z
      .object({
        thread: z.object({
          id: z.string(),
          workspaceId: z.string(),
          comments: z.array(
            z.object({
              id: z.string(),
              author: z
                .union([
                  z.object({
                    id: z.string(),
                    name: z.string(),
                  }),
                  z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  }),
                ])
                .nullable(),
              authorType: OperatorTypeSchema,
              authorId: z.string(),
              content: z.string(),
              createdAt: z.string(),
            }),
          ),
        }),
      })
      .nullable(),
  });
}

export function GetUserByNameOrEmailQuerySchema() {
  return z.object({
    userByNameOrEmail: z
      .object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
      })
      .nullable(),
  });
}

export function GetUsersQuerySchema() {
  return z.object({
    userSearch: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
      }),
    ),
  });
}

export function GetMeQuerySchema() {
  return z.object({
    me: z
      .object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        lang: z.string(),
        profilePictureUrl: z.string().nullable(),
        myWorkspace: z
          .object({
            id: z.string(),
            name: z.string(),
            alias: z.string().nullable(),
          })
          .nullable(),
        workspaces: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            alias: z.string().nullable(),
            members: z.array(
              z.union([
                z.object({
                  integrationId: z.string(),
                  integration: z
                    .object({
                      id: z.string(),
                      name: z.string(),
                      description: z.string().nullable(),
                      logoUrl: z.string(),
                      iType: IntegrationTypeSchema,
                      developerId: z.string(),
                      developer: z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                      }),
                      config: z
                        .object({
                          token: z.string(),
                          webhooks: z.array(
                            z.object({
                              id: z.string(),
                              name: z.string(),
                              url: z.string(),
                              active: z.boolean(),
                              secret: z.string(),
                              trigger: z.object({
                                onItemCreate: z.boolean().nullable(),
                                onItemUpdate: z.boolean().nullable(),
                                onItemDelete: z.boolean().nullable(),
                                onItemPublish: z.boolean().nullable(),
                                onItemUnPublish: z.boolean().nullable(),
                                onAssetUpload: z.boolean().nullable(),
                                onAssetDecompress: z.boolean().nullable(),
                                onAssetDelete: z.boolean().nullable(),
                              }),
                              createdAt: z.string(),
                              updatedAt: z.string(),
                            }),
                          ),
                        })
                        .nullable(),
                      createdAt: z.string(),
                      updatedAt: z.string(),
                    })
                    .nullable(),
                  role: RoleSchema,
                  active: z.boolean(),
                  invitedBy: z
                    .object({
                      id: z.string(),
                      name: z.string(),
                      email: z.string(),
                    })
                    .nullable(),
                  invitedById: z.string(),
                }),
                z.object({
                  user: z
                    .object({
                      id: z.string(),
                      name: z.string(),
                      email: z.string(),
                    })
                    .nullable(),
                  userId: z.string(),
                  role: RoleSchema,
                }),
              ]),
            ),
          }),
        ),
        auths: z.array(z.string()),
        integrations: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().nullable(),
            logoUrl: z.string(),
            iType: IntegrationTypeSchema,
            developerId: z.string(),
            developer: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            }),
            config: z
              .object({
                token: z.string(),
                webhooks: z.array(
                  z.object({
                    id: z.string(),
                    name: z.string(),
                    url: z.string(),
                    active: z.boolean(),
                    secret: z.string(),
                    trigger: z.object({
                      onItemCreate: z.boolean().nullable(),
                      onItemUpdate: z.boolean().nullable(),
                      onItemDelete: z.boolean().nullable(),
                      onItemPublish: z.boolean().nullable(),
                      onItemUnPublish: z.boolean().nullable(),
                      onAssetUpload: z.boolean().nullable(),
                      onAssetDecompress: z.boolean().nullable(),
                      onAssetDelete: z.boolean().nullable(),
                    }),
                    createdAt: z.string(),
                    updatedAt: z.string(),
                  }),
                ),
              })
              .nullable(),
            createdAt: z.string(),
            updatedAt: z.string(),
          }),
        ),
      })
      .nullable(),
  });
}

export function GetProfileQuerySchema() {
  return z.object({
    me: z
      .object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        lang: z.string(),
        theme: ThemeSchema,
        myWorkspace: z
          .object({
            id: z.string(),
            name: z.string(),
            alias: z.string().nullable(),
          })
          .nullable(),
        auths: z.array(z.string()),
      })
      .nullable(),
  });
}

export function GetLanguageQuerySchema() {
  return z.object({
    me: z
      .object({
        id: z.string(),
        lang: z.string(),
      })
      .nullable(),
  });
}

export function GetThemeQuerySchema() {
  return z.object({
    me: z
      .object({
        id: z.string(),
        theme: ThemeSchema,
      })
      .nullable(),
  });
}

export function UpdateMeMutationSchema() {
  return z.object({
    updateMe: z
      .object({
        me: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
          lang: z.string(),
          theme: ThemeSchema,
          myWorkspace: z
            .object({
              id: z.string(),
              name: z.string(),
              alias: z.string().nullable(),
            })
            .nullable(),
        }),
      })
      .nullable(),
  });
}

export function DeleteMeMutationSchema() {
  return z.object({
    deleteMe: z
      .object({
        userId: z.string(),
      })
      .nullable(),
  });
}

export function GetViewsQuerySchema() {
  return z.object({
    view: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        modelId: z.string(),
        projectId: z.string(),
        order: z.number(),
        sort: z
          .object({
            field: z.object({
              type: FieldTypeSchema,
              id: z.string().nullable(),
            }),
            direction: SortDirectionSchema.nullable(),
          })
          .nullable(),
        columns: z
          .array(
            z.object({
              field: z.object({
                type: FieldTypeSchema,
                id: z.string().nullable(),
              }),
              visible: z.boolean(),
            }),
          )
          .nullable(),
        filter: z
          .union([
            z.object({
              conditions: z.array(
                z.union([
                  z.object({
                    __typename: z.literal("AndCondition"),
                  }),
                  z.object({
                    fieldId: z.object({
                      type: FieldTypeSchema,
                      id: z.string().nullable(),
                    }),
                    basicOperator: BasicOperatorSchema,
                    basicValue: z.unknown(),
                    __typename: z.literal("BasicFieldCondition"),
                  }),
                  z.object({
                    fieldId: z.object({
                      type: FieldTypeSchema,
                      id: z.string().nullable(),
                    }),
                    boolOperator: BoolOperatorSchema,
                    boolValue: z.boolean(),
                    __typename: z.literal("BoolFieldCondition"),
                  }),
                  z.object({
                    fieldId: z.object({
                      type: FieldTypeSchema,
                      id: z.string().nullable(),
                    }),
                    multipleOperator: MultipleOperatorSchema,
                    multipleValue: z.array(z.unknown()),
                    __typename: z.literal("MultipleFieldCondition"),
                  }),
                  z.object({
                    fieldId: z.object({
                      type: FieldTypeSchema,
                      id: z.string().nullable(),
                    }),
                    nullableOperator: NullableOperatorSchema,
                    __typename: z.literal("NullableFieldCondition"),
                  }),
                  z.object({
                    fieldId: z.object({
                      type: FieldTypeSchema,
                      id: z.string().nullable(),
                    }),
                    numberOperator: NumberOperatorSchema,
                    numberValue: z.number(),
                    __typename: z.literal("NumberFieldCondition"),
                  }),
                  z.object({
                    __typename: z.literal("OrCondition"),
                  }),
                  z.object({
                    fieldId: z.object({
                      type: FieldTypeSchema,
                      id: z.string().nullable(),
                    }),
                    stringOperator: StringOperatorSchema,
                    stringValue: z.string(),
                    __typename: z.literal("StringFieldCondition"),
                  }),
                  z.object({
                    fieldId: z.object({
                      type: FieldTypeSchema,
                      id: z.string().nullable(),
                    }),
                    timeOperator: TimeOperatorSchema,
                    timeValue: z.string(),
                    __typename: z.literal("TimeFieldCondition"),
                  }),
                ]),
              ),
            }),
            z.object({}),
            z.object({}),
            z.object({}),
            z.object({}),
            z.object({}),
            z.object({}),
            z.object({}),
            z.object({}),
          ])
          .nullable(),
        __typename: z.literal("View"),
      }),
    ),
    __typename: z.literal("Query"),
  });
}

export function CreateViewMutationSchema() {
  return z.object({
    createView: z
      .object({
        view: z.object({
          id: z.string(),
          name: z.string(),
          modelId: z.string(),
          projectId: z.string(),
          sort: z
            .object({
              field: z.object({
                type: FieldTypeSchema,
                id: z.string().nullable(),
              }),
              direction: SortDirectionSchema.nullable(),
            })
            .nullable(),
          columns: z
            .array(
              z.object({
                field: z.object({
                  type: FieldTypeSchema,
                  id: z.string().nullable(),
                }),
                visible: z.boolean(),
              }),
            )
            .nullable(),
          filter: z
            .union([
              z.object({
                conditions: z.array(
                  z.union([
                    z.object({
                      __typename: z.literal("AndCondition"),
                    }),
                    z.object({
                      fieldId: z.object({
                        type: FieldTypeSchema,
                        id: z.string().nullable(),
                      }),
                      basicOperator: BasicOperatorSchema,
                      basicValue: z.unknown(),
                      __typename: z.literal("BasicFieldCondition"),
                    }),
                    z.object({
                      fieldId: z.object({
                        type: FieldTypeSchema,
                        id: z.string().nullable(),
                      }),
                      boolOperator: BoolOperatorSchema,
                      boolValue: z.boolean(),
                      __typename: z.literal("BoolFieldCondition"),
                    }),
                    z.object({
                      fieldId: z.object({
                        type: FieldTypeSchema,
                        id: z.string().nullable(),
                      }),
                      multipleOperator: MultipleOperatorSchema,
                      multipleValue: z.array(z.unknown()),
                      __typename: z.literal("MultipleFieldCondition"),
                    }),
                    z.object({
                      fieldId: z.object({
                        type: FieldTypeSchema,
                        id: z.string().nullable(),
                      }),
                      nullableOperator: NullableOperatorSchema,
                      __typename: z.literal("NullableFieldCondition"),
                    }),
                    z.object({
                      fieldId: z.object({
                        type: FieldTypeSchema,
                        id: z.string().nullable(),
                      }),
                      numberOperator: NumberOperatorSchema,
                      numberValue: z.number(),
                      __typename: z.literal("NumberFieldCondition"),
                    }),
                    z.object({
                      __typename: z.literal("OrCondition"),
                    }),
                    z.object({
                      fieldId: z.object({
                        type: FieldTypeSchema,
                        id: z.string().nullable(),
                      }),
                      stringOperator: StringOperatorSchema,
                      stringValue: z.string(),
                      __typename: z.literal("StringFieldCondition"),
                    }),
                    z.object({
                      fieldId: z.object({
                        type: FieldTypeSchema,
                        id: z.string().nullable(),
                      }),
                      timeOperator: TimeOperatorSchema,
                      timeValue: z.string(),
                      __typename: z.literal("TimeFieldCondition"),
                    }),
                  ]),
                ),
              }),
              z.object({}),
              z.object({}),
              z.object({}),
              z.object({}),
              z.object({}),
              z.object({}),
              z.object({}),
              z.object({}),
            ])
            .nullable(),
          __typename: z.literal("View"),
        }),
      })
      .nullable(),
  });
}

export function UpdateViewMutationSchema() {
  return z.object({
    updateView: z
      .object({
        view: z.object({
          id: z.string(),
          name: z.string(),
          modelId: z.string(),
          projectId: z.string(),
          sort: z
            .object({
              field: z.object({
                type: FieldTypeSchema,
                id: z.string().nullable(),
              }),
              direction: SortDirectionSchema.nullable(),
            })
            .nullable(),
          columns: z
            .array(
              z.object({
                field: z.object({
                  type: FieldTypeSchema,
                  id: z.string().nullable(),
                }),
                visible: z.boolean(),
              }),
            )
            .nullable(),
          filter: z
            .union([
              z.object({
                conditions: z.array(
                  z.union([
                    z.object({
                      __typename: z.literal("AndCondition"),
                    }),
                    z.object({
                      fieldId: z.object({
                        type: FieldTypeSchema,
                        id: z.string().nullable(),
                      }),
                      basicOperator: BasicOperatorSchema,
                      basicValue: z.unknown(),
                      __typename: z.literal("BasicFieldCondition"),
                    }),
                    z.object({
                      fieldId: z.object({
                        type: FieldTypeSchema,
                        id: z.string().nullable(),
                      }),
                      boolOperator: BoolOperatorSchema,
                      boolValue: z.boolean(),
                      __typename: z.literal("BoolFieldCondition"),
                    }),
                    z.object({
                      fieldId: z.object({
                        type: FieldTypeSchema,
                        id: z.string().nullable(),
                      }),
                      multipleOperator: MultipleOperatorSchema,
                      multipleValue: z.array(z.unknown()),
                      __typename: z.literal("MultipleFieldCondition"),
                    }),
                    z.object({
                      fieldId: z.object({
                        type: FieldTypeSchema,
                        id: z.string().nullable(),
                      }),
                      nullableOperator: NullableOperatorSchema,
                      __typename: z.literal("NullableFieldCondition"),
                    }),
                    z.object({
                      fieldId: z.object({
                        type: FieldTypeSchema,
                        id: z.string().nullable(),
                      }),
                      numberOperator: NumberOperatorSchema,
                      numberValue: z.number(),
                      __typename: z.literal("NumberFieldCondition"),
                    }),
                    z.object({
                      __typename: z.literal("OrCondition"),
                    }),
                    z.object({
                      fieldId: z.object({
                        type: FieldTypeSchema,
                        id: z.string().nullable(),
                      }),
                      stringOperator: StringOperatorSchema,
                      stringValue: z.string(),
                      __typename: z.literal("StringFieldCondition"),
                    }),
                    z.object({
                      fieldId: z.object({
                        type: FieldTypeSchema,
                        id: z.string().nullable(),
                      }),
                      timeOperator: TimeOperatorSchema,
                      timeValue: z.string(),
                      __typename: z.literal("TimeFieldCondition"),
                    }),
                  ]),
                ),
              }),
              z.object({}),
              z.object({}),
              z.object({}),
              z.object({}),
              z.object({}),
              z.object({}),
              z.object({}),
              z.object({}),
            ])
            .nullable(),
          __typename: z.literal("View"),
        }),
      })
      .nullable(),
  });
}

export function DeleteViewMutationSchema() {
  return z.object({
    deleteView: z
      .object({
        viewId: z.string(),
      })
      .nullable(),
  });
}

export function UpdateViewsOrderMutationSchema() {
  return z.object({
    updateViewsOrder: z
      .object({
        views: z.array(
          z.object({
            id: z.string(),
          }),
        ),
      })
      .nullable(),
  });
}

export function CreateWebhookMutationSchema() {
  return z.object({
    createWebhook: z
      .object({
        webhook: z.object({
          id: z.string(),
          name: z.string(),
          url: z.string(),
          active: z.boolean(),
          trigger: z.object({
            onItemCreate: z.boolean().nullable(),
            onItemUpdate: z.boolean().nullable(),
            onItemDelete: z.boolean().nullable(),
            onItemPublish: z.boolean().nullable(),
            onItemUnPublish: z.boolean().nullable(),
            onAssetUpload: z.boolean().nullable(),
            onAssetDecompress: z.boolean().nullable(),
            onAssetDelete: z.boolean().nullable(),
          }),
          secret: z.string(),
          createdAt: z.string(),
          updatedAt: z.string(),
        }),
      })
      .nullable(),
  });
}

export function UpdateWebhookMutationSchema() {
  return z.object({
    updateWebhook: z
      .object({
        webhook: z.object({
          id: z.string(),
          name: z.string(),
          url: z.string(),
          active: z.boolean(),
          trigger: z.object({
            onItemCreate: z.boolean().nullable(),
            onItemUpdate: z.boolean().nullable(),
            onItemDelete: z.boolean().nullable(),
            onItemPublish: z.boolean().nullable(),
            onItemUnPublish: z.boolean().nullable(),
            onAssetUpload: z.boolean().nullable(),
            onAssetDecompress: z.boolean().nullable(),
            onAssetDelete: z.boolean().nullable(),
          }),
          secret: z.string(),
          createdAt: z.string(),
          updatedAt: z.string(),
        }),
      })
      .nullable(),
  });
}

export function DeleteWebhookMutationSchema() {
  return z.object({
    deleteWebhook: z
      .object({
        webhookId: z.string(),
      })
      .nullable(),
  });
}

export function GetWorkspacesQuerySchema() {
  return z.object({
    me: z
      .object({
        id: z.string(),
        name: z.string(),
        myWorkspace: z
          .object({
            id: z.string(),
            name: z.string(),
            alias: z.string().nullable(),
            members: z.array(
              z.union([
                z.object({
                  integrationId: z.string(),
                  integration: z
                    .object({
                      id: z.string(),
                      name: z.string(),
                      description: z.string().nullable(),
                      logoUrl: z.string(),
                      iType: IntegrationTypeSchema,
                      developerId: z.string(),
                      developer: z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                      }),
                      config: z
                        .object({
                          token: z.string(),
                          webhooks: z.array(
                            z.object({
                              id: z.string(),
                              name: z.string(),
                              url: z.string(),
                              active: z.boolean(),
                              secret: z.string(),
                              trigger: z.object({
                                onItemCreate: z.boolean().nullable(),
                                onItemUpdate: z.boolean().nullable(),
                                onItemDelete: z.boolean().nullable(),
                                onItemPublish: z.boolean().nullable(),
                                onItemUnPublish: z.boolean().nullable(),
                                onAssetUpload: z.boolean().nullable(),
                                onAssetDecompress: z.boolean().nullable(),
                                onAssetDelete: z.boolean().nullable(),
                              }),
                              createdAt: z.string(),
                              updatedAt: z.string(),
                            }),
                          ),
                        })
                        .nullable(),
                      createdAt: z.string(),
                      updatedAt: z.string(),
                    })
                    .nullable(),
                  role: RoleSchema,
                  active: z.boolean(),
                  invitedBy: z
                    .object({
                      id: z.string(),
                      name: z.string(),
                      email: z.string(),
                    })
                    .nullable(),
                  invitedById: z.string(),
                }),
                z.object({
                  user: z
                    .object({
                      id: z.string(),
                      name: z.string(),
                      email: z.string(),
                    })
                    .nullable(),
                  userId: z.string(),
                  role: RoleSchema,
                }),
              ]),
            ),
            personal: z.boolean(),
          })
          .nullable(),
        workspaces: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            alias: z.string().nullable(),
            members: z.array(
              z.union([
                z.object({
                  integrationId: z.string(),
                  integration: z
                    .object({
                      id: z.string(),
                      name: z.string(),
                      description: z.string().nullable(),
                      logoUrl: z.string(),
                      iType: IntegrationTypeSchema,
                      developerId: z.string(),
                      developer: z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                      }),
                      config: z
                        .object({
                          token: z.string(),
                          webhooks: z.array(
                            z.object({
                              id: z.string(),
                              name: z.string(),
                              url: z.string(),
                              active: z.boolean(),
                              secret: z.string(),
                              trigger: z.object({
                                onItemCreate: z.boolean().nullable(),
                                onItemUpdate: z.boolean().nullable(),
                                onItemDelete: z.boolean().nullable(),
                                onItemPublish: z.boolean().nullable(),
                                onItemUnPublish: z.boolean().nullable(),
                                onAssetUpload: z.boolean().nullable(),
                                onAssetDecompress: z.boolean().nullable(),
                                onAssetDelete: z.boolean().nullable(),
                              }),
                              createdAt: z.string(),
                              updatedAt: z.string(),
                            }),
                          ),
                        })
                        .nullable(),
                      createdAt: z.string(),
                      updatedAt: z.string(),
                    })
                    .nullable(),
                  role: RoleSchema,
                  active: z.boolean(),
                  invitedBy: z
                    .object({
                      id: z.string(),
                      name: z.string(),
                      email: z.string(),
                    })
                    .nullable(),
                  invitedById: z.string(),
                }),
                z.object({
                  user: z
                    .object({
                      id: z.string(),
                      name: z.string(),
                      email: z.string(),
                    })
                    .nullable(),
                  userId: z.string(),
                  role: RoleSchema,
                }),
              ]),
            ),
            personal: z.boolean(),
          }),
        ),
      })
      .nullable(),
  });
}

export function GetWorkspaceQuerySchema() {
  return z.object({
    node: z
      .union([
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({}),
        z.object({
          id: z.string(),
          name: z.string(),
          alias: z.string().nullable(),
          members: z.array(
            z.union([
              z.object({
                integrationId: z.string(),
                integration: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    description: z.string().nullable(),
                    logoUrl: z.string(),
                    iType: IntegrationTypeSchema,
                    developerId: z.string(),
                    developer: z.object({
                      id: z.string(),
                      name: z.string(),
                      email: z.string(),
                    }),
                    config: z
                      .object({
                        token: z.string(),
                        webhooks: z.array(
                          z.object({
                            id: z.string(),
                            name: z.string(),
                            url: z.string(),
                            active: z.boolean(),
                            secret: z.string(),
                            trigger: z.object({
                              onItemCreate: z.boolean().nullable(),
                              onItemUpdate: z.boolean().nullable(),
                              onItemDelete: z.boolean().nullable(),
                              onItemPublish: z.boolean().nullable(),
                              onItemUnPublish: z.boolean().nullable(),
                              onAssetUpload: z.boolean().nullable(),
                              onAssetDecompress: z.boolean().nullable(),
                              onAssetDelete: z.boolean().nullable(),
                            }),
                            createdAt: z.string(),
                            updatedAt: z.string(),
                          }),
                        ),
                      })
                      .nullable(),
                    createdAt: z.string(),
                    updatedAt: z.string(),
                  })
                  .nullable(),
                role: RoleSchema,
                active: z.boolean(),
                invitedBy: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable(),
                invitedById: z.string(),
              }),
              z.object({
                user: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable(),
                userId: z.string(),
                role: RoleSchema,
              }),
            ]),
          ),
          personal: z.boolean(),
        }),
        z.object({}),
      ])
      .nullable(),
  });
}

export function UpdateWorkspaceMutationSchema() {
  return z.object({
    updateWorkspace: z
      .object({
        workspace: z.object({
          id: z.string(),
          name: z.string(),
          alias: z.string().nullable(),
          members: z.array(
            z.union([
              z.object({
                integrationId: z.string(),
                integration: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    description: z.string().nullable(),
                    logoUrl: z.string(),
                    iType: IntegrationTypeSchema,
                    developerId: z.string(),
                    developer: z.object({
                      id: z.string(),
                      name: z.string(),
                      email: z.string(),
                    }),
                    config: z
                      .object({
                        token: z.string(),
                        webhooks: z.array(
                          z.object({
                            id: z.string(),
                            name: z.string(),
                            url: z.string(),
                            active: z.boolean(),
                            secret: z.string(),
                            trigger: z.object({
                              onItemCreate: z.boolean().nullable(),
                              onItemUpdate: z.boolean().nullable(),
                              onItemDelete: z.boolean().nullable(),
                              onItemPublish: z.boolean().nullable(),
                              onItemUnPublish: z.boolean().nullable(),
                              onAssetUpload: z.boolean().nullable(),
                              onAssetDecompress: z.boolean().nullable(),
                              onAssetDelete: z.boolean().nullable(),
                            }),
                            createdAt: z.string(),
                            updatedAt: z.string(),
                          }),
                        ),
                      })
                      .nullable(),
                    createdAt: z.string(),
                    updatedAt: z.string(),
                  })
                  .nullable(),
                role: RoleSchema,
                active: z.boolean(),
                invitedBy: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable(),
                invitedById: z.string(),
              }),
              z.object({
                user: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable(),
                userId: z.string(),
                role: RoleSchema,
              }),
            ]),
          ),
          personal: z.boolean(),
        }),
      })
      .nullable(),
  });
}

export function DeleteWorkspaceMutationSchema() {
  return z.object({
    deleteWorkspace: z
      .object({
        workspaceId: z.string(),
      })
      .nullable(),
  });
}

export function AddUsersToWorkspaceMutationSchema() {
  return z.object({
    addUsersToWorkspace: z
      .object({
        workspace: z.object({
          id: z.string(),
          name: z.string(),
          alias: z.string().nullable(),
          members: z.array(
            z.union([
              z.object({
                integrationId: z.string(),
                integration: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    description: z.string().nullable(),
                    logoUrl: z.string(),
                    iType: IntegrationTypeSchema,
                    developerId: z.string(),
                    developer: z.object({
                      id: z.string(),
                      name: z.string(),
                      email: z.string(),
                    }),
                    config: z
                      .object({
                        token: z.string(),
                        webhooks: z.array(
                          z.object({
                            id: z.string(),
                            name: z.string(),
                            url: z.string(),
                            active: z.boolean(),
                            secret: z.string(),
                            trigger: z.object({
                              onItemCreate: z.boolean().nullable(),
                              onItemUpdate: z.boolean().nullable(),
                              onItemDelete: z.boolean().nullable(),
                              onItemPublish: z.boolean().nullable(),
                              onItemUnPublish: z.boolean().nullable(),
                              onAssetUpload: z.boolean().nullable(),
                              onAssetDecompress: z.boolean().nullable(),
                              onAssetDelete: z.boolean().nullable(),
                            }),
                            createdAt: z.string(),
                            updatedAt: z.string(),
                          }),
                        ),
                      })
                      .nullable(),
                    createdAt: z.string(),
                    updatedAt: z.string(),
                  })
                  .nullable(),
                role: RoleSchema,
                active: z.boolean(),
                invitedBy: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable(),
                invitedById: z.string(),
              }),
              z.object({
                user: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable(),
                userId: z.string(),
                role: RoleSchema,
              }),
            ]),
          ),
          personal: z.boolean(),
        }),
      })
      .nullable(),
  });
}

export function UpdateMemberOfWorkspaceMutationSchema() {
  return z.object({
    updateUserOfWorkspace: z
      .object({
        workspace: z.object({
          id: z.string(),
          name: z.string(),
          alias: z.string().nullable(),
          members: z.array(
            z.union([
              z.object({
                integrationId: z.string(),
                integration: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    description: z.string().nullable(),
                    logoUrl: z.string(),
                    iType: IntegrationTypeSchema,
                    developerId: z.string(),
                    developer: z.object({
                      id: z.string(),
                      name: z.string(),
                      email: z.string(),
                    }),
                    config: z
                      .object({
                        token: z.string(),
                        webhooks: z.array(
                          z.object({
                            id: z.string(),
                            name: z.string(),
                            url: z.string(),
                            active: z.boolean(),
                            secret: z.string(),
                            trigger: z.object({
                              onItemCreate: z.boolean().nullable(),
                              onItemUpdate: z.boolean().nullable(),
                              onItemDelete: z.boolean().nullable(),
                              onItemPublish: z.boolean().nullable(),
                              onItemUnPublish: z.boolean().nullable(),
                              onAssetUpload: z.boolean().nullable(),
                              onAssetDecompress: z.boolean().nullable(),
                              onAssetDelete: z.boolean().nullable(),
                            }),
                            createdAt: z.string(),
                            updatedAt: z.string(),
                          }),
                        ),
                      })
                      .nullable(),
                    createdAt: z.string(),
                    updatedAt: z.string(),
                  })
                  .nullable(),
                role: RoleSchema,
                active: z.boolean(),
                invitedBy: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable(),
                invitedById: z.string(),
              }),
              z.object({
                user: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable(),
                userId: z.string(),
                role: RoleSchema,
              }),
            ]),
          ),
          personal: z.boolean(),
        }),
      })
      .nullable(),
  });
}

export function RemoveMultipleMembersFromWorkspaceMutationSchema() {
  return z.object({
    removeMultipleMembersFromWorkspace: z
      .object({
        workspace: z.object({
          id: z.string(),
          name: z.string(),
          alias: z.string().nullable(),
          members: z.array(
            z.union([
              z.object({
                integrationId: z.string(),
                integration: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    description: z.string().nullable(),
                    logoUrl: z.string(),
                    iType: IntegrationTypeSchema,
                    developerId: z.string(),
                    developer: z.object({
                      id: z.string(),
                      name: z.string(),
                      email: z.string(),
                    }),
                    config: z
                      .object({
                        token: z.string(),
                        webhooks: z.array(
                          z.object({
                            id: z.string(),
                            name: z.string(),
                            url: z.string(),
                            active: z.boolean(),
                            secret: z.string(),
                            trigger: z.object({
                              onItemCreate: z.boolean().nullable(),
                              onItemUpdate: z.boolean().nullable(),
                              onItemDelete: z.boolean().nullable(),
                              onItemPublish: z.boolean().nullable(),
                              onItemUnPublish: z.boolean().nullable(),
                              onAssetUpload: z.boolean().nullable(),
                              onAssetDecompress: z.boolean().nullable(),
                              onAssetDelete: z.boolean().nullable(),
                            }),
                            createdAt: z.string(),
                            updatedAt: z.string(),
                          }),
                        ),
                      })
                      .nullable(),
                    createdAt: z.string(),
                    updatedAt: z.string(),
                  })
                  .nullable(),
                role: RoleSchema,
                active: z.boolean(),
                invitedBy: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable(),
                invitedById: z.string(),
              }),
              z.object({
                user: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable(),
                userId: z.string(),
                role: RoleSchema,
              }),
            ]),
          ),
          personal: z.boolean(),
        }),
      })
      .nullable(),
  });
}

export function AddIntegrationToWorkspaceMutationSchema() {
  return z.object({
    addIntegrationToWorkspace: z
      .object({
        workspace: z.object({
          id: z.string(),
          name: z.string(),
          alias: z.string().nullable(),
          members: z.array(
            z.union([
              z.object({
                integrationId: z.string(),
                integration: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    description: z.string().nullable(),
                    logoUrl: z.string(),
                    iType: IntegrationTypeSchema,
                    developerId: z.string(),
                    developer: z.object({
                      id: z.string(),
                      name: z.string(),
                      email: z.string(),
                    }),
                    config: z
                      .object({
                        token: z.string(),
                        webhooks: z.array(
                          z.object({
                            id: z.string(),
                            name: z.string(),
                            url: z.string(),
                            active: z.boolean(),
                            secret: z.string(),
                            trigger: z.object({
                              onItemCreate: z.boolean().nullable(),
                              onItemUpdate: z.boolean().nullable(),
                              onItemDelete: z.boolean().nullable(),
                              onItemPublish: z.boolean().nullable(),
                              onItemUnPublish: z.boolean().nullable(),
                              onAssetUpload: z.boolean().nullable(),
                              onAssetDecompress: z.boolean().nullable(),
                              onAssetDelete: z.boolean().nullable(),
                            }),
                            createdAt: z.string(),
                            updatedAt: z.string(),
                          }),
                        ),
                      })
                      .nullable(),
                    createdAt: z.string(),
                    updatedAt: z.string(),
                  })
                  .nullable(),
                role: RoleSchema,
                active: z.boolean(),
                invitedBy: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable(),
                invitedById: z.string(),
              }),
              z.object({
                user: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable(),
                userId: z.string(),
                role: RoleSchema,
              }),
            ]),
          ),
          personal: z.boolean(),
        }),
      })
      .nullable(),
  });
}

export function UpdateIntegrationOfWorkspaceMutationSchema() {
  return z.object({
    updateIntegrationOfWorkspace: z
      .object({
        workspace: z.object({
          id: z.string(),
          name: z.string(),
          alias: z.string().nullable(),
          members: z.array(
            z.union([
              z.object({
                integrationId: z.string(),
                integration: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    description: z.string().nullable(),
                    logoUrl: z.string(),
                    iType: IntegrationTypeSchema,
                    developerId: z.string(),
                    developer: z.object({
                      id: z.string(),
                      name: z.string(),
                      email: z.string(),
                    }),
                    config: z
                      .object({
                        token: z.string(),
                        webhooks: z.array(
                          z.object({
                            id: z.string(),
                            name: z.string(),
                            url: z.string(),
                            active: z.boolean(),
                            secret: z.string(),
                            trigger: z.object({
                              onItemCreate: z.boolean().nullable(),
                              onItemUpdate: z.boolean().nullable(),
                              onItemDelete: z.boolean().nullable(),
                              onItemPublish: z.boolean().nullable(),
                              onItemUnPublish: z.boolean().nullable(),
                              onAssetUpload: z.boolean().nullable(),
                              onAssetDecompress: z.boolean().nullable(),
                              onAssetDelete: z.boolean().nullable(),
                            }),
                            createdAt: z.string(),
                            updatedAt: z.string(),
                          }),
                        ),
                      })
                      .nullable(),
                    createdAt: z.string(),
                    updatedAt: z.string(),
                  })
                  .nullable(),
                role: RoleSchema,
                active: z.boolean(),
                invitedBy: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable(),
                invitedById: z.string(),
              }),
              z.object({
                user: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable(),
                userId: z.string(),
                role: RoleSchema,
              }),
            ]),
          ),
          personal: z.boolean(),
        }),
      })
      .nullable(),
  });
}

export function RemoveIntegrationFromWorkspaceMutationSchema() {
  return z.object({
    removeIntegrationFromWorkspace: z
      .object({
        workspace: z.object({
          id: z.string(),
          name: z.string(),
          alias: z.string().nullable(),
          members: z.array(
            z.union([
              z.object({
                integrationId: z.string(),
                integration: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    description: z.string().nullable(),
                    logoUrl: z.string(),
                    iType: IntegrationTypeSchema,
                    developerId: z.string(),
                    developer: z.object({
                      id: z.string(),
                      name: z.string(),
                      email: z.string(),
                    }),
                    config: z
                      .object({
                        token: z.string(),
                        webhooks: z.array(
                          z.object({
                            id: z.string(),
                            name: z.string(),
                            url: z.string(),
                            active: z.boolean(),
                            secret: z.string(),
                            trigger: z.object({
                              onItemCreate: z.boolean().nullable(),
                              onItemUpdate: z.boolean().nullable(),
                              onItemDelete: z.boolean().nullable(),
                              onItemPublish: z.boolean().nullable(),
                              onItemUnPublish: z.boolean().nullable(),
                              onAssetUpload: z.boolean().nullable(),
                              onAssetDecompress: z.boolean().nullable(),
                              onAssetDelete: z.boolean().nullable(),
                            }),
                            createdAt: z.string(),
                            updatedAt: z.string(),
                          }),
                        ),
                      })
                      .nullable(),
                    createdAt: z.string(),
                    updatedAt: z.string(),
                  })
                  .nullable(),
                role: RoleSchema,
                active: z.boolean(),
                invitedBy: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable(),
                invitedById: z.string(),
              }),
              z.object({
                user: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable(),
                userId: z.string(),
                role: RoleSchema,
              }),
            ]),
          ),
          personal: z.boolean(),
        }),
      })
      .nullable(),
  });
}

export function CreateWorkspaceMutationSchema() {
  return z.object({
    createWorkspace: z
      .object({
        workspace: z.object({
          id: z.string(),
          name: z.string(),
          alias: z.string().nullable(),
          members: z.array(
            z.union([
              z.object({
                integrationId: z.string(),
                integration: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    description: z.string().nullable(),
                    logoUrl: z.string(),
                    iType: IntegrationTypeSchema,
                    developerId: z.string(),
                    developer: z.object({
                      id: z.string(),
                      name: z.string(),
                      email: z.string(),
                    }),
                    config: z
                      .object({
                        token: z.string(),
                        webhooks: z.array(
                          z.object({
                            id: z.string(),
                            name: z.string(),
                            url: z.string(),
                            active: z.boolean(),
                            secret: z.string(),
                            trigger: z.object({
                              onItemCreate: z.boolean().nullable(),
                              onItemUpdate: z.boolean().nullable(),
                              onItemDelete: z.boolean().nullable(),
                              onItemPublish: z.boolean().nullable(),
                              onItemUnPublish: z.boolean().nullable(),
                              onAssetUpload: z.boolean().nullable(),
                              onAssetDecompress: z.boolean().nullable(),
                              onAssetDelete: z.boolean().nullable(),
                            }),
                            createdAt: z.string(),
                            updatedAt: z.string(),
                          }),
                        ),
                      })
                      .nullable(),
                    createdAt: z.string(),
                    updatedAt: z.string(),
                  })
                  .nullable(),
                role: RoleSchema,
                active: z.boolean(),
                invitedBy: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable(),
                invitedById: z.string(),
              }),
              z.object({
                user: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable(),
                userId: z.string(),
                role: RoleSchema,
              }),
            ]),
          ),
          personal: z.boolean(),
        }),
      })
      .nullable(),
  });
}

export function GetWorkspaceSettingsQuerySchema() {
  return z.object({
    node: z
      .union([
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
        }),
        z.object({
          id: z.string(),
          tiles: z
            .object({
              resources: z.array(
                z.union([
                  z.object({}),
                  z.object({
                    id: z.string(),
                    type: TileTypeSchema,
                    props: z
                      .object({
                        name: z.string(),
                        url: z.string(),
                        image: z.string(),
                      })
                      .nullable(),
                  }),
                ]),
              ),
              enabled: z.boolean().nullable(),
              selectedResource: z.string().nullable(),
            })
            .nullable(),
          terrains: z
            .object({
              resources: z.array(
                z.union([
                  z.object({
                    id: z.string(),
                    type: TerrainTypeSchema,
                    props: z
                      .object({
                        name: z.string(),
                        url: z.string(),
                        image: z.string(),
                        cesiumIonAssetId: z.string(),
                        cesiumIonAccessToken: z.string(),
                      })
                      .nullable(),
                  }),
                  z.object({}),
                ]),
              ),
              enabled: z.boolean().nullable(),
              selectedResource: z.string().nullable(),
            })
            .nullable(),
        }),
      ])
      .nullable(),
  });
}

export function UpdateWorkspaceSettingsMutationSchema() {
  return z.object({
    updateWorkspaceSettings: z
      .object({
        workspaceSettings: z.object({
          id: z.string(),
          tiles: z
            .object({
              resources: z.array(
                z.union([
                  z.object({}),
                  z.object({
                    id: z.string(),
                    type: TileTypeSchema,
                    props: z
                      .object({
                        name: z.string(),
                        url: z.string(),
                        image: z.string(),
                      })
                      .nullable(),
                  }),
                ]),
              ),
              enabled: z.boolean().nullable(),
              selectedResource: z.string().nullable(),
            })
            .nullable(),
          terrains: z
            .object({
              resources: z.array(
                z.union([
                  z.object({
                    id: z.string(),
                    type: TerrainTypeSchema,
                    props: z
                      .object({
                        name: z.string(),
                        url: z.string(),
                        image: z.string(),
                        cesiumIonAssetId: z.string(),
                        cesiumIonAccessToken: z.string(),
                      })
                      .nullable(),
                  }),
                  z.object({}),
                ]),
              ),
              enabled: z.boolean().nullable(),
              selectedResource: z.string().nullable(),
            })
            .nullable(),
        }),
      })
      .nullable(),
  });
}
