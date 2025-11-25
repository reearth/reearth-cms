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
  };
}
