import {
  ExportSchemaFieldType,
  SchemaFieldType,
} from "@reearth-cms/components/molecules/Schema/types";

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
    MAX_LENGTH: 32,
    MIN_LENGTH: 5,
  };

  public static readonly KEY = {
    MAX_LENGTH: 32,
  };

  public static readonly IMPORT = {
    GET_JOB_DELAY_TIME_IN_MS: 500,
    MAX_CONTENT_RECORDS: 50_000,
    MAX_FILE_SIZE_IN_MB: 100,

    // import ignore field types by file format
    IGNORE_FIELD_TYPES_COMMON,
    IGNORE_FIELD_TYPES_GEO_CSV: new Set<SchemaFieldType>([
      ...Array.from(IGNORE_FIELD_TYPES_COMMON),
      SchemaFieldType.GeometryObject,
    ]),
    IGNORE_FIELD_TYPES_GEO_JSON: new Set<SchemaFieldType>([
      ...Array.from(IGNORE_FIELD_TYPES_COMMON),
      SchemaFieldType.GeometryObject,
    ]),
    IGNORE_FIELD_TYPES_JSON: IGNORE_FIELD_TYPES_COMMON,

    FIELD_TYPE_MAPPING: {
      [ExportSchemaFieldType.Asset]: SchemaFieldType.Asset,
      [ExportSchemaFieldType.Bool]: SchemaFieldType.Bool,
      [ExportSchemaFieldType.Datetime]: SchemaFieldType.Date,
      [ExportSchemaFieldType.GeometryEditor]: SchemaFieldType.GeometryEditor,
      [ExportSchemaFieldType.GeometryObject]: SchemaFieldType.GeometryObject,
      [ExportSchemaFieldType.Integer]: SchemaFieldType.Integer,
      [ExportSchemaFieldType.Markdown]: SchemaFieldType.MarkdownText,
      [ExportSchemaFieldType.Number]: SchemaFieldType.Number,
      [ExportSchemaFieldType.Select]: SchemaFieldType.Select,
      [ExportSchemaFieldType.Text]: SchemaFieldType.Text,
      [ExportSchemaFieldType.TextArea]: SchemaFieldType.TextArea,
      [ExportSchemaFieldType.URL]: SchemaFieldType.URL,
    },
  };

  public static readonly PUBLIC_FILE = {
    IMPORT_CONTENT_CSV: "/templates/import-content-template.csv",
    IMPORT_CONTENT_GEO_JSON: "/templates/import-content-template.geojson",
    IMPORT_CONTENT_JSON: "/templates/import-content-template.json",
    IMPORT_SCHEMA_JSON: "/templates/import-schema-template.json",
  };

  public static readonly IS_DEV: boolean =
    !process.env.NODE_ENV || process.env.NODE_ENV === "development";
}
