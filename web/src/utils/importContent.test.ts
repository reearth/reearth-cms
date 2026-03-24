import { readFileSync } from "fs";
import { join } from "path";

import { FeatureCollection } from "geojson";
import { describe, expect, test } from "vitest";

import {
  EditorSupportedType,
  Field,
  ObjectSupportedType,
  SchemaFieldType,
} from "@reearth-cms/components/molecules/Schema/types";
import { Test } from "@reearth-cms/test/utils";

import { Constant } from "./constant";
import { ContentSourceFormat, ImportContentItem, ImportContentUtils } from "./importContent";
import { ObjectUtils } from "./object";

async function readFromJSONFile(
  staticFileDirectory: string,
  baseDirectory = "public",
): ReturnType<Awaited<typeof ObjectUtils.safeJSONParse<ImportContentItem[]>>> {
  const filePath = join(baseDirectory, staticFileDirectory);
  const fileContent = readFileSync(filePath, "utf-8");

  const validation = await ObjectUtils.safeJSONParse<ImportContentItem[]>(fileContent);

  return validation.isValid
    ? { isValid: validation.isValid, data: validation.data }
    : { isValid: validation.isValid, error: validation.error };
}

async function readFromCSVFile(
  staticFileDirectory: string,
  baseDirectory = "public",
): ReturnType<Awaited<typeof ImportContentUtils.convertCSVToJSON<ImportContentItem>>> {
  const filePath = join(baseDirectory, staticFileDirectory);
  const fileContent = readFileSync(filePath, "utf-8");

  return await ImportContentUtils.convertCSVToJSON<ImportContentItem>(fileContent);
}

async function readFromGeoJSONFile(
  staticFileDirectory: string,
  baseDirectory = "public",
): ReturnType<typeof ImportContentUtils.convertGeoJSONToJSON> {
  const filePath = join(baseDirectory, staticFileDirectory);
  const fileContent = readFileSync(filePath, "utf-8");

  const validation = await ObjectUtils.safeJSONParse<FeatureCollection>(fileContent);

  if (!validation.isValid) return { isValid: false, error: validation.error };

  return await ImportContentUtils.convertGeoJSONToJSON(validation.data);
}

const DEFAULT_COMMON_FIELD: Pick<Field, "id" | "description" | "title" | "isTitle" | "unique"> = {
  id: "",
  description: "",
  title: "",
  isTitle: false,
  unique: false,
};

describe("Content import test", () => {
  describe("Validate import content files", () => {
    test.each<{ fileDir: string; format: ContentSourceFormat }>([
      { fileDir: Constant.PUBLIC_FILE.IMPORT_CONTENT_JSON, format: "JSON" },
      { fileDir: Constant.PUBLIC_FILE.IMPORT_CONTENT_CSV, format: "CSV" },
      { fileDir: Constant.PUBLIC_FILE.IMPORT_CONTENT_GEO_JSON, format: "GEOJSON" },
    ])("[Pass case] Check import content template file ($format)", async ({ fileDir, format }) => {
      const fields = [
        {
          type: SchemaFieldType.Text,
          key: "text-field-key",
          typeProperty: {},
        },
        {
          type: SchemaFieldType.TextArea,
          key: "textarea-field-key",
          typeProperty: {},
        },
        {
          type: SchemaFieldType.MarkdownText,
          key: "markdown-text-field-key",
          typeProperty: {},
        },
        {
          type: SchemaFieldType.Asset,
          key: "asset-field-key",
          typeProperty: {},
        },
        {
          type: SchemaFieldType.Date,
          key: "date-field-key",
          typeProperty: {},
        },
        {
          type: SchemaFieldType.Bool,
          key: "boolean-field-key",
          typeProperty: {},
        },
        {
          type: SchemaFieldType.Select,
          key: "select-field-key",
          typeProperty: {
            values: ["red", "green", "blue"],
          },
        },
        {
          type: SchemaFieldType.Integer,
          key: "int-field-key",
          typeProperty: {},
        },
        {
          type: SchemaFieldType.Number,
          key: "number-field-key",
          typeProperty: {},
        },
        {
          type: SchemaFieldType.URL,
          key: "url-field-key",
          typeProperty: {},
        },
        {
          type: SchemaFieldType.GeometryObject,
          key: "geo-object-key",
          typeProperty: {
            objectSupportedTypes: ["POINT"] as ObjectSupportedType[],
          },
        },
        {
          type: SchemaFieldType.GeometryEditor,
          key: "geo-editor-key",
          typeProperty: {
            editorSupportedTypes: ["POINT"] as EditorSupportedType[],
          },
        },
      ].map(({ type, key, typeProperty }) => ({
        ...DEFAULT_COMMON_FIELD,
        type,
        key,
        required: true,
        multiple: false,
        typeProperty,
      }));

      let result: Awaited<ReturnType<typeof readFromJSONFile>> = {
        isValid: false,
        error: "test init",
      };

      switch (format) {
        case "JSON":
          result = await readFromJSONFile(fileDir);
          break;

        case "CSV":
          result = await readFromCSVFile(fileDir);
          break;

        case "GEOJSON":
          result = await readFromGeoJSONFile(fileDir);
          break;

        default:
      }

      expect(result.isValid).toBe(true);

      if (!result.isValid) return;

      const contentValidation = await ImportContentUtils.validateContent(
        result.data,
        fields,
        format,
      );
      expect(contentValidation.isValid).toBe(true);

      if (!contentValidation.isValid) {
        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(false);
        expect(typeMismatchFieldKeys.size).toEqual(0);
        expect(outOfRangeFieldKeys.size).toEqual(0);
      }
    });
  });

  describe("Test validateContentFromJSON method", () => {
    describe("Control variables: field key", () => {
      describe("[Pass case] Field key match", () => {
        const COMMON_SETUP = {
          key: "correct-key",
          required: true,
          multiple: false,
          typeProperty: {},
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Text, correctValue: "text" },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.TextArea, correctValue: "text" },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.MarkdownText, correctValue: "text" },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Date,
              correctValue: new Date().toLocaleString(),
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, correctValue: false },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Integer, correctValue: 1 },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Number, correctValue: 1.5 },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              correctValue: "https://correct.com/",
            },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field key match", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.correctValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] Select field key match", () => {
        const COMMON_SETUP = {
          key: "correct-key",
          required: true,
          multiple: false,
          typeProperty: {
            values: ["red", "green", "blue"],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Select, correctValue: "blue" },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field key match", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.correctValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] GeoObject field key match", () => {
        const COMMON_SETUP = {
          key: "correct-key",
          required: true,
          multiple: false,
          typeProperty: {
            objectSupportedTypes: ["POINT"] as ObjectSupportedType[],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.GeometryObject,
              value: Test.GEO_JSON_POINT,
            },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field key match", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.value,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] GeoEditor field key match", () => {
        const COMMON_SETUP = {
          key: "correct-key",
          required: true,
          multiple: false,
          typeProperty: {
            editorSupportedTypes: ["POINT"] as EditorSupportedType[],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.GeometryEditor,
              value: Test.GEO_JSON_POINT,
            },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field key match", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              typeProperty: setup.typeProperty,
              multiple: false,
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.value,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Fail case] Field key mismatch", () => {
        const COMMON_SETUP = {
          key: "correct-key",
          wrongKey: "wrong-key",
          required: true,
          multiple: false,
          typeProperty: {},
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          typeMismatchFieldKeysCount: 1,
          outOfRangeFieldKeysCount: 0,
          isValid: false,
        };

        test.each([
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Text },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.TextArea },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.MarkdownText },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Date },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Integer },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Number },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.URL },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field key mismatch", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.wrongKey]: "hello world",
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult.isValid);

          if (contentValidation.isValid) return;

          const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } =
            contentValidation.error;

          expect(exceedLimit).toBe(expectedResult.exceedLimit);
          expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
          expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
        });
      });

      // FIXME: handle common error with select out of range
      describe.skip("[Fail case] Select field key mismatch", () => {
        const COMMON_SETUP = {
          key: "correct-key",
          wrongKey: "wrong-key",
          required: true,
          multiple: false,
          typeProperty: {
            values: ["red", "green", "blue"],
          },
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          typeMismatchFieldKeysCount: 1,
          outOfRangeFieldKeysCount: 0,
          isValid: false,
        };

        test.each([
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Select, value: "blue" },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field key mismatch", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: false,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.wrongKey]: setup.value,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult.isValid);

          if (contentValidation.isValid) return;

          const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } =
            contentValidation.error;

          expect(exceedLimit).toBe(expectedResult.exceedLimit);
          expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
          expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
        });
      });

      describe("[Fail case] GeoObject & GeoEditor field key mismatch", () => {
        const COMMON_SETUP = {
          key: "correct-key",
          wrongKey: "wrong-key",
          required: true,
          multiple: false,
          typeProperty: {
            objectSupportedTypes: ["POINT"] as ObjectSupportedType[],
          },
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          typeMismatchFieldKeysCount: 1,
          outOfRangeFieldKeysCount: 0,
          isValid: false,
        };

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.GeometryObject,
              value: Test.GEO_JSON_POINT,
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.GeometryEditor,
              value: Test.GEO_JSON_POINT,
            },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field key mismatch", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.wrongKey]: setup.value,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult.isValid);

          if (contentValidation.isValid) return;

          const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } =
            contentValidation.error;

          expect(exceedLimit).toBe(expectedResult.exceedLimit);
          expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
          expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
        });
      });
    });

    describe("Control variables: field value", () => {
      describe("[Pass case] Field value type match", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: false,
          typeProperty: {},
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Text, correctValue: "text" },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.TextArea, correctValue: "text" },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.MarkdownText, correctValue: "text" },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Date,
              correctValue: new Date().toLocaleString(),
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, correctValue: false },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Integer, correctValue: 1 },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Number, correctValue: 2.5 },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              correctValue: "https://correct.com/",
            },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field value type match", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.correctValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] Select field value type match", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: false,
          type: SchemaFieldType.Select,
          typeProperty: {
            values: ["red", "green", "blue"],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: { ...COMMON_SETUP, correctValue: "red" },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field value type match", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.correctValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] GeoObject field value type match", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: false,
          type: SchemaFieldType.GeometryObject,
          typeProperty: {
            objectSupportedTypes: ["POINT", "LINESTRING"] as ObjectSupportedType[],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              correctValue: Test.GEO_JSON_POINT,
            },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field value type match", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.correctValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] GeoEditor field value type match", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: false,
          type: SchemaFieldType.GeometryEditor,
          typeProperty: {
            editorSupportedTypes: ["POINT"] as EditorSupportedType[],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              correctValue: Test.GEO_JSON_POINT,
            },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field value type match", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.correctValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Fail case] Field value type mismatch", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: false,
          typeProperty: {},
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          typeMismatchFieldKeysCount: 1,
          outOfRangeFieldKeysCount: 0,
          isValid: false,
        };

        test.each([
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Text, wrongValue: 1 },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.TextArea, wrongValue: false },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.MarkdownText, wrongValue: [] },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Date, wrongValue: "hello" },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, wrongValue: "text" },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Integer, wrongValue: false },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Number, wrongValue: "text" },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.URL, wrongValue: 123 },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field value type mismatch", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: {},
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.wrongValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult.isValid);

          if (contentValidation.isValid) return;

          const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } =
            contentValidation.error;

          expect(exceedLimit).toBe(expectedResult.exceedLimit);
          expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
          expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
        });
      });

      // FIXME: fix common error with field key mismatch
      describe.skip("[Fail case] Select field value type mismatch", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: false,
          type: SchemaFieldType.Select,
          typeProperty: {
            values: ["red", "green", "blue"],
          },
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          typeMismatchFieldKeysCount: 1,
          outOfRangeFieldKeysCount: 0,
          isValid: false,
        };

        test.each([
          {
            setup: { ...COMMON_SETUP, wrongValue: "yellow" },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field value type mismatch", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: false,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.wrongValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult.isValid);

          if (contentValidation.isValid) return;

          const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } =
            contentValidation.error;

          expect(exceedLimit).toBe(expectedResult.exceedLimit);
          expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
          expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
        });
      });

      describe("[Fail case] GeoObject field value type mismatch", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: false,
          type: SchemaFieldType.GeometryObject,
          typeProperty: {
            objectSupportedTypes: ["POINT"] as ObjectSupportedType[],
          },
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          typeMismatchFieldKeysCount: 1,
          outOfRangeFieldKeysCount: 0,
          isValid: false,
        };

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              wrongValue: "hello",
            },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field value type mismatch", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.wrongValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult.isValid);

          if (contentValidation.isValid) return;

          const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } =
            contentValidation.error;

          expect(exceedLimit).toBe(expectedResult.exceedLimit);
          expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
          expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
        });
      });

      describe("[Fail case] GeoEditor field value type mismatch", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: false,
          type: SchemaFieldType.GeometryEditor,
          typeProperty: {
            editorSupportedTypes: ["POINT"] as EditorSupportedType[],
          },
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          typeMismatchFieldKeysCount: 1,
          outOfRangeFieldKeysCount: 0,
          isValid: false,
        };

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              wrongValue: "hello",
            },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field value type mismatch", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.wrongValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult.isValid);

          if (contentValidation.isValid) return;

          const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } =
            contentValidation.error;

          expect(exceedLimit).toBe(expectedResult.exceedLimit);
          expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
          expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
        });
      });
    });

    describe("Control variables: multiple (false), required, with default value", () => {
      describe("[Pass case] Field default value type match", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: false,
          typeProperty: {},
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Text, defaultValue: "hello" },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.TextArea, defaultValue: "hello" },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.MarkdownText, defaultValue: "hello" },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Date,
              defaultValue: new Date().toLocaleString(),
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, defaultValue: false },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Integer, defaultValue: 1 },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Number, defaultValue: 1.5 },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              defaultValue: "http://default.com/",
            },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field default value type match", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: {
                defaultValue: setup.defaultValue,
              },
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.defaultValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] Select field default value type match", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: false,
          typeProperty: {
            values: ["red", "green", "blue"],
            selectDefaultValue: "green",
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Select },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field default value type match", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.typeProperty.selectDefaultValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );

          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] GeoObject field default value type match", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: false,
          typeProperty: {
            objectSupportedTypes: ["POINT"] as ObjectSupportedType[],
            defaultValue: Test.GEO_JSON_POINT,
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field default value type match", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.typeProperty.defaultValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );

          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] GeoEditor field default value type match", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: false,
          typeProperty: {
            editorSupportedTypes: ["POINT"] as EditorSupportedType[],
            defaultValue: Test.GEO_JSON_POINT,
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field default value type match", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.typeProperty.defaultValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );

          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Fail case] Field default value type mismatch", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: false,
          typeProperty: {},
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          typeMismatchFieldKeysCount: 1,
          outOfRangeFieldKeysCount: 0,
          isValid: false,
        };

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Text,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: 1 },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.TextArea,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: 1 },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.MarkdownText,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: 1 },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Date,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "hello" },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Bool,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "text" },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Integer,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "text" },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Number,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "text" },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: 123 },
            },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field default value type mismatch", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.typeProperty.defaultValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult.isValid);

          if (contentValidation.isValid) return;

          const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } =
            contentValidation.error;

          expect(exceedLimit).toBe(expectedResult.exceedLimit);
          expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
          expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
        });
      });
    });

    describe("Control variables: multiple (true), required, with default value", () => {
      describe("[Pass case] Field with default value type match", () => {
        const COMMON_SETUP = {
          ...DEFAULT_COMMON_FIELD,
          key: "field-key",
          required: false,
          multiple: true,
          typeProperty: {},
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Text,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: ["hello", "world"] },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.TextArea,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: ["hello", "world"] },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.MarkdownText,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: ["hello", "world"] },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Date,
              typeProperty: {
                ...COMMON_SETUP.typeProperty,
                defaultValue: [new Date().toLocaleString(), new Date().toLocaleString()],
              },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Bool,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: [true, false] },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Integer,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: [1, 2] },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Number,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: [1.5, 2.5] },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              typeProperty: {
                ...COMMON_SETUP.typeProperty,
                defaultValue: ["https://hello.com/", "https://world.com/"],
              },
            },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field default value type match", async ({ setup, expectedResult }) => {
          const fields = [setup];

          const contentList = [
            {
              [setup.key]: setup.typeProperty.defaultValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );

          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] Field with multiple default values type match", () => {
        const COMMON_SETUP = {
          ...DEFAULT_COMMON_FIELD,
          key: "field-key",
          required: true,
          multiple: true,
          typeProperty: {},
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Text,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: ["hello", "world"] },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.TextArea,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: ["hello", "world"] },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.MarkdownText,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: ["hello", "world"] },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Date,
              typeProperty: {
                ...COMMON_SETUP.typeProperty,
                defaultValue: [new Date().toISOString()],
              },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Bool,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: [true, false] },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Integer,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: [1, 2] },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Number,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: [1.5, 2.5] },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              typeProperty: {
                ...COMMON_SETUP.typeProperty,
                defaultValue: ["https://hello.com/", "https://world.com/"],
              },
            },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field default value type match", async ({ setup, expectedResult }) => {
          const fields = [setup];

          const contentList = [
            {
              [setup.key]: setup.typeProperty.defaultValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );

          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] Select field with multiple default values type match", () => {
        const COMMON_SETUP = {
          ...DEFAULT_COMMON_FIELD,
          key: "field-key",
          required: true,
          multiple: true,
          typeProperty: {
            values: ["red", "green", "blue"],
            selectDefaultValue: ["blue"],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Select },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field default value type match", async ({ setup, expectedResult }) => {
          const fields = [setup];

          const contentList = [
            {
              [setup.key]: setup.typeProperty.selectDefaultValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );

          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] GeoObject field with multiple default values type match", () => {
        const COMMON_SETUP = {
          ...DEFAULT_COMMON_FIELD,
          key: "field-key",
          required: true,
          multiple: true,
          typeProperty: {
            objectSupportedTypes: ["POINT"] as ObjectSupportedType[],
            defaultValue: Test.GEO_JSON_POINT,
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field default value type match", async ({ setup, expectedResult }) => {
          const fields = [setup];

          const contentList = [
            {
              [setup.key]: setup.typeProperty.defaultValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );

          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] GeoEditor field with multiple default values type match", () => {
        const COMMON_SETUP = {
          ...DEFAULT_COMMON_FIELD,
          key: "field-key",
          required: true,
          multiple: true,
          typeProperty: {
            editorSupportedTypes: ["POINT"] as EditorSupportedType[],
            defaultValue: Test.GEO_JSON_POINT,
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field default value type match", async ({ setup, expectedResult }) => {
          const fields = [setup];

          const contentList = [
            {
              [setup.key]: setup.typeProperty.defaultValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );

          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });
    });

    describe("Control variables: multiple (true), required (true), with default value", () => {
      describe("[Fail case] Field with default values type mismatch", () => {
        const COMMON_SETUP = {
          ...DEFAULT_COMMON_FIELD,
          key: "field-key",
          required: true,
          multiple: true,
          typeProperty: {},
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          typeMismatchFieldKeysCount: 1,
          outOfRangeFieldKeysCount: 0,
          isValid: false,
        };

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Text,
              typeProperty: {
                ...COMMON_SETUP,
                defaultValue: 123,
              },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.TextArea,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: 123 },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.MarkdownText,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: 123 },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Date,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "hello" },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Bool,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "true" },
            },
            expectedResult: EXPECTED_RESULT,
          },
          // TODO: select wrong default value type
          // {
          //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Select },
          //   expectedResult: EXPECTED_RESULT,
          // },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Integer,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "1" },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Number,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "1.5" },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "hello" },
            },
            expectedResult: EXPECTED_RESULT,
          },
          // TODO: geo object wrong default value type
          // {
          //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
          //   expectedResult: EXPECTED_RESULT,
          // },
          // TODO: geo editor wrong default value type
          // {
          //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
          //   expectedResult: EXPECTED_RESULT,
          // },
        ])("$setup.type field default value type mismatch", async ({ setup, expectedResult }) => {
          const fields = [setup];

          const contentList = [
            {
              [setup.key]: setup.typeProperty.defaultValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );

          expect(contentValidation.isValid).toBe(expectedResult.isValid);

          if (contentValidation.isValid) return;

          const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } =
            contentValidation.error;

          expect(exceedLimit).toBe(expectedResult.exceedLimit);
          expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
          expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
        });
      });

      // FIXME: fix type error for type mismatch
      describe.skip("[Fail case] Select field with default values type mismatch", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: true,
          typeProperty: {
            values: ["red", "green", "blue"],
            selectDefaultValue: "blue",
          },
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          typeMismatchFieldKeysCount: 1,
          outOfRangeFieldKeysCount: 0,
          isValid: false,
        };

        test.each([
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Select },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field default value type mismatch", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.typeProperty.selectDefaultValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );

          expect(contentValidation.isValid).toBe(expectedResult.isValid);

          if (contentValidation.isValid) return;

          const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } =
            contentValidation.error;

          expect(exceedLimit).toBe(expectedResult.exceedLimit);
          expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
          expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
        });
      });

      // FIXME: fix type error for type mismatch
      describe.skip("[Fail case] GeoObject field with default values type mismatch", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: true,
          typeProperty: {
            objectSupportedTypes: ["POINT"] as ObjectSupportedType[],
            defaultValue: Test.GEO_JSON_POINT,
          },
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          typeMismatchFieldKeysCount: 1,
          outOfRangeFieldKeysCount: 0,
          isValid: false,
        };

        test.each([
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field default value type mismatch", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: setup.typeProperty,
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.typeProperty.defaultValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );

          expect(contentValidation.isValid).toBe(expectedResult.isValid);

          if (contentValidation.isValid) return;

          const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } =
            contentValidation.error;

          expect(exceedLimit).toBe(expectedResult.exceedLimit);
          expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
          expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
        });
      });

      describe.skip("[Fail case] GeoEditor field with default values type mismatch", () => {
        const COMMON_SETUP = {
          ...DEFAULT_COMMON_FIELD,
          key: "field-key",
          required: true,
          multiple: true,
          typeProperty: {
            editorSupportedTypes: ["POINT"] as EditorSupportedType[],
            defaultValue: Test.GEO_JSON_POINT,
          },
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          typeMismatchFieldKeysCount: 1,
          outOfRangeFieldKeysCount: 0,
          isValid: false,
        };

        test.each([
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field default value type mismatch", async ({ setup, expectedResult }) => {
          const fields = [setup];

          const contentList = [
            {
              [setup.key]: setup.typeProperty.defaultValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );

          expect(contentValidation.isValid).toBe(expectedResult.isValid);

          if (contentValidation.isValid) return;

          const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } =
            contentValidation.error;

          expect(exceedLimit).toBe(expectedResult.exceedLimit);
          expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
          expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
        });
      });
    });

    describe("In range test", () => {
      describe("Number fields", () => {
        describe("[Pass case] Control variables: multiple (false), required (true), value in range (min, max)", () => {
          const COMMON_SETUP = {
            ...DEFAULT_COMMON_FIELD,
            key: "field-key",
            required: true,
            multiple: false,
            typeProperty: {},
          };

          const EXPECTED_RESULT = true;

          test.each([
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Integer,
                value: 2,
                typeProperty: { ...COMMON_SETUP.typeProperty, min: -5, max: 5 },
              },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Number,
                value: 2.5,
                typeProperty: { ...COMMON_SETUP.typeProperty, min: -5.5, max: 5.5 },
              },
              expectedResult: EXPECTED_RESULT,
            },
          ])("$setup.type field value in range", async ({ setup, expectedResult }) => {
            const fields = [setup];

            const contentList = [
              {
                [setup.key]: setup.value,
              },
            ];

            const contentValidation = await ImportContentUtils.validateContent(
              contentList,
              fields,
              "JSON",
              Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
            );

            expect(contentValidation.isValid).toBe(expectedResult);
          });
        });

        describe("[Fail case] Control variables: multiple (false), required (true), value out of range (min, max)", () => {
          const COMMON_SETUP = {
            ...DEFAULT_COMMON_FIELD,
            key: "field-key",
            required: true,
            multiple: false,
            typeProperty: {},
          };

          const EXPECTED_RESULT = {
            exceedLimit: false,
            typeMismatchFieldKeysCount: 0,
            outOfRangeFieldKeysCount: 1,
            isValid: false,
          };

          test.each([
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Integer,
                value: 7,
                typeProperty: { ...COMMON_SETUP.typeProperty, min: -5, max: 5 },
              },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Number,
                value: 10.5,
                typeProperty: { ...COMMON_SETUP.typeProperty, min: -5.5, max: 5.5 },
              },
              expectedResult: EXPECTED_RESULT,
            },
          ])("$setup.type field value out of range", async ({ setup, expectedResult }) => {
            const fields = [setup];

            const contentList = [
              {
                [setup.key]: setup.value,
              },
            ];

            const contentValidation = await ImportContentUtils.validateContent(
              contentList,
              fields,
              "JSON",
              Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
            );

            expect(contentValidation.isValid).toBe(expectedResult.isValid);

            if (contentValidation.isValid) return;

            const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } =
              contentValidation.error;

            expect(exceedLimit).toBe(expectedResult.exceedLimit);
            expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
            expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
          });
        });
      });

      describe("Text fields", () => {
        describe("[Pass case] Control variables: multiple (false), required (true), value in range (maxLength)", () => {
          const COMMON_SETUP = {
            ...DEFAULT_COMMON_FIELD,
            key: "field-key",
            required: true,
            multiple: false,
            typeProperty: {},
          };

          const EXPECTED_RESULT = true;

          test.each([
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Text,
                value: "hello",
                typeProperty: { ...COMMON_SETUP.typeProperty, maxLength: 10 },
              },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.TextArea,
                value: "hello",
                typeProperty: { ...COMMON_SETUP.typeProperty, maxLength: 10 },
              },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.MarkdownText,
                value: "hello",
                typeProperty: { ...COMMON_SETUP.typeProperty, maxLength: 10 },
              },
              expectedResult: EXPECTED_RESULT,
            },
          ])("$setup.type field value in range", async ({ setup, expectedResult }) => {
            const fields = [setup];

            const contentList = [
              {
                [setup.key]: setup.value,
              },
            ];

            const contentValidation = await ImportContentUtils.validateContent(
              contentList,
              fields,
              "JSON",
              Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
            );

            expect(contentValidation.isValid).toBe(expectedResult);
          });
        });

        describe("[Fail case] Control variables: multiple (false), required (true), value out of range (maxLength)", () => {
          const COMMON_SETUP = {
            ...DEFAULT_COMMON_FIELD,
            key: "field-key",
            required: true,
            multiple: false,
            typeProperty: {},
          };

          const EXPECTED_RESULT = {
            exceedLimit: false,
            typeMismatchFieldKeysCount: 0,
            outOfRangeFieldKeysCount: 1,
            isValid: false,
          };

          test.each([
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Text,
                value: "hello world",
                typeProperty: { ...COMMON_SETUP.typeProperty, maxLength: 10 },
              },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.TextArea,
                value: "hello world",
                typeProperty: { ...COMMON_SETUP.typeProperty, maxLength: 10 },
              },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.MarkdownText,
                value: "hello world",
                typeProperty: { ...COMMON_SETUP.typeProperty, maxLength: 10 },
              },
              expectedResult: EXPECTED_RESULT,
            },
          ])("$setup.type field value out of range", async ({ setup, expectedResult }) => {
            const fields = [setup];

            const contentList = [
              {
                [setup.key]: setup.value,
              },
            ];

            const contentValidation = await ImportContentUtils.validateContent(
              contentList,
              fields,
              "JSON",
              Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
            );

            expect(contentValidation.isValid).toBe(expectedResult.isValid);

            if (contentValidation.isValid) return;

            const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } =
              contentValidation.error;

            expect(exceedLimit).toBe(expectedResult.exceedLimit);
            expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
            expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
          });
        });
      });

      describe("Select field", () => {
        describe("[Pass case] Control variables: multiple (false), required (true), value in range (values)", () => {
          const COMMON_SETUP = {
            ...DEFAULT_COMMON_FIELD,
            key: "field-key",
            required: true,
            multiple: false,
            typeProperty: {},
          };

          const EXPECTED_RESULT = true;

          test.each([
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Select,
                value: "green",
                typeProperty: { ...COMMON_SETUP.typeProperty, values: ["red", "green", "blue"] },
              },
              expectedResult: EXPECTED_RESULT,
            },
          ])("$setup.type field value in range", async ({ setup, expectedResult }) => {
            const fields = [setup];

            const contentList = [
              {
                [setup.key]: setup.value,
              },
            ];

            const contentValidation = await ImportContentUtils.validateContent(
              contentList,
              fields,
              "JSON",
              Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
            );

            expect(contentValidation.isValid).toBe(expectedResult);
          });
        });

        describe("[Fail case] Control variables: multiple (false), required (true), value out of range (values)", () => {
          const COMMON_SETUP = {
            ...DEFAULT_COMMON_FIELD,
            key: "field-key",
            required: true,
            multiple: false,
            typeProperty: {
              values: ["red", "green", "blue"],
            },
          };

          const EXPECTED_RESULT = {
            exceedLimit: false,
            typeMismatchFieldKeysCount: 0,
            outOfRangeFieldKeysCount: 1,
            isValid: false,
          };

          test.each([
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Select,
                value: "yellow",
              },
              expectedResult: EXPECTED_RESULT,
            },
          ])("$setup.type field value in range", async ({ setup, expectedResult }) => {
            const fields = [setup];

            const contentList = [
              {
                [setup.key]: setup.value,
              },
            ];

            const contentValidation = await ImportContentUtils.validateContent(
              contentList,
              fields,
              "JSON",
              Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
            );

            expect(contentValidation.isValid).toBe(expectedResult.isValid);

            if (contentValidation.isValid) return;

            const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } =
              contentValidation.error;

            expect(exceedLimit).toBe(expectedResult.exceedLimit);
            expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
            expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
          });
        });
      });

      describe("Record count", () => {
        describe("[Pass case] Control variables: content list length", () => {
          const COMMON_SETUP = {
            ...DEFAULT_COMMON_FIELD,
            key: "correct-key",
            required: true,
            multiple: false,
            typeProperty: {},
          };

          const EXPECTED_RESULT = true;

          test.each([
            {
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Text, value: "text" },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: { ...COMMON_SETUP, type: SchemaFieldType.TextArea, value: "text" },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: { ...COMMON_SETUP, type: SchemaFieldType.MarkdownText, value: "text" },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Date,
                value: "2025-12-01T00:00:00+09:00",
              },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, value: true },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Select,
                value: "green",
                typeProperty: { ...COMMON_SETUP.typeProperty, values: ["red", "blue", "green"] },
              },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Integer, value: 1 },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Number, value: 1.5 },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.URL,
                value: "https://hello.com/",
              },
              expectedResult: EXPECTED_RESULT,
            },
            // {
            //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
            //   expectedResult: EXPECTED_RESULT,
            // },
            // {
            //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
            //   expectedResult: EXPECTED_RESULT,
            // },
          ])("$setup.type field count is below max records", async ({ setup, expectedResult }) => {
            const fields = [setup];

            const contentList = [
              {
                [setup.key]: setup.value,
              },
            ];

            const contentValidation = await ImportContentUtils.validateContent(
              contentList,
              fields,
              "JSON",
              Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
            );
            expect(contentValidation.isValid).toBe(expectedResult);
          });
        });

        describe("[Fail case] Control variables: content list length", () => {
          const COMMON_SETUP = {
            ...DEFAULT_COMMON_FIELD,
            key: "correct-key",
            required: true,
            multiple: false,
            typeProperty: {},
          };

          const EXPECTED_RESULT = {
            exceedLimit: true,
            typeMismatchFieldKeysCount: 0,
            outOfRangeFieldKeysCount: 0,
            isValid: false,
          };

          test.each([
            {
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Text, value: "text" },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: { ...COMMON_SETUP, type: SchemaFieldType.TextArea, value: "text" },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: { ...COMMON_SETUP, type: SchemaFieldType.MarkdownText, value: "text" },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Date,
                value: "2025-12-01T00:00:00+09:00",
              },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, value: true },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Select,
                value: "green",
                typeProperty: { ...COMMON_SETUP.typeProperty, values: ["red", "blue", "green"] },
              },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Integer, value: 1 },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Number, value: 1.5 },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.URL,
                value: "https://hello.com/",
              },
              expectedResult: EXPECTED_RESULT,
            },
            // {
            //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
            //   expectedResult: EXPECTED_RESULT,
            // },
            // {
            //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
            //   expectedResult: EXPECTED_RESULT,
            // },
          ])("$setup.type field count is above max records", async ({ setup, expectedResult }) => {
            const fields = [setup];

            const contentList = [
              {
                [setup.key]: setup.value,
              },
              {
                [setup.key]: setup.value,
              },
            ];

            const contentValidation = await ImportContentUtils.validateContent(
              contentList,
              fields,
              "JSON",
              Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
            );
            expect(contentValidation.isValid).toBe(expectedResult.isValid);

            if (contentValidation.isValid) return;

            const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } =
              contentValidation.error;

            expect(exceedLimit).toBe(expectedResult.exceedLimit);
            expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
            expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
          });
        });
      });
    });

    describe("Auto fill default value test", () => {
      describe("[Pass case] Control variables: field value with default value", () => {
        const COMMON_SETUP = {
          ...DEFAULT_COMMON_FIELD,
          required: false,
          multiple: false,
          typeProperty: {},
        };

        const TEST_SETUP = {
          key1: "key-1",
          key2: "key-2",
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Text,
              value: "hello",
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "default text" },
            },
            testSetup: TEST_SETUP,
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.TextArea,
              value: "text",
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "default text" },
            },
            testSetup: TEST_SETUP,
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.MarkdownText,
              value: "text",
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "default text" },
            },
            testSetup: TEST_SETUP,
            expectedResult: EXPECTED_RESULT,
          },
          // {
          //   setup: {
          //     ...COMMON_SETUP,
          //     type: SchemaFieldType.Date,
          //     value: new Date("2026-01-01").toISOString(),
          //     defaultValue: new Date("2026-01-02").toISOString(),
          //   },
          //   expectedResult: EXPECTED_RESULT,
          // },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Bool,
              value: false,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: true },
            },
            testSetup: TEST_SETUP,
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Integer,
              value: 1,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: 5 },
            },
            testSetup: TEST_SETUP,
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Number,
              value: 1.5,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: 5.5 },
            },
            testSetup: TEST_SETUP,
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              value: "https://hello.com/",
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "https://default.com/" },
            },
            testSetup: TEST_SETUP,
            expectedResult: EXPECTED_RESULT,
          },
          // {
          //   setup: {
          //     ...COMMON_SETUP,
          //     type: SchemaFieldType.GeometryObject,
          //     value: Test.GEO_JSON_POINT,
          //     defaultValue: Test.GEO_JSON_POINT,
          //   },
          //   expectedResult: EXPECTED_RESULT,
          // },
          // {
          //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
          //   expectedResult: EXPECTED_RESULT,
          //   value: Test.GEO_JSON_POINT,
          //   defaultValue: Test.GEO_JSON_POINT,
          // },
        ])(
          "$setup.type field auto fill with default value",
          async ({ setup, testSetup, expectedResult }) => {
            const fields = [
              {
                ...DEFAULT_COMMON_FIELD,
                type: setup.type,
                key: testSetup.key1,
                required: setup.required,
                multiple: setup.multiple,
                typeProperty: setup.typeProperty,
              },
              {
                ...DEFAULT_COMMON_FIELD,
                type: setup.type,
                key: testSetup.key2,
                required: setup.required,
                multiple: setup.multiple,
                typeProperty: setup.typeProperty,
              },
            ];

            const contentList = [
              {
                [testSetup.key1]: setup.value,
                [testSetup.key2]: setup.value,
              },
            ];

            const expectContentList = [
              {
                [testSetup.key1]: setup.value,
                [testSetup.key2]: setup.value,
              },
            ];

            const contentValidation = await ImportContentUtils.validateContent(
              contentList,
              fields,
              "JSON",
              Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
            );
            expect(contentValidation.isValid).toBe(expectedResult);

            if (contentValidation.isValid)
              expect(contentValidation.data).toEqual(expectContentList);
          },
        );
      });

      describe("[Pass case] Control variables: field value without default value", () => {
        const COMMON_SETUP = {
          ...DEFAULT_COMMON_FIELD,
          required: false,
          multiple: false,
          typeProperty: {},
        };

        const TEST_SETUP = {
          key1: "key-1",
          key2: "key-2",
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Text,
              value: "hello",
            },
            testSetup: TEST_SETUP,
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.TextArea,
              value: "text",
            },
            testSetup: TEST_SETUP,
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.MarkdownText,
              value: "text",
            },
            testSetup: TEST_SETUP,
            expectedResult: EXPECTED_RESULT,
          },
          // {
          //   setup: {
          //     ...COMMON_SETUP,
          //     type: SchemaFieldType.Date,
          //     value: "2025-12-01T00:00:00+09:00",
          //   },
          //   expectedResult: EXPECTED_RESULT,
          // },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Bool,
              value: false,
            },
            testSetup: TEST_SETUP,
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Integer,
              value: 1,
            },
            testSetup: TEST_SETUP,
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Number,
              value: 1.5,
            },
            testSetup: TEST_SETUP,
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              value: "https://hello.com/",
            },
            testSetup: TEST_SETUP,
            expectedResult: EXPECTED_RESULT,
          },
          // {
          //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
          //   expectedResult: EXPECTED_RESULT,
          // },
          // {
          //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
          //   expectedResult: EXPECTED_RESULT,
          // },
        ])(
          "$setup.type field use value instead of default value",
          async ({ setup, testSetup, expectedResult }) => {
            const fields = [
              {
                ...setup,
                key: testSetup.key1,
              },
              {
                ...setup,
                key: testSetup.key2,
              },
            ];

            const contentList = [
              {
                [testSetup.key1]: setup.value,
                [testSetup.key2]: setup.value,
              },
            ];

            const expectContentList = [
              {
                [testSetup.key1]: setup.value,
                [testSetup.key2]: setup.value,
              },
            ];

            const contentValidation = await ImportContentUtils.validateContent(
              contentList,
              fields,
              "JSON",
              Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
            );
            expect(contentValidation.isValid).toBe(expectedResult);

            if (contentValidation.isValid)
              expect(contentValidation.data).toEqual(expectContentList);
          },
        );
      });

      describe("[Pass case] Control variables: field value with default value (select field)", () => {
        const COMMON_SETUP = {
          ...DEFAULT_COMMON_FIELD,
          required: false,
          multiple: false,
          typeProperty: {
            values: ["red", "blue", "green"],
            selectDefaultValue: "blue",
          },
        };

        const TEST_SETUP = {
          key1: "key-1",
          key2: "key-2",
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Select,
              value: "green",
            },
            testSetup: TEST_SETUP,
            expectedResult: EXPECTED_RESULT,
          },
        ])(
          "$setup.type field auto fill value with default value",
          async ({ setup, testSetup, expectedResult }) => {
            const fields = [
              {
                ...setup,
                key: testSetup.key1,
              },
              {
                ...setup,
                key: testSetup.key2,
              },
            ];

            const contentList = [
              {
                [testSetup.key1]: setup.value,
              },
            ];

            const expectContentList = [
              {
                [testSetup.key1]: setup.value,
                [testSetup.key2]: setup.typeProperty.selectDefaultValue,
              },
            ];

            const contentValidation = await ImportContentUtils.validateContent(
              contentList,
              fields,
              "JSON",
              Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
            );
            expect(contentValidation.isValid).toBe(expectedResult);

            if (contentValidation.isValid) {
              expect(contentValidation.data).toEqual(expectContentList);
            }
          },
        );
      });

      describe("[Pass case] Control variables: field value without default value (select field)", () => {
        const COMMON_SETUP = {
          ...DEFAULT_COMMON_FIELD,
          required: false,
          multiple: false,
          typeProperty: {
            values: ["red", "blue", "green"],
          },
        };

        const TEST_SETUP = {
          key1: "key-1",
          key2: "key-2",
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Select,
              value: "green",
            },
            testSetup: TEST_SETUP,
            expectedResult: EXPECTED_RESULT,
          },
        ])(
          "$setup.type field auto fill value without default value",
          async ({ setup, testSetup, expectedResult }) => {
            const fields = [
              {
                ...setup,
                key: testSetup.key1,
              },
              {
                ...setup,
                key: testSetup.key2,
              },
            ];

            const contentList = [
              {
                [testSetup.key1]: setup.value,
              },
            ];

            const expectContentList = [
              {
                [testSetup.key1]: setup.value,
              },
            ];

            const contentValidation = await ImportContentUtils.validateContent(
              contentList,
              fields,
              "JSON",
              Test.IMPORT.TEST_MAX_CONTENT_RECORDS,
            );
            expect(contentValidation.isValid).toBe(expectedResult);

            if (contentValidation.isValid) {
              expect(contentValidation.data).toEqual(expectContentList);
            }
          },
        );
      });
    });
  });

  describe("Test getUIMetadata method", () => {
    test.each([
      { hasContentCreateRight: true, hasModelFields: true, expected: false },
      { hasContentCreateRight: true, hasModelFields: false, expected: true },
      { hasContentCreateRight: false, hasModelFields: true, expected: true },
      { hasContentCreateRight: false, hasModelFields: false, expected: true },
    ])(
      "hasContentCreateRight: $hasContentCreateRight, hasModelFields: $hasModelFields, expected: $expected",
      ({ hasContentCreateRight, hasModelFields, expected }) => {
        const result = ImportContentUtils.getUIMetadata({ hasContentCreateRight, hasModelFields });

        expect(result.shouldDisable).toEqual(expected);
      },
    );
  });
});
