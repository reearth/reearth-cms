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
export enum DATA_TEST_ID {
  // model card util
  ModelCardUtilDropdownIcon = "ModelCardUtilDropdownIcon",

  ModelCardUtilDropdownEdit = "ModelCardUtilDropdownEdit",
  ModelCardUtilDropdownImport = "ModelCardUtilDropdownImport",
  ModelCardUtilDropdownExport = "ModelCardUtilDropdownExport",
  ModelCardUtilDropdownDelete = "ModelCardUtilDropdownDelete",

  ModelCardUtilDropdownImportSchema = "ModelCardUtilDropdownImportSchema",
  ModelCardUtilDropdownImportContent = "ModelCardUtilDropdownImportContent",

  ModelCardUtilDropdownExportSchema = "ModelCardUtilDropdownExportSchema",
  ModelCardUtilDropdownExportContentJSON = "ModelCardUtilDropdownExportContentJson",
  ModelCardUtilDropdownExportContentCSV = "ModelCardUtilDropdownExportContentCsv",
  ModelCardUtilDropdownExportContentGeoJSON = "ModelCardUtilDropdownExportContentGeoJson",

  ImportSchemaInnerButton = "ImportSchemaInnerButton",
  ImportSchemaOuterButton = "ImportSchemaOuterButton",
  ImportSchemaFileSelect = "ImportSchemaFileSelect",

  // import schema modal
  ImportSchemaModalPreviewStep = "ImportSchemaModalPreviewStep",
  ImportSchemaModalPreviewFieldList = "ImportSchemaModalPreviewFieldList",
  ImportSchemaModalPreviewSkipCheckbox = "ImportSchemaModalPreviewSkipCheckbox",
  ImportSchemaModalImportButton = "ImportSchemaModalImportButton",
}
