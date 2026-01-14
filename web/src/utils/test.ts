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

export enum DATA_TEST_ID {
  // model card util
  ModelCardUtilDropdownIcon = "MODEL_CARD_UTIL_DROPDOWN_ICON",

  ModelCardUtilDropdownEdit = "MODEL_CARD_UTIL_DROPDOWN_EDIT",
  ModelCardUtilDropdownImport = "MODEL_CARD_UTIL_DROPDOWN_IMPORT",
  ModelCardUtilDropdownExport = "MODEL_CARD_UTIL_DROPDOWN_EXPORT",
  ModelCardUtilDropdownDelete = "MODEL_CARD_UTIL_DROPDOWN_DELETE",

  ModelCardUtilDropdownImportSchema = "MODEL_CARD_UTIL_DROPDOWN_IMPORT_SCHEMA",
  ModelCardUtilDropdownImportContent = "MODEL_CARD_UTIL_DROPDOWN_IMPORT_CONTENT",

  ModelCardUtilDropdownExportSchema = "MODEL_CARD_UTIL_DROPDOWN_EXPORT_SCHEMA",
  ModelCardUtilDropdownExportContentJSON = "MODEL_CARD_UTIL_DROPDOWN_EXPORT_CONTENT_JSON",
  ModelCardUtilDropdownExportContentCSV = "MODEL_CARD_UTIL_DROPDOWN_EXPORT_CONTENT_CSV",
  ModelCardUtilDropdownExportContentGeoJSON = "MODEL_CARD_UTIL_DROPDOWN_EXPORT_CONTENT_GEO_JSON",
}
