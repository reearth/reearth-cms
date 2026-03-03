import { readFileSync } from "fs";
import { FeatureCollection } from "geojson";
import { join } from "path";
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
    ? { data: validation.data, isValid: validation.isValid }
    : { error: validation.error, isValid: validation.isValid };
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

  if (!validation.isValid) return { error: validation.error, isValid: false };

  return await ImportContentUtils.convertGeoJSONToJSON(validation.data);
}

const DEFAULT_COMMON_FIELD: Pick<Field, "description" | "id" | "isTitle" | "title" | "unique"> = {
  description: "",
  id: "",
  isTitle: false,
  title: "",
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
          key: "text-field-key",
          type: SchemaFieldType.Text,
          typeProperty: {},
        },
        {
          key: "textarea-field-key",
          type: SchemaFieldType.TextArea,
          typeProperty: {},
        },
        {
          key: "markdown-text-field-key",
          type: SchemaFieldType.MarkdownText,
          typeProperty: {},
        },
        {
          key: "asset-field-key",
          type: SchemaFieldType.Asset,
          typeProperty: {},
        },
        {
          key: "date-field-key",
          type: SchemaFieldType.Date,
          typeProperty: {},
        },
        {
          key: "boolean-field-key",
          type: SchemaFieldType.Bool,
          typeProperty: {},
        },
        {
          key: "select-field-key",
          type: SchemaFieldType.Select,
          typeProperty: {
            values: ["red", "green", "blue"],
          },
        },
        {
          key: "int-field-key",
          type: SchemaFieldType.Integer,
          typeProperty: {},
        },
        {
          key: "number-field-key",
          type: SchemaFieldType.Number,
          typeProperty: {},
        },
        {
          key: "url-field-key",
          type: SchemaFieldType.URL,
          typeProperty: {},
        },
        {
          key: "geo-object-key",
          type: SchemaFieldType.GeometryObject,
          typeProperty: {
            objectSupportedTypes: ["POINT"] as ObjectSupportedType[],
          },
        },
        {
          key: "geo-editor-key",
          type: SchemaFieldType.GeometryEditor,
          typeProperty: {
            editorSupportedTypes: ["POINT"] as EditorSupportedType[],
          },
        },
      ].map(({ key, type, typeProperty }) => ({
        ...DEFAULT_COMMON_FIELD,
        key,
        multiple: false,
        required: true,
        type,
        typeProperty,
      }));

      let result: Awaited<ReturnType<typeof readFromJSONFile>> = {
        error: "test init",
        isValid: false,
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
        const { exceedLimit, outOfRangeFieldKeys, typeMismatchFieldKeys } = contentValidation.error;

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
          multiple: false,
          required: true,
          typeProperty: {},
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, correctValue: "text", type: SchemaFieldType.Text },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, correctValue: "text", type: SchemaFieldType.TextArea },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, correctValue: "text", type: SchemaFieldType.MarkdownText },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              correctValue: new Date().toLocaleString(),
              type: SchemaFieldType.Date,
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, correctValue: false, type: SchemaFieldType.Bool },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, correctValue: 1, type: SchemaFieldType.Integer },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, correctValue: 1.5, type: SchemaFieldType.Number },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              correctValue: "https://correct.com/",
              type: SchemaFieldType.URL,
            },
          },
        ])("$setup.type field key match", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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
          multiple: false,
          required: true,
          typeProperty: {
            values: ["red", "green", "blue"],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, correctValue: "blue", type: SchemaFieldType.Select },
          },
        ])("$setup.type field key match", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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
          multiple: false,
          required: true,
          typeProperty: {
            objectSupportedTypes: ["POINT"] as ObjectSupportedType[],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.GeometryObject,
              value: Test.GEO_JSON_POINT,
            },
          },
        ])("$setup.type field key match", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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
          multiple: false,
          required: true,
          typeProperty: {
            editorSupportedTypes: ["POINT"] as EditorSupportedType[],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.GeometryEditor,
              value: Test.GEO_JSON_POINT,
            },
          },
        ])("$setup.type field key match", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: false,
              required: setup.required,
              type: setup.type,
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

      describe("[Fail case] Field key mismatch", () => {
        const COMMON_SETUP = {
          key: "correct-key",
          multiple: false,
          required: true,
          typeProperty: {},
          wrongKey: "wrong-key",
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          isValid: false,
          outOfRangeFieldKeysCount: 0,
          typeMismatchFieldKeysCount: 1,
        };

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Text },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.TextArea },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.MarkdownText },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Date },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Integer },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Number },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.URL },
          },
        ])("$setup.type field key mismatch", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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

          const { exceedLimit, outOfRangeFieldKeys, typeMismatchFieldKeys } =
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
          multiple: false,
          required: true,
          typeProperty: {
            values: ["red", "green", "blue"],
          },
          wrongKey: "wrong-key",
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          isValid: false,
          outOfRangeFieldKeysCount: 0,
          typeMismatchFieldKeysCount: 1,
        };

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Select, value: "blue" },
          },
        ])("$setup.type field key mismatch", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: false,
              required: setup.required,
              type: setup.type,
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

          const { exceedLimit, outOfRangeFieldKeys, typeMismatchFieldKeys } =
            contentValidation.error;

          expect(exceedLimit).toBe(expectedResult.exceedLimit);
          expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
          expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
        });
      });

      describe("[Fail case] GeoObject & GeoEditor field key mismatch", () => {
        const COMMON_SETUP = {
          key: "correct-key",
          multiple: false,
          required: true,
          typeProperty: {
            objectSupportedTypes: ["POINT"] as ObjectSupportedType[],
          },
          wrongKey: "wrong-key",
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          isValid: false,
          outOfRangeFieldKeysCount: 0,
          typeMismatchFieldKeysCount: 1,
        };

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.GeometryObject,
              value: Test.GEO_JSON_POINT,
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.GeometryEditor,
              value: Test.GEO_JSON_POINT,
            },
          },
        ])("$setup.type field key mismatch", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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

          const { exceedLimit, outOfRangeFieldKeys, typeMismatchFieldKeys } =
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
          multiple: false,
          required: true,
          typeProperty: {},
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, correctValue: "text", type: SchemaFieldType.Text },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, correctValue: "text", type: SchemaFieldType.TextArea },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, correctValue: "text", type: SchemaFieldType.MarkdownText },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              correctValue: new Date().toLocaleString(),
              type: SchemaFieldType.Date,
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, correctValue: false, type: SchemaFieldType.Bool },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, correctValue: 1, type: SchemaFieldType.Integer },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, correctValue: 2.5, type: SchemaFieldType.Number },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              correctValue: "https://correct.com/",
              type: SchemaFieldType.URL,
            },
          },
        ])("$setup.type field value type match", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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
          multiple: false,
          required: true,
          type: SchemaFieldType.Select,
          typeProperty: {
            values: ["red", "green", "blue"],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, correctValue: "red" },
          },
        ])("$setup.type field value type match", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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
          multiple: false,
          required: true,
          type: SchemaFieldType.GeometryObject,
          typeProperty: {
            objectSupportedTypes: ["POINT", "LINESTRING"] as ObjectSupportedType[],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              correctValue: Test.GEO_JSON_POINT,
            },
          },
        ])("$setup.type field value type match", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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
          multiple: false,
          required: true,
          type: SchemaFieldType.GeometryEditor,
          typeProperty: {
            editorSupportedTypes: ["POINT"] as EditorSupportedType[],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              correctValue: Test.GEO_JSON_POINT,
            },
          },
        ])("$setup.type field value type match", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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
          multiple: false,
          required: true,
          typeProperty: {},
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          isValid: false,
          outOfRangeFieldKeysCount: 0,
          typeMismatchFieldKeysCount: 1,
        };

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Text, wrongValue: 1 },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.TextArea, wrongValue: false },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.MarkdownText, wrongValue: [] },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Date, wrongValue: "hello" },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, wrongValue: "text" },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Integer, wrongValue: false },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Number, wrongValue: "text" },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.URL, wrongValue: 123 },
          },
        ])("$setup.type field value type mismatch", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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

          const { exceedLimit, outOfRangeFieldKeys, typeMismatchFieldKeys } =
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
          multiple: false,
          required: true,
          type: SchemaFieldType.Select,
          typeProperty: {
            values: ["red", "green", "blue"],
          },
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          isValid: false,
          outOfRangeFieldKeysCount: 0,
          typeMismatchFieldKeysCount: 1,
        };

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, wrongValue: "yellow" },
          },
        ])("$setup.type field value type mismatch", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: false,
              required: setup.required,
              type: setup.type,
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

          const { exceedLimit, outOfRangeFieldKeys, typeMismatchFieldKeys } =
            contentValidation.error;

          expect(exceedLimit).toBe(expectedResult.exceedLimit);
          expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
          expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
        });
      });

      describe("[Fail case] GeoObject field value type mismatch", () => {
        const COMMON_SETUP = {
          key: "field-key",
          multiple: false,
          required: true,
          type: SchemaFieldType.GeometryObject,
          typeProperty: {
            objectSupportedTypes: ["POINT"] as ObjectSupportedType[],
          },
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          isValid: false,
          outOfRangeFieldKeysCount: 0,
          typeMismatchFieldKeysCount: 1,
        };

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              wrongValue: "hello",
            },
          },
        ])("$setup.type field value type mismatch", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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

          const { exceedLimit, outOfRangeFieldKeys, typeMismatchFieldKeys } =
            contentValidation.error;

          expect(exceedLimit).toBe(expectedResult.exceedLimit);
          expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
          expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
        });
      });

      describe("[Fail case] GeoEditor field value type mismatch", () => {
        const COMMON_SETUP = {
          key: "field-key",
          multiple: false,
          required: true,
          type: SchemaFieldType.GeometryEditor,
          typeProperty: {
            editorSupportedTypes: ["POINT"] as EditorSupportedType[],
          },
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          isValid: false,
          outOfRangeFieldKeysCount: 0,
          typeMismatchFieldKeysCount: 1,
        };

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              wrongValue: "hello",
            },
          },
        ])("$setup.type field value type mismatch", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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

          const { exceedLimit, outOfRangeFieldKeys, typeMismatchFieldKeys } =
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
          multiple: false,
          required: true,
          typeProperty: {},
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, defaultValue: "hello", type: SchemaFieldType.Text },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, defaultValue: "hello", type: SchemaFieldType.TextArea },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, defaultValue: "hello", type: SchemaFieldType.MarkdownText },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              defaultValue: new Date().toLocaleString(),
              type: SchemaFieldType.Date,
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, defaultValue: false, type: SchemaFieldType.Bool },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, defaultValue: 1, type: SchemaFieldType.Integer },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, defaultValue: 1.5, type: SchemaFieldType.Number },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              defaultValue: "http://default.com/",
              type: SchemaFieldType.URL,
            },
          },
        ])("$setup.type field default value type match", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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
          multiple: false,
          required: true,
          typeProperty: {
            selectDefaultValue: "green",
            values: ["red", "green", "blue"],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Select },
          },
        ])("$setup.type field default value type match", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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
          multiple: false,
          required: true,
          typeProperty: {
            defaultValue: Test.GEO_JSON_POINT,
            objectSupportedTypes: ["POINT"] as ObjectSupportedType[],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
          },
        ])("$setup.type field default value type match", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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
          multiple: false,
          required: true,
          typeProperty: {
            defaultValue: Test.GEO_JSON_POINT,
            editorSupportedTypes: ["POINT"] as EditorSupportedType[],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
          },
        ])("$setup.type field default value type match", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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
          multiple: false,
          required: true,
          typeProperty: {},
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          isValid: false,
          outOfRangeFieldKeysCount: 0,
          typeMismatchFieldKeysCount: 1,
        };

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Text,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: 1 },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.TextArea,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: 1 },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.MarkdownText,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: 1 },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Date,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "hello" },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Bool,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "text" },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Integer,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "text" },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Number,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "text" },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: 123 },
            },
          },
        ])("$setup.type field default value type mismatch", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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

          const { exceedLimit, outOfRangeFieldKeys, typeMismatchFieldKeys } =
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
          multiple: true,
          required: false,
          typeProperty: {},
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Text,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: ["hello", "world"] },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.TextArea,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: ["hello", "world"] },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.MarkdownText,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: ["hello", "world"] },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Date,
              typeProperty: {
                ...COMMON_SETUP.typeProperty,
                defaultValue: [new Date().toLocaleString(), new Date().toLocaleString()],
              },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Bool,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: [true, false] },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Integer,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: [1, 2] },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Number,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: [1.5, 2.5] },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              typeProperty: {
                ...COMMON_SETUP.typeProperty,
                defaultValue: ["https://hello.com/", "https://world.com/"],
              },
            },
          },
        ])("$setup.type field default value type match", async ({ expectedResult, setup }) => {
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
          multiple: true,
          required: true,
          typeProperty: {},
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Text,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: ["hello", "world"] },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.TextArea,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: ["hello", "world"] },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.MarkdownText,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: ["hello", "world"] },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Date,
              typeProperty: {
                ...COMMON_SETUP.typeProperty,
                defaultValue: [new Date().toISOString()],
              },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Bool,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: [true, false] },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Integer,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: [1, 2] },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Number,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: [1.5, 2.5] },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              typeProperty: {
                ...COMMON_SETUP.typeProperty,
                defaultValue: ["https://hello.com/", "https://world.com/"],
              },
            },
          },
        ])("$setup.type field default value type match", async ({ expectedResult, setup }) => {
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
          multiple: true,
          required: true,
          typeProperty: {
            selectDefaultValue: ["blue"],
            values: ["red", "green", "blue"],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Select },
          },
        ])("$setup.type field default value type match", async ({ expectedResult, setup }) => {
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
          multiple: true,
          required: true,
          typeProperty: {
            defaultValue: Test.GEO_JSON_POINT,
            objectSupportedTypes: ["POINT"] as ObjectSupportedType[],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
          },
        ])("$setup.type field default value type match", async ({ expectedResult, setup }) => {
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
          multiple: true,
          required: true,
          typeProperty: {
            defaultValue: Test.GEO_JSON_POINT,
            editorSupportedTypes: ["POINT"] as EditorSupportedType[],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
          },
        ])("$setup.type field default value type match", async ({ expectedResult, setup }) => {
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
          multiple: true,
          required: true,
          typeProperty: {},
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          isValid: false,
          outOfRangeFieldKeysCount: 0,
          typeMismatchFieldKeysCount: 1,
        };

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Text,
              typeProperty: {
                ...COMMON_SETUP,
                defaultValue: 123,
              },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.TextArea,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: 123 },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.MarkdownText,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: 123 },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Date,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "hello" },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Bool,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "true" },
            },
          },
          // TODO: select wrong default value type
          // {
          //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Select },
          //   expectedResult: EXPECTED_RESULT,
          // },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Integer,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "1" },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Number,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "1.5" },
            },
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "hello" },
            },
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
        ])("$setup.type field default value type mismatch", async ({ expectedResult, setup }) => {
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

          const { exceedLimit, outOfRangeFieldKeys, typeMismatchFieldKeys } =
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
          multiple: true,
          required: true,
          typeProperty: {
            selectDefaultValue: "blue",
            values: ["red", "green", "blue"],
          },
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          isValid: false,
          outOfRangeFieldKeysCount: 0,
          typeMismatchFieldKeysCount: 1,
        };

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Select },
          },
        ])("$setup.type field default value type mismatch", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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

          const { exceedLimit, outOfRangeFieldKeys, typeMismatchFieldKeys } =
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
          multiple: true,
          required: true,
          typeProperty: {
            defaultValue: Test.GEO_JSON_POINT,
            objectSupportedTypes: ["POINT"] as ObjectSupportedType[],
          },
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          isValid: false,
          outOfRangeFieldKeysCount: 0,
          typeMismatchFieldKeysCount: 1,
        };

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
          },
        ])("$setup.type field default value type mismatch", async ({ expectedResult, setup }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              key: setup.key,
              multiple: setup.multiple,
              required: setup.required,
              type: setup.type,
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

          const { exceedLimit, outOfRangeFieldKeys, typeMismatchFieldKeys } =
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
          multiple: true,
          required: true,
          typeProperty: {
            defaultValue: Test.GEO_JSON_POINT,
            editorSupportedTypes: ["POINT"] as EditorSupportedType[],
          },
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          isValid: false,
          outOfRangeFieldKeysCount: 0,
          typeMismatchFieldKeysCount: 1,
        };

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
          },
        ])("$setup.type field default value type mismatch", async ({ expectedResult, setup }) => {
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

          const { exceedLimit, outOfRangeFieldKeys, typeMismatchFieldKeys } =
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
            multiple: false,
            required: true,
            typeProperty: {},
          };

          const EXPECTED_RESULT = true;

          test.each([
            {
              expectedResult: EXPECTED_RESULT,
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Integer,
                typeProperty: { ...COMMON_SETUP.typeProperty, max: 5, min: -5 },
                value: 2,
              },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Number,
                typeProperty: { ...COMMON_SETUP.typeProperty, max: 5.5, min: -5.5 },
                value: 2.5,
              },
            },
          ])("$setup.type field value in range", async ({ expectedResult, setup }) => {
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
            multiple: false,
            required: true,
            typeProperty: {},
          };

          const EXPECTED_RESULT = {
            exceedLimit: false,
            isValid: false,
            outOfRangeFieldKeysCount: 1,
            typeMismatchFieldKeysCount: 0,
          };

          test.each([
            {
              expectedResult: EXPECTED_RESULT,
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Integer,
                typeProperty: { ...COMMON_SETUP.typeProperty, max: 5, min: -5 },
                value: 7,
              },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Number,
                typeProperty: { ...COMMON_SETUP.typeProperty, max: 5.5, min: -5.5 },
                value: 10.5,
              },
            },
          ])("$setup.type field value out of range", async ({ expectedResult, setup }) => {
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

            const { exceedLimit, outOfRangeFieldKeys, typeMismatchFieldKeys } =
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
            multiple: false,
            required: true,
            typeProperty: {},
          };

          const EXPECTED_RESULT = true;

          test.each([
            {
              expectedResult: EXPECTED_RESULT,
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Text,
                typeProperty: { ...COMMON_SETUP.typeProperty, maxLength: 10 },
                value: "hello",
              },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.TextArea,
                typeProperty: { ...COMMON_SETUP.typeProperty, maxLength: 10 },
                value: "hello",
              },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.MarkdownText,
                typeProperty: { ...COMMON_SETUP.typeProperty, maxLength: 10 },
                value: "hello",
              },
            },
          ])("$setup.type field value in range", async ({ expectedResult, setup }) => {
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
            multiple: false,
            required: true,
            typeProperty: {},
          };

          const EXPECTED_RESULT = {
            exceedLimit: false,
            isValid: false,
            outOfRangeFieldKeysCount: 1,
            typeMismatchFieldKeysCount: 0,
          };

          test.each([
            {
              expectedResult: EXPECTED_RESULT,
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Text,
                typeProperty: { ...COMMON_SETUP.typeProperty, maxLength: 10 },
                value: "hello world",
              },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.TextArea,
                typeProperty: { ...COMMON_SETUP.typeProperty, maxLength: 10 },
                value: "hello world",
              },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.MarkdownText,
                typeProperty: { ...COMMON_SETUP.typeProperty, maxLength: 10 },
                value: "hello world",
              },
            },
          ])("$setup.type field value out of range", async ({ expectedResult, setup }) => {
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

            const { exceedLimit, outOfRangeFieldKeys, typeMismatchFieldKeys } =
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
            multiple: false,
            required: true,
            typeProperty: {},
          };

          const EXPECTED_RESULT = true;

          test.each([
            {
              expectedResult: EXPECTED_RESULT,
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Select,
                typeProperty: { ...COMMON_SETUP.typeProperty, values: ["red", "green", "blue"] },
                value: "green",
              },
            },
          ])("$setup.type field value in range", async ({ expectedResult, setup }) => {
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
            multiple: false,
            required: true,
            typeProperty: {
              values: ["red", "green", "blue"],
            },
          };

          const EXPECTED_RESULT = {
            exceedLimit: false,
            isValid: false,
            outOfRangeFieldKeysCount: 1,
            typeMismatchFieldKeysCount: 0,
          };

          test.each([
            {
              expectedResult: EXPECTED_RESULT,
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Select,
                value: "yellow",
              },
            },
          ])("$setup.type field value in range", async ({ expectedResult, setup }) => {
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

            const { exceedLimit, outOfRangeFieldKeys, typeMismatchFieldKeys } =
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
            multiple: false,
            required: true,
            typeProperty: {},
          };

          const EXPECTED_RESULT = true;

          test.each([
            {
              expectedResult: EXPECTED_RESULT,
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Text, value: "text" },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: { ...COMMON_SETUP, type: SchemaFieldType.TextArea, value: "text" },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: { ...COMMON_SETUP, type: SchemaFieldType.MarkdownText, value: "text" },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Date,
                value: "2025-12-01T00:00:00+09:00",
              },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, value: true },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Select,
                typeProperty: { ...COMMON_SETUP.typeProperty, values: ["red", "blue", "green"] },
                value: "green",
              },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Integer, value: 1 },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Number, value: 1.5 },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.URL,
                value: "https://hello.com/",
              },
            },
            // {
            //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
            //   expectedResult: EXPECTED_RESULT,
            // },
            // {
            //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
            //   expectedResult: EXPECTED_RESULT,
            // },
          ])("$setup.type field count is below max records", async ({ expectedResult, setup }) => {
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
            multiple: false,
            required: true,
            typeProperty: {},
          };

          const EXPECTED_RESULT = {
            exceedLimit: true,
            isValid: false,
            outOfRangeFieldKeysCount: 0,
            typeMismatchFieldKeysCount: 0,
          };

          test.each([
            {
              expectedResult: EXPECTED_RESULT,
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Text, value: "text" },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: { ...COMMON_SETUP, type: SchemaFieldType.TextArea, value: "text" },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: { ...COMMON_SETUP, type: SchemaFieldType.MarkdownText, value: "text" },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Date,
                value: "2025-12-01T00:00:00+09:00",
              },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, value: true },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Select,
                typeProperty: { ...COMMON_SETUP.typeProperty, values: ["red", "blue", "green"] },
                value: "green",
              },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Integer, value: 1 },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Number, value: 1.5 },
            },
            {
              expectedResult: EXPECTED_RESULT,
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.URL,
                value: "https://hello.com/",
              },
            },
            // {
            //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
            //   expectedResult: EXPECTED_RESULT,
            // },
            // {
            //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
            //   expectedResult: EXPECTED_RESULT,
            // },
          ])("$setup.type field count is above max records", async ({ expectedResult, setup }) => {
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

            const { exceedLimit, outOfRangeFieldKeys, typeMismatchFieldKeys } =
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
          multiple: false,
          required: false,
          typeProperty: {},
        };

        const TEST_SETUP = {
          key1: "key-1",
          key2: "key-2",
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Text,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "default text" },
              value: "hello",
            },
            testSetup: TEST_SETUP,
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.TextArea,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "default text" },
              value: "text",
            },
            testSetup: TEST_SETUP,
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.MarkdownText,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "default text" },
              value: "text",
            },
            testSetup: TEST_SETUP,
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
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Bool,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: true },
              value: false,
            },
            testSetup: TEST_SETUP,
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Integer,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: 5 },
              value: 1,
            },
            testSetup: TEST_SETUP,
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Number,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: 5.5 },
              value: 1.5,
            },
            testSetup: TEST_SETUP,
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              typeProperty: { ...COMMON_SETUP.typeProperty, defaultValue: "https://default.com/" },
              value: "https://hello.com/",
            },
            testSetup: TEST_SETUP,
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
          async ({ expectedResult, setup, testSetup }) => {
            const fields = [
              {
                ...DEFAULT_COMMON_FIELD,
                key: testSetup.key1,
                multiple: setup.multiple,
                required: setup.required,
                type: setup.type,
                typeProperty: setup.typeProperty,
              },
              {
                ...DEFAULT_COMMON_FIELD,
                key: testSetup.key2,
                multiple: setup.multiple,
                required: setup.required,
                type: setup.type,
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
          multiple: false,
          required: false,
          typeProperty: {},
        };

        const TEST_SETUP = {
          key1: "key-1",
          key2: "key-2",
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Text,
              value: "hello",
            },
            testSetup: TEST_SETUP,
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.TextArea,
              value: "text",
            },
            testSetup: TEST_SETUP,
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.MarkdownText,
              value: "text",
            },
            testSetup: TEST_SETUP,
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
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Bool,
              value: false,
            },
            testSetup: TEST_SETUP,
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Integer,
              value: 1,
            },
            testSetup: TEST_SETUP,
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Number,
              value: 1.5,
            },
            testSetup: TEST_SETUP,
          },
          {
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              value: "https://hello.com/",
            },
            testSetup: TEST_SETUP,
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
          async ({ expectedResult, setup, testSetup }) => {
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
          multiple: false,
          required: false,
          typeProperty: {
            selectDefaultValue: "blue",
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
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Select,
              value: "green",
            },
            testSetup: TEST_SETUP,
          },
        ])(
          "$setup.type field auto fill value with default value",
          async ({ expectedResult, setup, testSetup }) => {
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
          multiple: false,
          required: false,
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
            expectedResult: EXPECTED_RESULT,
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Select,
              value: "green",
            },
            testSetup: TEST_SETUP,
          },
        ])(
          "$setup.type field auto fill value without default value",
          async ({ expectedResult, setup, testSetup }) => {
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
      { expected: false, hasContentCreateRight: true, hasModelFields: true },
      { expected: true, hasContentCreateRight: true, hasModelFields: false },
      { expected: true, hasContentCreateRight: false, hasModelFields: true },
      { expected: true, hasContentCreateRight: false, hasModelFields: false },
    ])(
      "hasContentCreateRight: $hasContentCreateRight, hasModelFields: $hasModelFields, expected: $expected",
      ({ expected, hasContentCreateRight, hasModelFields }) => {
        const result = ImportContentUtils.getUIMetadata({ hasContentCreateRight, hasModelFields });

        expect(result.shouldDisable).toEqual(expected);
      },
    );
  });
});
