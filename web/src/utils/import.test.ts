import { readFileSync } from "fs";
import { join } from "path";

import { GeoJSON } from "geojson";
import { expect, test, describe } from "vitest";

import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
import { Model as GQLModel } from "@reearth-cms/gql/graphql-client-api";
import { ImportContentJSON, ImportUtils } from "@reearth-cms/utils/import";

import { ObjectUtils } from "./object";

const readFromJSONFile = <T>(
  fileNameWithExtension: string,
): ReturnType<typeof ObjectUtils.safeJSONParse<T>> => {
  const filePath = join(__dirname, "fixtures", fileNameWithExtension);
  const fileContent = readFileSync(filePath, "utf-8");

  return ObjectUtils.safeJSONParse(fileContent);
};

const readFromCSVFile = (fileNameWithExtension: string): string => {
  const filePath = join(__dirname, "fixtures", fileNameWithExtension);
  const fileContent = readFileSync(filePath, "utf-8");

  return fileContent;
};

describe("Testing schema & content import from static files", () => {
  describe("Validate schema data from static files", () => {
    test("Validate schema from JSON file", () => {
      const result = readFromJSONFile<Record<string, unknown>>("import-schema.json");
      if (!result.isValid) throw new Error(result.error);

      const parsedData = ImportUtils.parseImportSchema(result.data);
      expect(parsedData.isValid).toBe(true);
    });
  });

  describe("Validate content data from static files", () => {
    const rawSchema = readFromJSONFile<GQLModel>("raw-schema.json");
    if (!rawSchema.isValid) throw new Error(rawSchema.error);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const targetSchema = fromGraphQLModel(rawSchema.data)!;

    test("Validate CSV file", () => {
      const csvString = readFromCSVFile("import-content.csv");

      const validation = ImportUtils.validateContentFromCSV(csvString, targetSchema);
      expect(validation.isValid).toBe(true);
    });

    test("Validate JSON file", () => {
      const result = readFromJSONFile<ImportContentJSON>("import-content.json");
      if (!result.isValid) throw new Error(result.error);

      const validation = ImportUtils.validateContentFromJSON(result.data, targetSchema);
      expect(validation.isValid).toBe(true);
    });

    test("Validate GeoJSON file", () => {
      const result = readFromJSONFile<GeoJSON>("import-content.geojson");
      if (!result.isValid) throw new Error(result.error);

      const validation = ImportUtils.validateContentFromGeoJson(result.data, targetSchema);
      expect(validation.isValid).toBe(true);
    });
  });
});
