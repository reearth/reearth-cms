import {
  GeoJSONPoint,
  GeoJSONMultiPoint,
  GeoJSONLineString,
  GeoJSONPolygon,
  GeoJSONMultiPolygon,
  GeoJSONGeometryCollection,
} from "zod-geojson";

// NOTE: THIS CLASS IS FOR TEST USE ONLY
/* eslint-disable @typescript-eslint/no-extraneous-class */
export abstract class Test {
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

  ModelCard_UtilDropdownImportSchema = "ModelCard_UtilDropdownImportSchema",
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

  // QueueItem
  QueueItem__RetryIcon = "QueueItem__RetryIcon",
  QueueItem__Wrapper = "QueueItem__Wrapper",

  // WorkspaceHeader
  WorkspaceHeader__ProjectSortSelect = "WorkspaceHeader__ProjectSortSelect",

  // Versions
  Versions__RequestStatus = "Versions__RequestStatus",

  //  DangerZone (MyIntegrations)
  MyIntegrations__Settings__DangerZone__RemoveIntegrationButton = "MyIntegrations__Settings__DangerZone__RemoveIntegrationButton",
  MyIntegrations__Settings__DangerZone__ConfirmRemoveIntegrationButton = "MyIntegrations__Settings__DangerZone__ConfirmRemoveIntegrationButton",

  // DangerZone (ProjectSettings)
  ProjectSettings__DangerZone__DeleteProjectButton = "ProjectSettings__DangerZone__DeleteProjectButton",
  ProjectSettings__DangerZone__ConfirmDeleteProjectButton = "ProjectSettings__DangerZone__ConfirmDeleteProjectButton",

  // ModelFieldList
  ModelFieldList__ConfirmDeleteFieldButton = "ModelFieldList__ConfirmDeleteFieldButton",

  // Content list page
  Content__List__ImportContentButton = "Content__List__ImportContentButton",
  Content__List__ItemFieldPopoverIcon = "Content__List__ItemFieldPopoverIcon",
}
