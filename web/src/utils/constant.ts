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
    MAX_CONTENT_RECORDS: 2,

    // CONSTANTS FOR TEST USE ONLY BELOW
    TEST_MAX_CONTENT_RECORDS: 2,
  };

  public static readonly PUBLIC_FILE = {
    IMPORT_CONTENT_CSV: "/templates/import-content-template.csv",
    IMPORT_CONTENT_JSON: "/templates/import-content-template.json",
    IMPORT_CONTENT_GEO_JSON: "/templates/import-content-template.geojson",
    IMPORT_SCHEMA_JSON: "/templates/import-schema-template.json",

    // FILE DIRECTORIES FOR TEST USE ONLY BELOW
    TEST_IMPORT_CONTENT_ABOVE_LIMIT_MISMATCH:
      "/test/test-files/import-content-above-limit-mismatch.json",
    TEST_IMPORT_CONTENT_ABOVE_LIMIT_MATCH: "/test/test-files/import-content-above-limit-match.json",
    TEST_IMPORT_CONTENT_BELOW_LIMIT_MISMATCH:
      "/test/test-files/import-content-below-limit-mismatch.json",
    TEST_IMPORT_CONTENT_BELOW_LIMIT_NOMATCH:
      "/test/test-files/import-content-below-limit-nomatch.json",
  };
}
