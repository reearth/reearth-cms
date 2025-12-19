import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";

const IGNORE_FIELD_TYPES_COMMON = new Set<SchemaFieldType>([
  SchemaFieldType.Asset,
  SchemaFieldType.Group,
  SchemaFieldType.Reference,
  SchemaFieldType.GeometryEditor,
]);

/* eslint-disable @typescript-eslint/no-extraneous-class */
export abstract class Constant {
  // for project alias
  public static readonly PROJECT_ALIAS = {
    MIN_LENGTH: 5,
    MAX_LENGTH: 32,
  };

  public static readonly KEY = {
    MAX_LENGTH: 32,
  };

  public static readonly IMPORT = {
    MAX_CONTENT_RECORDS: 2_000,

    // import ignore field types by file format
    IGNORE_FIELD_TYPES_COMMON,
    IGNORE_FIELD_TYPES_JSON: IGNORE_FIELD_TYPES_COMMON,
    IGNORE_FIELD_TYPES_GEO_JSON: new Set<SchemaFieldType>([
      ...Array.from(IGNORE_FIELD_TYPES_COMMON),
      SchemaFieldType.GeometryObject,
    ]),
    IGNORE_FIELD_TYPES_GEO_CSV: new Set<SchemaFieldType>([
      ...Array.from(IGNORE_FIELD_TYPES_COMMON),
      SchemaFieldType.GeometryObject,
    ]),

    // CONSTANTS FOR TEST USE ONLY BELOW
    TEST_MAX_CONTENT_RECORDS: 1,
  };

  public static readonly PUBLIC_FILE = {
    IMPORT_CONTENT_CSV: "/templates/import-content-template.csv",
    IMPORT_CONTENT_JSON: "/templates/import-content-template.json",
    IMPORT_CONTENT_GEO_JSON: "/templates/import-content-template.geojson",
    IMPORT_SCHEMA_JSON: "/templates/import-schema-template.json",

    // TODO: demo use
    IMPORT_SCHEMA_JSON_FOR_DEMO: "/templates/import-schema-demo.json",
    IMPORT_CONTENT_JSON_FOR_DEMO: "/templates/import-content-demo.json",
  };

  // FILE DIRECTORIES FOR TEST USE ONLY BELOW
  public static readonly TEST_FILE = {
    // JSON
    IMPORT_CONTENT_JSON_ABOVE_LIMIT_ALL_MATCH:
      "/test/test-files/import-content-above-limit-all-match.json",
    IMPORT_CONTENT_JSON_ABOVE_LIMIT_KEY_MISMATCH:
      "/test/test-files/import-content-above-limit-key-mismatch.json",
    IMPORT_CONTENT_JSON_ABOVE_LIMIT_TYPE_MISMATCH:
      "/test/test-files/import-content-above-limit-type-mismatch.json",

    IMPORT_CONTENT_JSON_BELOW_LIMIT_KEY_MISMATCH_IN_RANGE:
      "/test/test-files/import-content-below-limit-key-mismatch-in-range.json",
    IMPORT_CONTENT_JSON_BELOW_LIMIT_TYPE_MISMATCH_IN_RANGE:
      "/test/test-files/import-content-below-limit-type-mismatch-in-range.json",
    IMPORT_CONTENT_JSON_BELOW_LIMIT_ALL_MATCH_OUT_OF_RANGE:
      "/test/test-files/import-content-below-limit-all-match-out-of-range.json",
    IMPORT_CONTENT_JSON_BELOW_LIMIT_NO_KEY_MATCH:
      "/test/test-files/import-content-below-limit-no-key-match.json",
    IMPORT_CONTENT_JSON_BELOW_LIMIT_NO_TYPE_MATCH:
      "/test/test-files/import-content-below-limit-no-type-match.json",

    IMPORT_CONTENT_JSON_ALL_FIELD_KEYS_MATCH:
      "/test/test-files/import-content-json/all-field-keys-match.json",
    IMPORT_CONTENT_JSON_TEXT_FIELD_KEY_MISMATCH:
      "/test/test-files/import-content-json/text-field-key-mismatch.json",

    // CSV
    // TEST_IMPORT_CONTENT_CSV_ABOVE_LIMIT_MISMATCH:
    //   "/test/test-files/import-content-above-limit-mismatch.csv",
    // TEST_IMPORT_CONTENT_CSV_ABOVE_LIMIT_MATCH:
    //   "/test/test-files/import-content-above-limit-match.csv",

    // TEST_IMPORT_CONTENT_CSV_BELOW_LIMIT_MISMATCH:
    //   "/test/test-files/import-content-below-limit-mismatch.csv",
    // TEST_IMPORT_CONTENT_CSV_BELOW_LIMIT_NOMATCH:
    //   "/test/test-files/import-content-below-limit-nomatch.csv",

    // GeoJSON
    // TEST_IMPORT_CONTENT_GEO_JSON_ABOVE_LIMIT_MISMATCH:
    //   "/test/test-files/import-content-above-limit-mismatch.geojson",
    // TEST_IMPORT_CONTENT_GEO_JSON_ABOVE_LIMIT_MATCH:
    //   "/test/test-files/import-content-above-limit-match.geojson",

    // TEST_IMPORT_CONTENT_GEO_JSON_BELOW_LIMIT_MISMATCH:
    //   "/test/test-files/import-content-below-limit-mismatch.geojson",
    // TEST_IMPORT_CONTENT_GEO_JSON_BELOW_LIMIT_NOMATCH:
    //   "/test/test-files/import-content-below-limit-nomatch.geojson",
  };

  public static readonly IS_DEV: boolean =
    !process.env.NODE_ENV || process.env.NODE_ENV === "development";
}
