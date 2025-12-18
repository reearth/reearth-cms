import { readFileSync } from "fs";
import { join } from "path";

import { expect, test, describe } from "vitest";
import * as z from "zod";

import { Constant } from "./constant";

describe("Constant", () => {
  describe("Validate alias length data type and range", () => {
    const ALIAS_LENGTH_VALIDATOR = z.number().nonnegative().int();

    test("Validate alias min length", () => {
      const minLengthValidation = ALIAS_LENGTH_VALIDATOR.safeParse(
        Constant.PROJECT_ALIAS.MIN_LENGTH,
      );
      if (!minLengthValidation.success) throw z.prettifyError(minLengthValidation.error);
    });

    test("Validate alias max length", () => {
      const maxLengthValidation = ALIAS_LENGTH_VALIDATOR.safeParse(
        Constant.PROJECT_ALIAS.MAX_LENGTH,
      );
      if (!maxLengthValidation.success) throw z.prettifyError(maxLengthValidation.error);
    });

    test("Check alias max length is larger then min length", () => {
      const diff = Constant.PROJECT_ALIAS.MAX_LENGTH > Constant.PROJECT_ALIAS.MIN_LENGTH;
      expect(diff).toBe(true);
    });
  });

  describe("Validate key constants", () => {
    test("Validate max length", () => {
      const MAX_LENGTH_VALIDATOR = z.int().nonnegative();

      const maxLengthValidation = MAX_LENGTH_VALIDATOR.safeParse(Constant.KEY.MAX_LENGTH);

      if (!maxLengthValidation.success) throw z.prettifyError(maxLengthValidation.error);
    });
  });

  describe("Validate import constants", () => {
    test("Validate max import content record", () => {
      const MAX_IMPORT_CONTENT_RECORD_VALIDATOR = z.int().nonnegative();
      const importContentRecordValidation = MAX_IMPORT_CONTENT_RECORD_VALIDATOR.safeParse(
        Constant.IMPORT.MAX_CONTENT_RECORDS,
      );

      if (!importContentRecordValidation.success)
        throw z.prettifyError(importContentRecordValidation.error);
    });
  });

  describe("Validate static files", () => {
    test("Check public files exist", () => {
      const filePaths: string[] = Object.values(Constant.PUBLIC_FILE);

      filePaths.forEach(_filePath => {
        const filePath = join("public", _filePath);

        try {
          readFileSync(filePath, "utf-8");
        } catch (err) {
          throw Error(String(err));
        }
      });
    });

    test("Check test files exist", () => {
      const filePaths: string[] = Object.values(Constant.TEST_FILE);

      filePaths.forEach(_filePath => {
        const filePath = join("src", _filePath);

        try {
          readFileSync(filePath, "utf-8");
        } catch (err) {
          throw Error(String(err));
        }
      });
    });
  });
});
