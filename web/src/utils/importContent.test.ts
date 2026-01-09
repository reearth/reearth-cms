import { readFileSync } from "fs";
import { join } from "path";

import { FeatureCollection, GeoJSON } from "geojson";
import { describe, expect, test } from "vitest";

import {
  EditorSupportedType,
  Field,
  ObjectSupportedType,
  SchemaFieldType,
} from "@reearth-cms/components/molecules/Schema/types";

import { Constant } from "./constant";
import {
  ContentSourceFormat,
  ImportContentJSON,
  ImportContentResultItem,
  ImportContentUtils,
} from "./importContent";
import { ObjectUtils } from "./object";

async function readFromJSONFile(
  staticFileDirectory: string,
  baseDirectory = "public",
): ReturnType<Awaited<typeof ObjectUtils.safeJSONParse<ImportContentJSON["results"]>>> {
  const filePath = join(baseDirectory, staticFileDirectory);
  const fileContent = readFileSync(filePath, "utf-8");

  const validation = await ObjectUtils.safeJSONParse<ImportContentJSON>(fileContent);

  return validation.isValid
    ? { isValid: validation.isValid, data: validation.data.results }
    : { isValid: validation.isValid, error: validation.error };
}

async function readFromCSVFile(
  staticFileDirectory: string,
  baseDirectory = "public",
): ReturnType<Awaited<typeof ImportContentUtils.convertCSVToJSON<ImportContentResultItem>>> {
  const filePath = join(baseDirectory, staticFileDirectory);
  const fileContent = readFileSync(filePath, "utf-8");

  return await ImportContentUtils.convertCSVToJSON<ImportContentResultItem>(fileContent);
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
          key: "text-1",
          typeProperty: {},
        },
        {
          type: SchemaFieldType.TextArea,
          key: "textarea-1",
          typeProperty: {},
        },
        {
          type: SchemaFieldType.MarkdownText,
          key: "markdown-text-1",
          typeProperty: {},
        },
        {
          type: SchemaFieldType.Asset,
          key: "asset-1",
          typeProperty: {},
        },
        {
          type: SchemaFieldType.Date,
          key: "date-1",
          typeProperty: {},
        },
        {
          type: SchemaFieldType.Bool,
          key: "boolean-1",
          typeProperty: {},
        },
        {
          type: SchemaFieldType.Select,
          key: "select-1",
          typeProperty: {
            values: ["red", "green", "blue"],
          },
        },
        {
          type: SchemaFieldType.Integer,
          key: "int-1",
          typeProperty: {},
        },
        {
          type: SchemaFieldType.Number,
          key: "float-1",
          typeProperty: {},
        },
        {
          type: SchemaFieldType.URL,
          key: "url-1",
          typeProperty: {},
        },
        {
          type: SchemaFieldType.GeometryObject,
          key: "geo-obj-1",
          typeProperty: {
            objectSupportedTypes: ["POINT"] as ObjectSupportedType[],
          },
        },
        {
          type: SchemaFieldType.GeometryEditor,
          key: "geo-edi-1",
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

        const EXPECTED_RESULT = {
          exceedLimit: false,
          typeMismatchFieldKeysCount: 0,
          outOfRangeFieldKeysCount: 0,
          isValid: true,
        };

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
              typeProperty: setup.typeProperty,
              multiple: false,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
              typeProperty: setup.typeProperty,
              multiple: false,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
              value: { type: "Point", coordinates: [139.6917, 35.6895] },
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
              value: { type: "Point", coordinates: [139.6917, 35.6895] },
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
              typeProperty: setup.typeProperty,
              multiple: false,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
              value: { type: "Point", coordinates: [139.6917, 35.6895] },
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.GeometryEditor,
              value: { type: "Point", coordinates: [139.6917, 35.6895] },
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
              multiple: false,
              typeProperty: {},
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] Select field value type match", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: false,
          typeProperty: {
            values: ["red", "green", "blue"],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Select, correctValue: "red" },
            expectedResult: EXPECTED_RESULT,
          },
        ])("$setup.type field value type match", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: false,
              typeProperty: {},
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] GeoObject field value type match", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: false,
          typeProperty: {
            objectSupportedTypes: ["POINT", "LINESTRING"] as ObjectSupportedType[],
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.GeometryObject,
              correctValue: { type: "Point", coordinates: [139.6917, 35.6895] },
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
              multiple: false,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] GeoEditor field value type match", () => {
        const COMMON_SETUP = {
          key: "field-key",
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
              correctValue: { type: "Point", coordinates: [139.6917, 35.6895] },
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
              multiple: false,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
              multiple: false,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Select, wrongValue: "yellow" },
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
              type: SchemaFieldType.GeometryEditor,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult.isValid);

          if (contentValidation.isValid) return;

          console.log("contentValidation", contentValidation);

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
              multiple: false,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
              multiple: false,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
            defaultValue: { coordinates: [139.6917, 35.6895], type: "Point" } as GeoJSON,
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
              typeProperty: setup.typeProperty,
              multiple: false,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
            defaultValue: { coordinates: [139.6917, 35.6895], type: "Point" } as GeoJSON,
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
              typeProperty: setup.typeProperty,
              multiple: false,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Text, defaultValue: 1 },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.TextArea, defaultValue: 1 },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.MarkdownText, defaultValue: 1 },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Date,
              defaultValue: "hello",
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, defaultValue: "text" },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Integer, defaultValue: "text" },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Number, defaultValue: "text" },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              defaultValue: 123,
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
              multiple: false,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
          key: "field-key",
          required: false,
          multiple: true,
          typeProperty: {},
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          typeMismatchFieldKeysCount: 0,
          outOfRangeFieldKeysCount: 0,
          isValid: true,
        };

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Text,
              defaultValues: ["hello", "world"],
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.TextArea,
              defaultValues: ["hello", "world"],
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.MarkdownText,
              defaultValues: ["hello", "world"],
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Date,
              defaultValues: [new Date().toLocaleString(), new Date().toLocaleString()],
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, defaultValues: [true, false] },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Integer, defaultValues: [1, 2] },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Number, defaultValues: [1.5, 2.5] },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              defaultValues: ["https://hello.com/", "https://world.com/"],
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
                defaultValue: setup.defaultValues,
              },
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.defaultValues,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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

      describe("[Pass case] Field with multiple default values type match", () => {
        const COMMON_SETUP = {
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
              defaultValues: ["hello", "world"],
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.TextArea,
              defaultValues: ["hello", "world"],
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.MarkdownText,
              defaultValues: ["hello", "world"],
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Date,
              defaultValues: [new Date().toISOString()],
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, defaultValues: [true, false] },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Integer, defaultValues: [1, 2] },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Number, defaultValues: [1.5, 2.5] },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              defaultValues: ["https://hello.com/", "https://world.com/"],
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
                defaultValue: setup.defaultValues,
              },
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.defaultValues,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );

          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] Select field with multiple default values type match", () => {
        const COMMON_SETUP = {
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );

          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] GeoObject field with multiple default values type match", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: true,
          typeProperty: {
            objectSupportedTypes: ["POINT"] as ObjectSupportedType[],
            defaultValue: { coordinates: [139.6917, 35.6895], type: "Point" } as GeoJSON,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );

          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });

      describe("[Pass case] GeoEditor field with multiple default values type match", () => {
        const COMMON_SETUP = {
          key: "field-key",
          required: true,
          multiple: true,
          typeProperty: {
            editorSupportedTypes: ["POINT"] as EditorSupportedType[],
            defaultValue: { coordinates: [139.6917, 35.6895], type: "Point" } as GeoJSON,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );

          expect(contentValidation.isValid).toBe(expectedResult);
        });
      });
    });

    describe("Control variables: multiple (true), required (true), with default value", () => {
      describe("[Fail case] Field with default values type mismatch", () => {
        const COMMON_SETUP = {
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
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Text, defaultValues: 123 },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.TextArea,
              defaultValues: 123,
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.MarkdownText,
              defaultValues: 123,
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Date, defaultValues: "hello" },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, defaultValues: "true" },
            expectedResult: EXPECTED_RESULT,
          },
          // TODO: select wrong default value type
          // {
          //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Select },
          //   expectedResult: EXPECTED_RESULT,
          // },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Integer, defaultValues: "1" },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Number, defaultValues: "1.5" },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              defaultValues: "hello",
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
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key,
              required: setup.required,
              multiple: setup.multiple,
              typeProperty: {
                defaultValue: setup.defaultValues,
              },
            },
          ];

          const contentList = [
            {
              [setup.key]: setup.defaultValues,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
            defaultValue: { coordinates: [139.6917, 35.6895], type: "Point" } as GeoJSON,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
          key: "field-key",
          required: true,
          multiple: true,
          typeProperty: {
            editorSupportedTypes: ["POINT"] as EditorSupportedType[],
            defaultValue: { coordinates: [139.6917, 35.6895], type: "Point" } as GeoJSON,
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
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
            key: "field-key",
            required: true,
            multiple: false,
            typeProperty: {},
          };

          const EXPECTED_RESULT = {
            exceedLimit: false,
            typeMismatchFieldKeysCount: 0,
            outOfRangeFieldKeysCount: 0,
            isValid: true,
          };

          test.each([
            {
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Integer, value: 2, min: -5, max: 5 },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Number,
                value: 2.5,
                min: -5.5,
                max: 5.5,
              },
              expectedResult: EXPECTED_RESULT,
            },
          ])("$setup.type field value in range", async ({ setup, expectedResult }) => {
            const fields = [
              {
                ...DEFAULT_COMMON_FIELD,
                type: setup.type,
                key: setup.key,
                required: setup.required,
                multiple: setup.multiple,
                typeProperty: {
                  min: setup.min,
                  max: setup.max,
                },
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
              Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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

        describe("[Fail case] Control variables: multiple (false), required (true), value out of range (min, max)", () => {
          const COMMON_SETUP = {
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
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Integer, value: 7, min: -5, max: 5 },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Number,
                value: 10.5,
                min: -5.5,
                max: 5.5,
              },
              expectedResult: EXPECTED_RESULT,
            },
          ])("$setup.type field value out of range", async ({ setup, expectedResult }) => {
            const fields = [
              {
                ...DEFAULT_COMMON_FIELD,
                type: setup.type,
                key: setup.key,
                required: setup.required,
                multiple: setup.multiple,
                typeProperty: {
                  min: setup.min,
                  max: setup.max,
                },
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
              Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
            key: "field-key",
            required: true,
            multiple: false,
            typeProperty: {},
          };

          const EXPECTED_RESULT = {
            exceedLimit: false,
            typeMismatchFieldKeysCount: 0,
            outOfRangeFieldKeysCount: 0,
            isValid: true,
          };

          test.each([
            {
              setup: { ...COMMON_SETUP, type: SchemaFieldType.Text, value: "hello", maxLength: 10 },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.TextArea,
                value: "hello",
                maxLength: 10,
              },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.MarkdownText,
                value: "hello",
                maxLength: 10,
              },
              expectedResult: EXPECTED_RESULT,
            },
          ])("$setup.type field value in range", async ({ setup, expectedResult }) => {
            const fields = [
              {
                ...DEFAULT_COMMON_FIELD,
                type: setup.type,
                key: setup.key,
                required: setup.required,
                multiple: setup.multiple,
                typeProperty: {
                  maxLength: setup.maxLength,
                },
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
              Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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

        describe("[Fail case] Control variables: multiple (false), required (true), value out of range (maxLength)", () => {
          const COMMON_SETUP = {
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
                maxLength: 10,
              },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.TextArea,
                value: "hello world",
                maxLength: 10,
              },
              expectedResult: EXPECTED_RESULT,
            },
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.MarkdownText,
                value: "hello world",
                maxLength: 10,
              },
              expectedResult: EXPECTED_RESULT,
            },
          ])("$setup.type field value out of range", async ({ setup, expectedResult }) => {
            const fields = [
              {
                ...DEFAULT_COMMON_FIELD,
                type: setup.type,
                key: setup.key,
                required: setup.required,
                multiple: setup.multiple,
                typeProperty: {
                  maxLength: setup.maxLength,
                },
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
              Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
            key: "field-key",
            required: true,
            multiple: false,
            typeProperty: {},
          };

          const EXPECTED_RESULT = {
            exceedLimit: false,
            typeMismatchFieldKeysCount: 0,
            outOfRangeFieldKeysCount: 0,
            isValid: true,
          };

          test.each([
            {
              setup: {
                ...COMMON_SETUP,
                type: SchemaFieldType.Select,
                value: "green",
                values: ["red", "green", "blue"],
              },
              expectedResult: EXPECTED_RESULT,
            },
          ])("$setup.type field value in range", async ({ setup, expectedResult }) => {
            const fields = [
              {
                ...DEFAULT_COMMON_FIELD,
                type: setup.type,
                key: setup.key,
                required: setup.required,
                multiple: setup.multiple,
                typeProperty: {
                  values: setup.values,
                },
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
              Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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

        describe("[Fail case] Control variables: multiple (false), required (true), value out of range (values)", () => {
          const COMMON_SETUP = {
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
              Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
            key: "correct-key",
            required: true,
            multiple: false,
            typeProperty: {},
          };

          const EXPECTED_RESULT = {
            exceedLimit: false,
            typeMismatchFieldKeysCount: 0,
            outOfRangeFieldKeysCount: 0,
            isValid: true,
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
                values: ["red", "blue", "green"],
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
            const fields = [
              {
                ...DEFAULT_COMMON_FIELD,
                type: setup.type,
                key: setup.key,
                required: setup.required,
                multiple: false,
                typeProperty: {},
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
              Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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

        describe("[Fail case] Control variables: content list length", () => {
          const COMMON_SETUP = {
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
                values: ["red", "blue", "green"],
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
            const fields = [
              {
                ...DEFAULT_COMMON_FIELD,
                type: setup.type,
                key: setup.key,
                required: setup.required,
                multiple: false,
                typeProperty: {},
              },
            ];

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
              Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
          key1: "key-1",
          key2: "key-2",
          required: false,
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
              defaultValue: "default text",
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.TextArea,
              value: "text",
              defaultValue: "default text",
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.MarkdownText,
              value: "text",
              defaultValue: "default text",
            },
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
              defaultValue: true,
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Integer,
              value: 1,
              defaultValue: 5,
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: { ...COMMON_SETUP, type: SchemaFieldType.Number, value: 1.5, defaultValue: 5.5 },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.URL,
              value: "https://hello.com/",
              defaultValue: "https://default.com/",
            },
            expectedResult: EXPECTED_RESULT,
          },
          // {
          //   setup: {
          //     ...COMMON_SETUP,
          //     type: SchemaFieldType.GeometryObject,
          //     value: { type: "Point", coordinates: [139.6917, 35.6895] },
          //     defaultValue: { type: "Point", coordinates: [149.6917, 45.6895] },
          //   },
          //   expectedResult: EXPECTED_RESULT,
          // },
          // {
          //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
          //   expectedResult: EXPECTED_RESULT,
          //   value: { type: "Point", coordinates: [139.6917, 35.6895] },
          //   defaultValue: { type: "Point", coordinates: [149.6917, 45.6895] },
          // },
        ])("$setup.type field auto fill with default value", async ({ setup, expectedResult }) => {
          const fields = [
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key1,
              required: setup.required,
              multiple: false,
              typeProperty: {
                defaultValue: setup.defaultValue,
              },
            },
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key2,
              required: setup.required,
              multiple: false,
              typeProperty: {
                defaultValue: setup.defaultValue,
              },
            },
          ];

          const contentList = [
            {
              [setup.key1]: setup.value,
              [setup.key2]: setup.value,
            },
          ];

          const expectContentList = [
            {
              [setup.key1]: setup.value,
              [setup.key2]: setup.value,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContent(
            contentList,
            fields,
            "JSON",
            Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
          );
          expect(contentValidation.isValid).toBe(expectedResult);

          if (contentValidation.isValid) expect(contentValidation.data).toEqual(expectContentList);
        });
      });

      describe("[Pass case] Control variables: field value without default value", () => {
        const COMMON_SETUP = {
          key1: "key-1",
          key2: "key-2",
          required: false,
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
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.TextArea,
              value: "text",
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.MarkdownText,
              value: "text",
            },
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
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Integer,
              value: 1,
            },
            expectedResult: EXPECTED_RESULT,
          },
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Number,
              value: 1.5,
            },
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
        ])(
          "$setup.type field use value instead of default value",
          async ({ setup, expectedResult }) => {
            const fields = [
              {
                ...DEFAULT_COMMON_FIELD,
                type: setup.type,
                key: setup.key1,
                required: setup.required,
                multiple: false,
                typeProperty: {},
              },
              {
                ...DEFAULT_COMMON_FIELD,
                type: setup.type,
                key: setup.key2,
                required: setup.required,
                multiple: false,
                typeProperty: {},
              },
            ];

            const contentList = [
              {
                [setup.key1]: setup.value,
                [setup.key2]: setup.value,
              },
            ];

            const expectContentList = [
              {
                [setup.key1]: setup.value,
                [setup.key2]: setup.value,
              },
            ];

            const contentValidation = await ImportContentUtils.validateContent(
              contentList,
              fields,
              "JSON",
              Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
            );
            expect(contentValidation.isValid).toBe(expectedResult);

            if (contentValidation.isValid)
              expect(contentValidation.data).toEqual(expectContentList);
          },
        );
      });

      describe("[Pass case] Control variables: field value with default value (select field)", () => {
        const COMMON_SETUP = {
          key1: "key-1",
          key2: "key-2",
          required: false,
          multiple: false,
          typeProperty: {
            values: ["red", "blue", "green"],
            selectDefaultValue: "blue",
          },
        };

        const EXPECTED_RESULT = true;

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Select,
              value: "green",
            },
            expectedResult: EXPECTED_RESULT,
          },
        ])(
          "$setup.type field auto fill value with default value",
          async ({ setup, expectedResult }) => {
            const fields = [
              {
                ...DEFAULT_COMMON_FIELD,
                type: setup.type,
                key: setup.key1,
                required: setup.required,
                typeProperty: setup.typeProperty,
                multiple: false,
              },
              {
                ...DEFAULT_COMMON_FIELD,
                type: setup.type,
                key: setup.key2,
                required: setup.required,
                typeProperty: setup.typeProperty,
                multiple: false,
              },
            ];

            const contentList = [
              {
                [setup.key1]: setup.value,
              },
            ];

            const expectContentList = [
              {
                [setup.key1]: setup.value,
                [setup.key2]: setup.typeProperty.selectDefaultValue,
              },
            ];

            const contentValidation = await ImportContentUtils.validateContent(
              contentList,
              fields,
              "JSON",
              Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
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
          key1: "key-1",
          key2: "key-2",
          required: false,
          multiple: false,
          typeProperty: {
            values: ["red", "blue", "green"],
          },
        };

        const EXPECTED_RESULT = {
          exceedLimit: false,
          typeMismatchFieldKeysCount: 0,
          outOfRangeFieldKeysCount: 0,
          isValid: true,
        };

        test.each([
          {
            setup: {
              ...COMMON_SETUP,
              type: SchemaFieldType.Select,
              value: "green",
            },
            expectedResult: EXPECTED_RESULT,
          },
        ])(
          "$setup.type field auto fill value without default value",
          async ({ setup, expectedResult }) => {
            const fields = [
              {
                ...DEFAULT_COMMON_FIELD,
                type: setup.type,
                key: setup.key1,
                required: setup.required,
                multiple: false,
                typeProperty: setup.typeProperty,
              },
              {
                ...DEFAULT_COMMON_FIELD,
                type: setup.type,
                key: setup.key2,
                required: setup.required,
                multiple: false,
                typeProperty: setup.typeProperty,
              },
            ];

            const contentList = [
              {
                [setup.key1]: setup.value,
              },
            ];

            const expectContentList = [
              {
                [setup.key1]: setup.value,
              },
            ];

            const contentValidation = await ImportContentUtils.validateContent(
              contentList,
              fields,
              "JSON",
              Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
            );
            expect(contentValidation.isValid).toBe(expectedResult.isValid);

            if (contentValidation.isValid) {
              expect(contentValidation.data).toEqual(expectContentList);
            } else {
              const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } =
                contentValidation.error;

              expect(exceedLimit).toBe(expectedResult.exceedLimit);
              expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
              expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
            }
          },
        );
      });
    });
  });
});
