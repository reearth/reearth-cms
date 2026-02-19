/* eslint-disable @typescript-eslint/no-extraneous-class */
import { render } from "@testing-library/react";
import {
  GeoJSONGeometryCollection,
  GeoJSONLineString,
  GeoJSONMultiPoint,
  GeoJSONMultiPolygon,
  GeoJSONPoint,
  GeoJSONPolygon,
} from "zod-geojson";

import { RcFile } from "@reearth-cms/components/atoms/Upload";
import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";

// override render export
const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    // wrap provider(s) here if needed
    wrapper: ({ children }) => children,
    ...options,
  });

export { customRender as render };
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";

export abstract class Test {
  public static createMockRcFile(
    options: { name?: string; type?: string; uid?: string } = {},
  ): RcFile {
    const { name = "test-file.png", type = "image/png", uid = "-1" } = options;

    const file = new File(["file content"], name, { type });

    const rcFile = file as RcFile;
    rcFile.uid = uid;
    return rcFile;
  }

  public static readonly IMPORT = {
    TEST_MAX_CONTENT_RECORDS: 1,
  };

  public static readonly GEO_JSON_POINT: GeoJSONPoint = {
    type: "Point",
    coordinates: [139.6917, 35.6895],
  };

  public static readonly GEO_JSON_MULTI_POINT: GeoJSONMultiPoint = {
    type: "MultiPoint",
    coordinates: [
      [139.6917, 35.6895],
      [139.7673, 35.6812],
      [139.7514, 35.6938],
    ],
  };

  public static readonly GEO_JSON_LINE_STRING: GeoJSONLineString = {
    type: "LineString",
    coordinates: [
      [139.6917, 35.6895],
      [139.7673, 35.6812],
      [139.7514, 35.6938],
      [139.7026, 35.658],
    ],
  };

  public static readonly GEO_JSON_MULTI_LINE_STRING = {
    type: "MultiLineString",
    coordinates: [
      [
        [139.6917, 35.6895],
        [139.7673, 35.6812],
      ],
      [
        [139.7514, 35.6938],
        [139.7026, 35.658],
      ],
    ],
  };

  public static readonly GEO_JSON_POLYGON: GeoJSONPolygon = {
    type: "Polygon",
    coordinates: [
      [
        [139.6917, 35.6895],
        [139.7673, 35.6812],
        [139.7514, 35.6938],
        [139.7026, 35.658],
        [139.6917, 35.6895],
      ],
    ],
  };

  public static readonly GEO_JSON_MULTI_POLYGON: GeoJSONMultiPolygon = {
    type: "MultiPolygon",
    coordinates: [
      [
        [
          [102.0, 2.0],
          [103.0, 2.0],
          [103.0, 3.0],
          [102.0, 3.0],
          [102.0, 2.0],
        ],
      ],
      [
        [
          [100.0, 0.0],
          [101.0, 0.0],
          [101.0, 1.0],
          [100.0, 1.0],
          [100.0, 0.0],
        ],
        [
          [100.2, 0.2],
          [100.8, 0.2],
          [100.8, 0.8],
          [100.2, 0.8],
          [100.2, 0.2],
        ],
      ],
    ],
  };

  public static readonly GEO_JSON_GEO_COLLECTION: GeoJSONGeometryCollection = {
    type: "GeometryCollection",
    geometries: [
      { type: "Point", coordinates: [100.0, 0.0] },
      {
        type: "LineString",
        coordinates: [
          [101.0, 0.0],
          [102.0, 1.0],
        ],
      },
    ],
  };

  public static getDataTestIdFromSchemaFieldType(fieldType: SchemaFieldType) {
    switch (fieldType) {
      case SchemaFieldType.Text:
        return DATA_TEST_ID.FieldList__Text;
      case SchemaFieldType.TextArea:
        return DATA_TEST_ID.FieldList__TextArea;
      case SchemaFieldType.MarkdownText:
        return DATA_TEST_ID.FieldList__MarkdownText;
      case SchemaFieldType.Asset:
        return DATA_TEST_ID.FieldList__Asset;
      case SchemaFieldType.Date:
        return DATA_TEST_ID.FieldList__Date;
      case SchemaFieldType.Bool:
        return DATA_TEST_ID.FieldList__Bool;
      case SchemaFieldType.Select:
        return DATA_TEST_ID.FieldList__Select;
      case SchemaFieldType.Tag:
        return DATA_TEST_ID.FieldList__Tag;
      case SchemaFieldType.Integer:
        return DATA_TEST_ID.FieldList__Integer;
      case SchemaFieldType.Number:
        return DATA_TEST_ID.FieldList__Number;
      case SchemaFieldType.Reference:
        return DATA_TEST_ID.FieldList__Reference;
      case SchemaFieldType.Checkbox:
        return DATA_TEST_ID.FieldList__Checkbox;
      case SchemaFieldType.URL:
        return DATA_TEST_ID.FieldList__URL;
      case SchemaFieldType.Group:
        return DATA_TEST_ID.FieldList__Group;
      case SchemaFieldType.GeometryObject:
        return DATA_TEST_ID.FieldList__GeometryObject;
      case SchemaFieldType.GeometryEditor:
        return DATA_TEST_ID.FieldList__GeometryEditor;
    }
  }
}

// NOTE: use enum instead of object, easier for checking duplicate keys & values at the same time
// Naming convention: Component__Element (inspired by BEM with PascalCase)
export enum DATA_TEST_ID {
  // ModelCard
  ModelCard__UtilDropdownIcon = "ModelCard__UtilDropdownIcon",

  ModelCard__UtilDropdownEdit = "ModelCard__UtilDropdownEdit",
  ModelCard__UtilDropdownImport = "ModelCard__UtilDropdownImport",
  ModelCard__UtilDropdownExport = "ModelCard__UtilDropdownExport",
  ModelCard__UtilDropdownDelete = "ModelCard__UtilDropdownDelete",

  ModelCard__UtilDropdownImportSchema = "ModelCard__UtilDropdownImportSchema",
  ModelCard__UtilDropdownImportContent = "ModelCard__UtilDropdownImportContent",

  ModelCard__UtilDropdownExportSchema = "ModelCard__UtilDropdownExportSchema",
  ModelCard__UtilDropdownExportContentJSON = "ModelCard__UtilDropdownExportContentJSON",
  ModelCard__UtilDropdownExportContentCSV = "ModelCard__UtilDropdownExportContentCSV",
  ModelCard__UtilDropdownExportContentGeoJSON = "ModelCard__UtilDropdownExportContentGeoJSON",

  // Schema
  Schema__ImportSchemaButton = "Schema__ImportSchemaButton",

  // ModelFieldList
  ModelFieldList__ImportSchemaButton = "ImportSchemaOuterButton",

  // FileSelectionStep
  FileSelectionStep__FileSelectLoadingWrapper = "FileSelectionStep__FileSelectLoadingWrapper",
  FileSelectionStep__FileSelect = "FileSelectionStep__FileSelect",

  // SchemaPreviewStep
  SchemaPreviewStep__Wrapper = "SchemaPreviewStep__Wrapper",
  SchemaPreviewStep__PreviewFieldList = "SchemaPreviewStep__PreviewFieldList",
  SchemaPreviewStep__PreviewSkipCheckbox = "SchemaPreviewStep__PreviewSkipCheckbox",
  SchemaPreviewStep__PreviewSkipAllCheckbox = "SchemaPreviewStep__PreviewSkipAllCheckbox",

  // ImportSchemaModal
  ImportSchemaModal__ImportButton = "ImportSchemaModal__ImportButton",

  // Import content modal
  ContentImportModal__FileSelect = "ContentImportModal__FileSelect",
  ContentImportModal__LoadingWrapper = "ContentImportModal__LoadingWrapper",
  ContentImportModal__ErrorWrapper = "ContentImportModal__ErrorWrapper",
  ContentImportModal__ErrorIcon = "ContentImportModal__ErrorIcon",
  ContentImportModal__ErrorTitle = "ContentImportModal__ErrorTitle",
  ContentImportModal__ErrorDescription = "ContentImportModal__ErrorDescription",
  ContentImportModal__ErrorHint = "ContentImportModal__ErrorHint",

  // Uploader component
  Uploader__Wrapper = "Uploader__Wrapper",
  Uploader__UploadIcon = "Uploader__UploadIcon",
  Uploader__Card = "Uploader__Card",
  Uploader__CardHead = "Uploader__CardHead",
  Uploader__CardBody = "Uploader__CardBody",
  Uploader__CardTitle = "Uploader__CardTitle",
  Uploader__CardTitleSuffix = "Uploader__CardTitleSuffix",
  Uploader__CancelAllIcon = "Uploader__CancelAllIcon",
  Uploader__CompleteIcon = "Uploader__CompleteIcon",

  // QueueItem
  QueueItem__Wrapper = "QueueItem__Wrapper",
  QueueItem__RetryIcon = "QueueItem__RetryIcon",
  QueueItem__CancelIcon = "QueueItem__CancelIcon",
  QueueItem__ErrorIcon = "QueueItem__ErrorIcon",
  QueueItem__ProgressBar = "QueueItem__ProgressBar",
  QueueItem__FileLink = "QueueItem__FileLink",
  QueueItem__ErrorMessage = "QueueItem__ErrorMessage",

  // WorkspaceHeader
  WorkspaceHeader__ProjectSortSelect = "WorkspaceHeader__ProjectSortSelect",

  // Versions
  Versions__RequestStatus = "Versions__RequestStatus",

  // Form (MyIntegrations)
  MyIntegrations__Settings__Form__TokenCopyButton = "MyIntegrations__Settings__Form__TokenCopyButton",
  MyIntegrations__Settings__Form__CodeExampleCopyButton = "MyIntegrations__Settings__Form__CodeExampleCopyButton",

  //  DangerZone (MyIntegrations)
  MyIntegrations__Settings__DangerZone__RemoveIntegrationButton = "MyIntegrations__Settings__DangerZone__RemoveIntegrationButton",
  MyIntegrations__Settings__DangerZone__ConfirmRemoveIntegrationButton = "MyIntegrations__Settings__DangerZone__ConfirmRemoveIntegrationButton",

  // ProjectSettings GeneralForm
  ProjectSettings__GeneralForm__NameInput = "ProjectSettings__GeneralForm__NameInput",
  ProjectSettings__GeneralForm__AliasInput = "ProjectSettings__GeneralForm__AliasInput",
  ProjectSettings__GeneralForm__DescriptionInput = "ProjectSettings__GeneralForm__DescriptionInput",
  ProjectSettings__GeneralForm__AliasField = "ProjectSettings__GeneralForm__AliasField",
  ProjectSettings__GeneralForm__SaveButton = "ProjectSettings__GeneralForm__SaveButton",

  // ProjectSettings RequestOptions
  ProjectSettings__RequestOptions__SaveButton = "ProjectSettings__RequestOptions__SaveButton",

  // DangerZone (ProjectSettings)
  ProjectSettings__DangerZone__DeleteProjectButton = "ProjectSettings__DangerZone__DeleteProjectButton",
  ProjectSettings__DangerZone__ConfirmDeleteProjectButton = "ProjectSettings__DangerZone__ConfirmDeleteProjectButton",

  // ModelFieldList
  ModelFieldList__ConfirmDeleteFieldButton = "ModelFieldList__ConfirmDeleteFieldButton",

  // FieldList
  FieldList__Text = "FieldList__Text",
  FieldList__TextArea = "FieldList__TextArea",
  FieldList__MarkdownText = "FieldLIst__MarkdownText",
  FieldList__Asset = "FieldList__Asset",
  FieldList__Date = "FieldList__Date",
  FieldList__Bool = "FieldList__Bool",
  FieldList__Select = "FieldList__Select",
  FieldList__Tag = "FieldList__Tag",
  FieldList__Integer = "FieldList__Integer",
  FieldList__Number = "FieldList__Number",
  FieldList__Reference = "FieldList__Reference",
  FieldList__Checkbox = "FieldList__Checkbox",
  FieldList__URL = "FieldList__URL",
  FieldList__Group = "FieldList__Group",
  FieldList__GeometryObject = "FieldList__GeometryObject",
  FieldList__GeometryEditor = "FieldList__GeometryEditor",

  // Content list page
  Content__List__ImportContentButton = "Content__List__ImportContentButton",
  Content__List__ItemFieldPopoverIcon = "Content__List__ItemFieldPopoverIcon",
  Content__List__ItemFieldPopoverContent = "Content__List__ItemFieldPopoverContent",

  // WorkspaceMenu
  WorkspaceMenu__HomeItem = "WorkspaceMenu__HomeItem",
  WorkspaceMenu__MemberItem = "WorkspaceMenu__MemberItem",
  WorkspaceMenu__IntegrationsItem = "WorkspaceMenu__IntegrationsItem",
  WorkspaceMenu__MyIntegrationsItem = "WorkspaceMenu__MyIntegrationsItem",
  WorkspaceMenu__SettingsItem = "WorkspaceMenu__SettingsItem",
  WorkspaceMenu__WorkspaceSettingsItem = "WorkspaceMenu__WorkspaceSettingsItem",
  WorkspaceMenu__AccountSettingsItem = "WorkspaceMenu__AccountSettingsItem",

  // MemberTable
  MemberTable__Search = "MemberTable__Search",

  // AssetList
  AssetList__UploadButton = "AssetList__UploadButton",
  AssetList__DownloadButton = "AssetList__DownloadButton",
  AssetList__DeleteButton = "AssetList__DeleteButton",
  AssetList__EditIcon = "AssetList__EditIcon",

  // UploadModal
  UploadModal__UrlTab = "UploadModal__UrlTab",
  UploadModal__LocalTab = "UploadModal__LocalTab",
  UploadModal__UrlInput = "UploadModal__UrlInput",
  UploadModal__AutoUnzipCheckbox = "UploadModal__AutoUnzipCheckbox",
  UploadModal__LocalTabDragger = "UploadModal__LocalTabDragger",
  UploadModal__SubmitButton = "UploadModal__SubmitButton",

  // AssetDetail
  AssetDetail__TypeSelect = "AssetDetail__TypeSelect",
  AssetDetail__FullscreenButton = "AssetDetail__FullscreenButton",

  // RequestTable
  RequestTable__EditIcon = "RequestTable__EditIcon",
  RequestTable__CloseButton = "RequestTable__CloseButton",

  // RequestDetail
  RequestDetail__CloseButton = "RequestDetail__CloseButton",
  RequestDetail__ReopenButton = "RequestDetail__ReopenButton",
  RequestDetail__ApproveButton = "RequestDetail__ApproveButton",
  RequestDetail__AssignToButton = "RequestDetail__AssignToButton",
  RequestDetail__ReviewerSelect = "RequestDetail__ReviewerSelect",
  RequestDetail__ReviewerSection = "RequestDetail__ReviewerSection",
  RequestDetail__AddCommentButton = "RequestDetail__AddCommentButton",

  // Comment
  Comment__DeleteButton = "Comment__DeleteButton",
  Comment__EditSaveButton = "Comment__EditSaveButton",

  // Header
  Header__ProjectName = "Header__ProjectName",

  // Workspace
  Workspace__NewProjectButton = "Workspace__NewProjectButton",

  // ProjectOverview
  ProjectOverview__NewModelButton = "ProjectOverview__NewModelButton",
  ProjectOverview__NewModelPlaceholderButton = "ProjectOverview__NewModelPlaceholderButton",

  // ProjectMenu
  ProjectMenu__ModelsItem = "ProjectMenu__ModelsItem",
  ProjectMenu__AccessibilityItem = "ProjectMenu__AccessibilityItem",
  ProjectMenu__SettingsItem = "ProjectMenu__SettingsItem",
  ProjectMenu__RequestItem = "ProjectMenu__RequestItem",

  // ContentList
  ContentList__NewItemButton = "ContentList__NewItemButton",

  // ContentForm
  ContentForm__EllipsisButton = "ContentForm__EllipsisButton",
  ContentForm__AddToRequestItem = "ContentForm__AddToRequestItem",
  ContentForm__VersionHistoryTab = "ContentForm__VersionHistoryTab",

  // ProjectMenu
  ProjectMenu__SchemaItem = "ProjectMenu__SchemaItem",
  ProjectMenu__ContentItem = "ProjectMenu__ContentItem",

  // Schema
  Schema__ModelAddButton = "Schema__ModelAddButton",
  Schema__GroupAddButton = "Schema__GroupAddButton",
  Schema__FieldEllipsisButton = "Schema__FieldEllipsisButton",
  Schema__FieldListItem = "Schema__FieldListItem",
  Schema__FieldDragHandle = "Schema__FieldDragHandle",
  Schema__GroupSelect = "Schema__GroupSelect",
  Schema__MetaDataTab = "Schema__MetaDataTab",
  Schema__FieldsTabs = "Schema__FieldsTabs",

  // FieldModal
  FieldModal__TagSelect = "FieldModal__TagSelect",
  FieldModal__SelectValueItem = "FieldModal__SelectValueItem",

  // LinkAssetModal
  LinkAssetModal__Table = "LinkAssetModal__Table",

  // Markdown
  Markdown__Preview = "Markdown__Preview",

  // MultiValueField
  MultiValueField__ItemWrapper = "MultiValueField__ItemWrapper",

  // GeometryItem
  GeometryItem__EditorWrapper = "GeometryItem__EditorWrapper",
}
