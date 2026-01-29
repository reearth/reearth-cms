import {
  GeoJSONPoint,
  GeoJSONMultiPoint,
  GeoJSONLineString,
  GeoJSONPolygon,
  GeoJSONMultiPolygon,
  GeoJSONGeometryCollection,
} from "zod-geojson";

import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";

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
  Uploader__CancelAllIcon = "Uploader__CancelAllIcon",
  Uploader__CompleteIcon = "Uploader__CompleteIcon",

  // QueueItem
  QueueItem__Wrapper = "QueueItem__Wrapper",
  QueueItem__RetryIcon = "QueueItem__RetryIcon",
  QueueItem__CancelIcon = "QueueItem__CancelIcon",
  QueueItem__ErrorIcon = "QueueItem__ErrorIcon",
  QueueItem__ProgressBar = "QueueItem__ProgressBar",
  QueueItem__FileLink = "QueueItem__FileLink",

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
}
