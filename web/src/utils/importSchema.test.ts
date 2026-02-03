import { readFileSync } from "fs";
import { join } from "path";

import { describe, expect, test } from "vitest";

import { ExportSchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { Test } from "@reearth-cms/test/utils.ts";

import { Constant } from "./constant";
import {
  FieldAsset,
  FieldAssetMulti,
  FieldBoolean,
  FieldBooleanMulti,
  FieldDate,
  FieldDateMulti,
  FieldGeoEditor,
  FieldGeoEditorMulti,
  FieldGeoObject,
  FieldGeoObjectMulti,
  FieldInteger,
  FieldIntegerMulti,
  FieldMarkdownText,
  FieldMarkdownTextMulti,
  FieldNumber,
  FieldNumberMulti,
  FieldSelect,
  FieldSelectMulti,
  FieldText,
  FieldTextArea,
  FieldTextAreaMulti,
  FieldTextMulti,
  FieldURL,
  FieldURLMulti,
  ImportSchema,
  ImportSchemaField,
  ImportSchemaUtils,
} from "./importSchema";
import { ObjectUtils } from "./object";

async function readFromJSONFile<T>(
  staticFileDirectory: string,
  baseDirectory = "public",
): Promise<ReturnType<typeof ObjectUtils.safeJSONParse<T>>> {
  const filePath = join(baseDirectory, staticFileDirectory);
  const fileContent = readFileSync(filePath, "utf-8");

  return await ObjectUtils.safeJSONParse(fileContent);
}

describe("Test import schema", () => {
  test("Validate schema from JSON file", async () => {
    const result = await readFromJSONFile<ImportSchema>(Constant.PUBLIC_FILE.IMPORT_SCHEMA_JSON);

    expect(result.isValid).toBe(true);

    if (!result.isValid) return;

    const validation = ImportSchemaUtils.validateSchemaFromJSON(result.data);

    expect(validation.isValid).toBe(true);
  });

  describe("Normal fields", () => {
    describe("[Pass case] Legal field type (full setup) from schema", () => {
      const COMMON_SCHEMA_FIELD: Pick<
        ImportSchemaField,
        "title" | "description" | "x-required" | "x-unique"
      > = {
        title: "test",
        description: "test",
        "x-required": false,
        "x-unique": false,
      };

      const EXPECTED_RESULT = true;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Text,
            maxLength: 30,
            "x-defaultValue": "hello world",
            "x-multiple": false,
          } as FieldText,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Text,
            maxLength: 30,
            "x-defaultValue": ["hello", "world"],
            "x-multiple": true,
          } as FieldTextMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.TextArea,
            maxLength: 30,
            "x-defaultValue": "hello \n world",
            "x-multiple": false,
          } as FieldTextArea,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.TextArea,
            maxLength: 30,
            "x-defaultValue": ["hello \n world", "hola \n mundo"],
            "x-multiple": true,
          } as FieldTextAreaMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Markdown,
            maxLength: 30,
            "x-defaultValue": "# H1 \n # H2 \n hello world",
            "x-multiple": false,
          } as FieldMarkdownText,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Markdown,
            maxLength: 30,
            "x-defaultValue": ["# H1 \n # H2 \n hello world", "# H1 \n # H2 \n hola mundo"],
            "x-multiple": true,
          } as FieldMarkdownTextMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Asset,
            "x-defaultValue": "asset-id",
            "x-multiple": false,
          } as FieldAsset,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Asset,
            "x-defaultValue": ["asset-id-1", "asset-id-2"],
            "x-multiple": true,
          } as FieldAssetMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Datetime,
            "x-defaultValue": "2025-12-01T00:00:00+09:00",
            "x-multiple": false,
          } as FieldDate,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Datetime,
            "x-defaultValue": ["2025-12-01T00:00:00+09:00", "2025-12-02T00:00:00+09:00"],
            "x-multiple": true,
          } as FieldDateMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Bool,
            "x-defaultValue": true,
            "x-multiple": false,
          } as FieldBoolean,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Bool,
            "x-defaultValue": [true, false],
            "x-multiple": true,
          } as FieldBooleanMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Select,
            "x-defaultValue": "green",
            "x-options": ["red", "green", "blue"],
            "x-multiple": false,
          } as FieldSelect,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Select,
            "x-defaultValue": ["green", "blue"],
            "x-options": ["red", "green", "blue"],
            "x-multiple": true,
          } as FieldSelectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Number,
            minimum: -5.5,
            maximum: 5.5,
            "x-defaultValue": 3.5,
            "x-multiple": false,
          } as FieldNumber,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Number,
            minimum: -5.5,
            maximum: 5.5,
            "x-defaultValue": [2.2, 4.4],
            "x-multiple": true,
          } as FieldNumberMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Integer,
            maximum: 10,
            minimum: -10,
            "x-defaultValue": 5,
            "x-multiple": false,
          } as FieldInteger,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Integer,
            maximum: 10,
            minimum: -10,
            "x-defaultValue": [5, 6],
            "x-multiple": true,
          } as FieldIntegerMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.URL,
            "x-defaultValue": "https://hello.com/",
            "x-multiple": false,
          } as FieldURL,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.URL,
            "x-defaultValue": ["https://hello.com/", "https://world.com/"],
            "x-multiple": true,
          } as FieldURLMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.GeometryObject,
            "x-multiple": false,
            "x-defaultValue": Test.GEO_JSON_POINT,
            "x-geoSupportedTypes": ["POINT"],
          } as FieldGeoObject,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.GeometryObject,
            "x-multiple": true,
            "x-defaultValue": [Test.GEO_JSON_POINT],
            "x-geoSupportedTypes": ["POINT"],
          } as FieldGeoObjectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.GeometryEditor,
            "x-multiple": false,
            "x-defaultValue": Test.GEO_JSON_POINT,
            "x-geoSupportedType": "POINT",
          } as FieldGeoEditor,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.GeometryEditor,
            "x-multiple": true,
            "x-defaultValue": [Test.GEO_JSON_POINT],
            "x-geoSupportedType": "POINT",
          } as FieldGeoEditorMulti,
          expectedResult: EXPECTED_RESULT,
        },
      ])(
        "$setup.type field are legal with default value & multiple: $setup.x-multiple",
        async ({ setup, expectedResult }) => {
          const parsedSetup: ImportSchema = {
            properties: { testField: setup },
          };

          const validation = ImportSchemaUtils.validateSchemaFromJSON(parsedSetup);

          expect(validation.isValid).toBe(expectedResult);

          if (!validation.isValid) return;

          expect(validation.data).toEqual(parsedSetup);
        },
      );
    });

    describe("[Pass case] Control variables: no defaultValue, minimum, maximum, maxLength", () => {
      const COMMON_SCHEMA_FIELD: Pick<
        ImportSchemaField,
        "title" | "description" | "x-required" | "x-unique"
      > = {
        title: "test",
        description: "test",
        "x-required": false,
        "x-unique": false,
      };

      const EXPECTED_RESULT = true;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Text,
            "x-multiple": false,
          } as FieldText,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Text,
            "x-multiple": true,
          } as FieldTextMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.TextArea,
            "x-multiple": false,
          } as FieldTextArea,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.TextArea,
            "x-multiple": true,
          } as FieldTextAreaMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Markdown,
            "x-multiple": false,
          } as FieldMarkdownText,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Markdown,
            "x-multiple": true,
          } as FieldMarkdownTextMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Asset,
            "x-multiple": false,
          } as FieldAsset,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Asset,
            "x-multiple": true,
          } as FieldAssetMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Datetime,
            "x-multiple": false,
          } as FieldDate,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Datetime,
            "x-multiple": true,
          } as FieldDateMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Bool,
            "x-multiple": false,
          } as FieldBoolean,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Bool,
            "x-multiple": true,
          } as FieldBooleanMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Select,
            "x-options": ["red", "green", "blue"],
            "x-multiple": false,
          } as FieldSelect,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Select,
            "x-options": ["red", "green", "blue"],
            "x-multiple": true,
          } as FieldSelectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Number,
            "x-multiple": false,
          } as FieldNumber,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Number,
            "x-multiple": true,
          } as FieldNumberMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Integer,
            "x-multiple": false,
          } as FieldInteger,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Integer,
            "x-multiple": true,
          } as FieldIntegerMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.URL,
            "x-multiple": false,
          } as FieldURL,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.URL,
            "x-multiple": true,
          } as FieldURLMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.URL,
            "x-multiple": true,
          } as FieldURLMulti,
          expectedResult: EXPECTED_RESULT,
        },
      ])(
        "$setup.type field are legal with default value & multiple: $setup.x-multiple",
        async ({ setup, expectedResult }) => {
          const parsedSetup: ImportSchema = {
            properties: { testField: setup },
          };

          const validation = ImportSchemaUtils.validateSchemaFromJSON(parsedSetup);

          expect(validation.isValid).toBe(expectedResult);

          if (!validation.isValid) return;

          expect(validation.data).toEqual(parsedSetup);
        },
      );
    });

    describe("[Fail case] Control variables: defaultValue out of range", () => {
      const COMMON_SCHEMA_FIELD: Pick<
        ImportSchemaField,
        "title" | "description" | "x-required" | "x-unique"
      > = {
        title: "test",
        description: "test",
        "x-required": false,
        "x-unique": false,
      };

      const EXPECTED_RESULT = false;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Text,
            maxLength: 1,
            "x-defaultValue": "hello world",
            "x-multiple": false,
          } as FieldText,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Text,
            maxLength: 1,
            "x-defaultValue": ["hello", "world"],
            "x-multiple": true,
          } as FieldTextMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.TextArea,
            maxLength: 1,
            "x-defaultValue": "hello \n world",
            "x-multiple": false,
          } as FieldTextArea,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.TextArea,
            maxLength: 1,
            "x-defaultValue": ["hello \n world", "hola \n mundo"],
            "x-multiple": true,
          } as FieldTextAreaMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Markdown,
            maxLength: 1,
            "x-defaultValue": "# H1 \n # H2 \n hello world",
            "x-multiple": false,
          } as FieldMarkdownText,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Markdown,
            maxLength: 1,
            "x-defaultValue": ["# H1 \n # H2 \n hello world", "# H1 \n # H2 \n hola mundo"],
            "x-multiple": true,
          } as FieldMarkdownTextMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Select,
            "x-defaultValue": "yellow",
            "x-options": ["red", "green", "blue"],
            "x-multiple": false,
          } as FieldSelect,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Select,
            "x-defaultValue": ["black", "white"],
            "x-options": ["red", "green", "blue"],
            "x-multiple": true,
          } as FieldSelectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Number,
            minimum: -5.5,
            maximum: 5.5,
            "x-defaultValue": 10.5,
            "x-multiple": false,
          } as FieldNumber,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Number,
            minimum: -5.5,
            maximum: 5.5,
            "x-defaultValue": [-10.5, 20.5],
            "x-multiple": true,
          } as FieldNumberMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Integer,
            maximum: 10,
            minimum: -10,
            "x-defaultValue": 50,
            "x-multiple": false,
          } as FieldInteger,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Integer,
            maximum: 10,
            minimum: -10,
            "x-defaultValue": [-50, 50],
            "x-multiple": true,
          } as FieldIntegerMulti,
          expectedResult: EXPECTED_RESULT,
        },
      ])(
        "$setup.type field are illegal with default value & multiple: $setup.x-multiple",
        async ({ setup, expectedResult }) => {
          const parsedSetup: ImportSchema = {
            properties: { testField: setup },
          };

          const validation = ImportSchemaUtils.validateSchemaFromJSON(parsedSetup);

          expect(validation.isValid).toBe(expectedResult);
        },
      );
    });

    describe("[Fail case] Illegal defaultValue type from schema", () => {
      const COMMON_SCHEMA_FIELD: Pick<
        ImportSchemaField,
        "title" | "description" | "x-required" | "x-unique"
      > = {
        title: "test",
        description: "test",
        "x-required": false,
        "x-unique": false,
      };

      const EXPECTED_RESULT = false;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Text,
            maxLength: 30,
            "x-defaultValue": 1,
            "x-multiple": false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Text,
            maxLength: 30,
            "x-defaultValue": [1, 2],
            "x-multiple": true,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.TextArea,
            maxLength: 30,
            "x-defaultValue": 5566,
            "x-multiple": false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.TextArea,
            maxLength: 30,
            "x-defaultValue": [false, true],
            "x-multiple": true,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Markdown,
            maxLength: 30,
            "x-defaultValue": ["a", "b"],
            "x-multiple": false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Markdown,
            maxLength: 30,
            "x-defaultValue": "a",
            "x-multiple": true,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Asset,
            "x-defaultValue": 1,
            "x-multiple": false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Asset,
            "x-defaultValue": [false, true],
            "x-multiple": true,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Datetime,
            "x-defaultValue": "false date format",
            "x-multiple": false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Datetime,
            "x-defaultValue": ["try this date", "againnnnnn"],
            "x-multiple": true,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Bool,
            "x-defaultValue": 123,
            "x-multiple": false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Bool,
            "x-defaultValue": "I am boooool",
            "x-multiple": true,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Select,
            "x-defaultValue": 1,
            "x-options": ["red", "green", "blue"],
            "x-multiple": false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Select,
            "x-defaultValue": [true, "hello", "world"],
            "x-options": ["red", "green", "blue"],
            "x-multiple": true,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Number,
            minimum: -5.5,
            maximum: 5.5,
            "x-defaultValue": "try this number",
            "x-multiple": false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Number,
            minimum: -5.5,
            maximum: 5.5,
            "x-defaultValue": ["just", "do", "it"],
            "x-multiple": true,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Integer,
            maximum: 10,
            minimum: -10,
            "x-defaultValue": false,
            "x-multiple": false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Integer,
            maximum: 10,
            minimum: -10,
            "x-defaultValue": "super integer",
            "x-multiple": true,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.URL,
            "x-defaultValue": "i am the dark web",
            "x-multiple": false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.URL,
            "x-defaultValue": [false, "have you ever seen the rain"],
            "x-multiple": true,
          },
          expectedResult: EXPECTED_RESULT,
        },
      ])(
        "$setup.type field are illegal with default value & multiple: $setup.x-multiple",
        async ({ setup, expectedResult }) => {
          const parsedSetup = {
            properties: { testField: setup },
          } as ImportSchema;

          const validation = ImportSchemaUtils.validateSchemaFromJSON(parsedSetup);

          expect(validation.isValid).toBe(expectedResult);
        },
      );
    });
  });

  describe("GeometryObject field", () => {
    describe("[Pass case] Control variables: support type, without default value", () => {
      const COMMON_SCHEMA_FIELD: Pick<
        ImportSchemaField,
        "title" | "description" | "x-required" | "x-unique" | "x-fieldType"
      > = {
        title: "test",
        description: "test",
        "x-required": false,
        "x-unique": false,
        "x-fieldType": ExportSchemaFieldType.GeometryObject,
      };

      const EXPECTED_RESULT = true;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["POINT"],
          } as FieldGeoObject,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["POINT"],
          } as FieldGeoObjectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["MULTIPOINT"],
          } as FieldGeoObject,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["MULTIPOINT"],
          } as FieldGeoObjectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["LINESTRING"],
          } as FieldGeoObject,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["LINESTRING"],
          } as FieldGeoObjectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["MULTILINESTRING"],
          } as FieldGeoObject,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["MULTILINESTRING"],
          } as FieldGeoObjectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["POLYGON"],
          } as FieldGeoObject,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["POLYGON"],
          } as FieldGeoObjectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["MULTIPOLYGON"],
          } as FieldGeoObject,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["MULTIPOLYGON"],
          } as FieldGeoObjectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["GEOMETRYCOLLECTION"],
          } as FieldGeoObject,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["GEOMETRYCOLLECTION"],
          } as FieldGeoObjectMulti,
          expectedResult: EXPECTED_RESULT,
        },
      ])(
        "Field are legal, geoSupportedTypes: $setup.x-geoSupportedTypes without default value & multiple: $setup.x-multiple",
        async ({ setup, expectedResult }) => {
          const parsedSetup: ImportSchema = {
            properties: { testField: setup },
          };

          const validation = ImportSchemaUtils.validateSchemaFromJSON(parsedSetup);

          expect(validation.isValid).toBe(expectedResult);

          if (!validation.isValid) return;

          expect(validation.data).toEqual(parsedSetup);
        },
      );
    });

    describe("[Pass case] Control variables: support type, with default value", () => {
      const COMMON_SCHEMA_FIELD: Pick<
        ImportSchemaField,
        "title" | "description" | "x-required" | "x-unique" | "x-fieldType"
      > = {
        title: "test",
        description: "test",
        "x-required": false,
        "x-unique": false,
        "x-fieldType": ExportSchemaFieldType.GeometryObject,
      };

      const COMMON_EXPECTED_RESULT = true;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["POINT"],
            "x-defaultValue": Test.GEO_JSON_POINT,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["POINT"],
            "x-defaultValue": [Test.GEO_JSON_POINT],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["MULTIPOINT"],
            "x-defaultValue": Test.GEO_JSON_MULTI_POINT,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["MULTIPOINT"],
            "x-defaultValue": [Test.GEO_JSON_MULTI_POINT],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["LINESTRING"],
            "x-defaultValue": Test.GEO_JSON_LINE_STRING,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["LINESTRING"],
            "x-defaultValue": [Test.GEO_JSON_LINE_STRING],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["MULTILINESTRING"],
            "x-defaultValue": Test.GEO_JSON_MULTI_LINE_STRING,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["MULTILINESTRING"],
            "x-defaultValue": [Test.GEO_JSON_MULTI_LINE_STRING],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["POLYGON"],
            "x-defaultValue": Test.GEO_JSON_POLYGON,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["POLYGON"],
            "x-defaultValue": [Test.GEO_JSON_POLYGON],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["MULTIPOLYGON"],
            "x-defaultValue": Test.GEO_JSON_MULTI_POLYGON,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["MULTIPOLYGON"],
            "x-defaultValue": [Test.GEO_JSON_MULTI_POLYGON],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["GEOMETRYCOLLECTION"],
            "x-defaultValue": Test.GEO_JSON_GEO_COLLECTION,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["GEOMETRYCOLLECTION"],
            "x-defaultValue": [Test.GEO_JSON_GEO_COLLECTION],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
      ])(
        "Field are legal, geoSupportedTypes: $setup.x-geoSupportedTypes with default value & multiple: $setup.x-multiple",
        async ({ setup, expectedResult }) => {
          const parsedSetup: ImportSchema = {
            properties: { testField: setup },
          };

          const validation = ImportSchemaUtils.validateSchemaFromJSON(parsedSetup);

          expect(validation.isValid).toBe(expectedResult);

          if (!validation.isValid) return;

          expect(validation.data).toEqual(parsedSetup);
        },
      );
    });

    describe("[Fail case] Illegal defaultValue against supportType", () => {
      const COMMON_SCHEMA_FIELD: Pick<
        ImportSchemaField,
        "title" | "description" | "x-required" | "x-unique" | "x-fieldType"
      > = {
        title: "test",
        description: "test",
        "x-required": false,
        "x-unique": false,
        "x-fieldType": ExportSchemaFieldType.GeometryObject,
      };

      const COMMON_EXPECTED_RESULT = false;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["POINT"],
            "x-defaultValue": Test.GEO_JSON_MULTI_POINT,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["POINT"],
            "x-defaultValue": [Test.GEO_JSON_MULTI_POINT],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["MULTIPOINT"],
            "x-defaultValue": Test.GEO_JSON_POINT,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["MULTIPOINT"],
            "x-defaultValue": [Test.GEO_JSON_POINT],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["LINESTRING"],
            "x-defaultValue": Test.GEO_JSON_POINT,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["LINESTRING"],
            "x-defaultValue": [Test.GEO_JSON_POINT],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["MULTILINESTRING"],
            "x-defaultValue": Test.GEO_JSON_POINT,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["MULTILINESTRING"],
            "x-defaultValue": [Test.GEO_JSON_POINT],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["POLYGON"],
            "x-defaultValue": Test.GEO_JSON_POINT,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["POLYGON"],
            "x-defaultValue": [Test.GEO_JSON_POINT],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["MULTIPOLYGON"],
            "x-defaultValue": Test.GEO_JSON_POINT,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["MULTIPOLYGON"],
            "x-defaultValue": [Test.GEO_JSON_POINT],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedTypes": ["GEOMETRYCOLLECTION"],
            "x-defaultValue": Test.GEO_JSON_POINT,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedTypes": ["GEOMETRYCOLLECTION"],
            "x-defaultValue": [Test.GEO_JSON_POINT],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
      ])(
        "Field are illegal, geoSupportedTypes: $setup.x-geoSupportedTypes with default value & multiple: $setup.x-multiple",
        async ({ setup, expectedResult }) => {
          const parsedSetup: ImportSchema = {
            properties: { testField: setup },
          };

          const validation = ImportSchemaUtils.validateSchemaFromJSON(parsedSetup);

          expect(validation.isValid).toBe(expectedResult);

          if (!validation.isValid) return;

          expect(validation.data).toEqual(parsedSetup);
        },
      );
    });
  });

  describe("GeometryEditor field", () => {
    describe("[Pass case] Control variables: support type, without default value", () => {
      const COMMON_SCHEMA_FIELD: Pick<
        ImportSchemaField,
        "title" | "description" | "x-required" | "x-unique" | "x-fieldType"
      > = {
        title: "test",
        description: "test",
        "x-required": false,
        "x-unique": false,
        "x-fieldType": ExportSchemaFieldType.GeometryEditor,
      };

      const EXPECTED_RESULT = true;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedType": "POINT",
          } as FieldGeoEditor,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedType": "POINT",
          } as FieldGeoEditorMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedType": "LINESTRING",
          } as FieldGeoEditor,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedType": "LINESTRING",
          } as FieldGeoEditorMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedType": "POLYGON",
          } as FieldGeoEditor,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedType": "POLYGON",
          } as FieldGeoEditorMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedType": "ANY",
          } as FieldGeoEditor,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedType": "ANY",
          } as FieldGeoEditorMulti,
          expectedResult: EXPECTED_RESULT,
        },
      ])(
        "Field are legal, geoSupportedType: $setup.x-geoSupportedType without default value & multiple: $setup.x-multiple",
        async ({ setup, expectedResult }) => {
          const parsedSetup: ImportSchema = {
            properties: { testField: setup },
          };

          const validation = ImportSchemaUtils.validateSchemaFromJSON(parsedSetup);

          expect(validation.isValid).toBe(expectedResult);

          if (!validation.isValid) return;

          expect(validation.data).toEqual(parsedSetup);
        },
      );
    });

    describe("[Pass case] Control variables: support type, with default value", () => {
      const COMMON_SCHEMA_FIELD: Pick<
        ImportSchemaField,
        "title" | "description" | "x-required" | "x-unique" | "x-fieldType"
      > = {
        title: "test",
        description: "test",
        "x-required": false,
        "x-unique": false,
        "x-fieldType": ExportSchemaFieldType.GeometryEditor,
      };

      const COMMON_EXPECTED_RESULT = true;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedType": "POINT",
            "x-defaultValue": Test.GEO_JSON_POINT,
          } as FieldGeoEditor,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedType": "POINT",
            "x-defaultValue": [Test.GEO_JSON_POINT],
          } as FieldGeoEditorMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedType": "LINESTRING",
            "x-defaultValue": Test.GEO_JSON_LINE_STRING,
          } as FieldGeoEditor,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedType": "LINESTRING",
            "x-defaultValue": [Test.GEO_JSON_LINE_STRING],
          } as FieldGeoEditorMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedType": "POLYGON",
            "x-defaultValue": Test.GEO_JSON_POLYGON,
          } as FieldGeoEditor,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedType": "POLYGON",
            "x-defaultValue": [Test.GEO_JSON_POLYGON],
          } as FieldGeoEditorMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedType": "ANY",
            "x-defaultValue": Test.GEO_JSON_POINT,
          } as FieldGeoEditor,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedType": "ANY",
            "x-defaultValue": [
              Test.GEO_JSON_POINT,
              Test.GEO_JSON_LINE_STRING,
              Test.GEO_JSON_POLYGON,
            ],
          } as FieldGeoEditorMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
      ])(
        "Field are legal, geoSupportedType: $setup.x-geoSupportedType with default value & multiple: $setup.x-multiple",
        async ({ setup, expectedResult }) => {
          const parsedSetup: ImportSchema = {
            properties: { testField: setup },
          };

          const validation = ImportSchemaUtils.validateSchemaFromJSON(parsedSetup);

          expect(validation.isValid).toBe(expectedResult);

          if (!validation.isValid) return;

          expect(validation.data).toEqual(parsedSetup);
        },
      );
    });

    describe("[Fail case] Illegal defaultValue against supportType", () => {
      const COMMON_SCHEMA_FIELD: Pick<
        ImportSchemaField,
        "title" | "description" | "x-required" | "x-unique" | "x-fieldType"
      > = {
        title: "test",
        description: "test",
        "x-required": false,
        "x-unique": false,
        "x-fieldType": ExportSchemaFieldType.GeometryEditor,
      };

      const COMMON_EXPECTED_RESULT = false;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedType": "POINT",
            "x-defaultValue": Test.GEO_JSON_LINE_STRING,
          } as FieldGeoEditor,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedType": "POINT",
            "x-defaultValue": [Test.GEO_JSON_LINE_STRING],
          } as FieldGeoEditorMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedType": "LINESTRING",
            "x-defaultValue": Test.GEO_JSON_POINT,
          } as FieldGeoEditor,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedType": "LINESTRING",
            "x-defaultValue": [Test.GEO_JSON_POINT],
          } as FieldGeoEditorMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": false,
            "x-geoSupportedType": "POLYGON",
            "x-defaultValue": Test.GEO_JSON_POINT,
          } as FieldGeoEditor,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-multiple": true,
            "x-geoSupportedType": "POLYGON",
            "x-defaultValue": [Test.GEO_JSON_POINT],
          } as FieldGeoEditorMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
      ])(
        "Field are illegal, geoSupportedType: $setup.x-geoSupportedType with default value & multiple: $setup.x-multiple",
        async ({ setup, expectedResult }) => {
          const parsedSetup: ImportSchema = {
            properties: { testField: setup },
          };

          const validation = ImportSchemaUtils.validateSchemaFromJSON(parsedSetup);

          expect(validation.isValid).toBe(expectedResult);

          if (!validation.isValid) return;

          expect(validation.data).toEqual(parsedSetup);
        },
      );
    });
  });
});
