import { readFileSync } from "fs";
import { join } from "path";

import { describe, expect, test } from "vitest";

import { Constant } from "./constant";
import { ImportSchemaUtils } from "./importSchema";
import { ObjectUtils } from "./object";

async function readFromJSONFile<T>(
  staticFileDirectory: string,
  baseDirectory = "public",
): Promise<ReturnType<typeof ObjectUtils.safeJSONParse<T>>> {
  const filePath = join(baseDirectory, staticFileDirectory);
  const fileContent = readFileSync(filePath, "utf-8");

  return await ObjectUtils.safeJSONParse(fileContent);
}

describe("Testing schema import from static files", () => {
  describe("Validate JSON files", () => {
    test("Validate schema from JSON file", async () => {
      const result = await readFromJSONFile<Record<string, unknown>>(
        Constant.PUBLIC_FILE.IMPORT_SCHEMA_JSON,
      );

      expect(result.isValid).toBe(true);

      if (!result.isValid) return;

      const validation = ImportSchemaUtils.validateSchemaFromJSON(result.data);

      expect(validation.isValid).toBe(true);
    });

    describe("Validate field type from schema", () => {});

    describe("Validate multiple from schema", () => {});

    describe("Validate text fields with default value and maxLength from schema", () => {});

    describe("Validate number fields with default value, min, max from schema", () => {});
  });
});
