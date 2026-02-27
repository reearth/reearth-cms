import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, test } from "vitest";

import { ExportSchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { Test } from "@reearth-cms/test/utils";

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
        "description" | "title" | "x-required" | "x-unique"
      > = {
        description: "test",
        title: "test",
        "x-required": false,
        "x-unique": false,
      };

      const EXPECTED_RESULT = true;

      test.each([
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maxLength: 30,
            "x-defaultValue": "hello world",
            "x-fieldType": ExportSchemaFieldType.Text,
            "x-multiple": false,
          } as FieldText,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maxLength: 30,
            "x-defaultValue": ["hello", "world"],
            "x-fieldType": ExportSchemaFieldType.Text,
            "x-multiple": true,
          } as FieldTextMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maxLength: 30,
            "x-defaultValue": "hello \n world",
            "x-fieldType": ExportSchemaFieldType.TextArea,
            "x-multiple": false,
          } as FieldTextArea,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maxLength: 30,
            "x-defaultValue": ["hello \n world", "hola \n mundo"],
            "x-fieldType": ExportSchemaFieldType.TextArea,
            "x-multiple": true,
          } as FieldTextAreaMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maxLength: 30,
            "x-defaultValue": "# H1 \n # H2 \n hello world",
            "x-fieldType": ExportSchemaFieldType.Markdown,
            "x-multiple": false,
          } as FieldMarkdownText,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maxLength: 30,
            "x-defaultValue": ["# H1 \n # H2 \n hello world", "# H1 \n # H2 \n hola mundo"],
            "x-fieldType": ExportSchemaFieldType.Markdown,
            "x-multiple": true,
          } as FieldMarkdownTextMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": "asset-id",
            "x-fieldType": ExportSchemaFieldType.Asset,
            "x-multiple": false,
          } as FieldAsset,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": ["asset-id-1", "asset-id-2"],
            "x-fieldType": ExportSchemaFieldType.Asset,
            "x-multiple": true,
          } as FieldAssetMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": "2025-12-01T00:00:00+09:00",
            "x-fieldType": ExportSchemaFieldType.Datetime,
            "x-multiple": false,
          } as FieldDate,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": ["2025-12-01T00:00:00+09:00", "2025-12-02T00:00:00+09:00"],
            "x-fieldType": ExportSchemaFieldType.Datetime,
            "x-multiple": true,
          } as FieldDateMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": true,
            "x-fieldType": ExportSchemaFieldType.Bool,
            "x-multiple": false,
          } as FieldBoolean,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [true, false],
            "x-fieldType": ExportSchemaFieldType.Bool,
            "x-multiple": true,
          } as FieldBooleanMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": "green",
            "x-fieldType": ExportSchemaFieldType.Select,
            "x-multiple": false,
            "x-options": ["red", "green", "blue"],
          } as FieldSelect,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": ["green", "blue"],
            "x-fieldType": ExportSchemaFieldType.Select,
            "x-multiple": true,
            "x-options": ["red", "green", "blue"],
          } as FieldSelectMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maximum: 5.5,
            minimum: -5.5,
            "x-defaultValue": 3.5,
            "x-fieldType": ExportSchemaFieldType.Number,
            "x-multiple": false,
          } as FieldNumber,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maximum: 5.5,
            minimum: -5.5,
            "x-defaultValue": [2.2, 4.4],
            "x-fieldType": ExportSchemaFieldType.Number,
            "x-multiple": true,
          } as FieldNumberMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maximum: 10,
            minimum: -10,
            "x-defaultValue": 5,
            "x-fieldType": ExportSchemaFieldType.Integer,
            "x-multiple": false,
          } as FieldInteger,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maximum: 10,
            minimum: -10,
            "x-defaultValue": [5, 6],
            "x-fieldType": ExportSchemaFieldType.Integer,
            "x-multiple": true,
          } as FieldIntegerMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": "https://hello.com/",
            "x-fieldType": ExportSchemaFieldType.URL,
            "x-multiple": false,
          } as FieldURL,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": ["https://hello.com/", "https://world.com/"],
            "x-fieldType": ExportSchemaFieldType.URL,
            "x-multiple": true,
          } as FieldURLMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_POINT,
            "x-fieldType": ExportSchemaFieldType.GeometryObject,
            "x-geoSupportedTypes": ["POINT"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_POINT],
            "x-fieldType": ExportSchemaFieldType.GeometryObject,
            "x-geoSupportedTypes": ["POINT"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_POINT,
            "x-fieldType": ExportSchemaFieldType.GeometryEditor,
            "x-geoSupportedType": "POINT",
            "x-multiple": false,
          } as FieldGeoEditor,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_POINT],
            "x-fieldType": ExportSchemaFieldType.GeometryEditor,
            "x-geoSupportedType": "POINT",
            "x-multiple": true,
          } as FieldGeoEditorMulti,
        },
      ])(
        "$setup.type field are legal with default value & multiple: $setup.x-multiple",
        async ({ expectedResult, setup }) => {
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
        "description" | "title" | "x-required" | "x-unique"
      > = {
        description: "test",
        title: "test",
        "x-required": false,
        "x-unique": false,
      };

      const EXPECTED_RESULT = true;

      test.each([
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Text,
            "x-multiple": false,
          } as FieldText,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Text,
            "x-multiple": true,
          } as FieldTextMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.TextArea,
            "x-multiple": false,
          } as FieldTextArea,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.TextArea,
            "x-multiple": true,
          } as FieldTextAreaMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Markdown,
            "x-multiple": false,
          } as FieldMarkdownText,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Markdown,
            "x-multiple": true,
          } as FieldMarkdownTextMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Asset,
            "x-multiple": false,
          } as FieldAsset,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Asset,
            "x-multiple": true,
          } as FieldAssetMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Datetime,
            "x-multiple": false,
          } as FieldDate,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Datetime,
            "x-multiple": true,
          } as FieldDateMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Bool,
            "x-multiple": false,
          } as FieldBoolean,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Bool,
            "x-multiple": true,
          } as FieldBooleanMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Select,
            "x-multiple": false,
            "x-options": ["red", "green", "blue"],
          } as FieldSelect,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Select,
            "x-multiple": true,
            "x-options": ["red", "green", "blue"],
          } as FieldSelectMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Number,
            "x-multiple": false,
          } as FieldNumber,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Number,
            "x-multiple": true,
          } as FieldNumberMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Integer,
            "x-multiple": false,
          } as FieldInteger,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.Integer,
            "x-multiple": true,
          } as FieldIntegerMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.URL,
            "x-multiple": false,
          } as FieldURL,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.URL,
            "x-multiple": true,
          } as FieldURLMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-fieldType": ExportSchemaFieldType.URL,
            "x-multiple": true,
          } as FieldURLMulti,
        },
      ])(
        "$setup.type field are legal with default value & multiple: $setup.x-multiple",
        async ({ expectedResult, setup }) => {
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
        "description" | "title" | "x-required" | "x-unique"
      > = {
        description: "test",
        title: "test",
        "x-required": false,
        "x-unique": false,
      };

      const EXPECTED_RESULT = false;

      test.each([
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maxLength: 1,
            "x-defaultValue": "hello world",
            "x-fieldType": ExportSchemaFieldType.Text,
            "x-multiple": false,
          } as FieldText,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maxLength: 1,
            "x-defaultValue": ["hello", "world"],
            "x-fieldType": ExportSchemaFieldType.Text,
            "x-multiple": true,
          } as FieldTextMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maxLength: 1,
            "x-defaultValue": "hello \n world",
            "x-fieldType": ExportSchemaFieldType.TextArea,
            "x-multiple": false,
          } as FieldTextArea,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maxLength: 1,
            "x-defaultValue": ["hello \n world", "hola \n mundo"],
            "x-fieldType": ExportSchemaFieldType.TextArea,
            "x-multiple": true,
          } as FieldTextAreaMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maxLength: 1,
            "x-defaultValue": "# H1 \n # H2 \n hello world",
            "x-fieldType": ExportSchemaFieldType.Markdown,
            "x-multiple": false,
          } as FieldMarkdownText,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maxLength: 1,
            "x-defaultValue": ["# H1 \n # H2 \n hello world", "# H1 \n # H2 \n hola mundo"],
            "x-fieldType": ExportSchemaFieldType.Markdown,
            "x-multiple": true,
          } as FieldMarkdownTextMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": "yellow",
            "x-fieldType": ExportSchemaFieldType.Select,
            "x-multiple": false,
            "x-options": ["red", "green", "blue"],
          } as FieldSelect,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": ["black", "white"],
            "x-fieldType": ExportSchemaFieldType.Select,
            "x-multiple": true,
            "x-options": ["red", "green", "blue"],
          } as FieldSelectMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maximum: 5.5,
            minimum: -5.5,
            "x-defaultValue": 10.5,
            "x-fieldType": ExportSchemaFieldType.Number,
            "x-multiple": false,
          } as FieldNumber,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maximum: 5.5,
            minimum: -5.5,
            "x-defaultValue": [-10.5, 20.5],
            "x-fieldType": ExportSchemaFieldType.Number,
            "x-multiple": true,
          } as FieldNumberMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maximum: 10,
            minimum: -10,
            "x-defaultValue": 50,
            "x-fieldType": ExportSchemaFieldType.Integer,
            "x-multiple": false,
          } as FieldInteger,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maximum: 10,
            minimum: -10,
            "x-defaultValue": [-50, 50],
            "x-fieldType": ExportSchemaFieldType.Integer,
            "x-multiple": true,
          } as FieldIntegerMulti,
        },
      ])(
        "$setup.type field are illegal with default value & multiple: $setup.x-multiple",
        async ({ expectedResult, setup }) => {
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
        "description" | "title" | "x-required" | "x-unique"
      > = {
        description: "test",
        title: "test",
        "x-required": false,
        "x-unique": false,
      };

      const EXPECTED_RESULT = false;

      test.each([
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maxLength: 30,
            "x-defaultValue": 1,
            "x-fieldType": ExportSchemaFieldType.Text,
            "x-multiple": false,
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maxLength: 30,
            "x-defaultValue": [1, 2],
            "x-fieldType": ExportSchemaFieldType.Text,
            "x-multiple": true,
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maxLength: 30,
            "x-defaultValue": 5566,
            "x-fieldType": ExportSchemaFieldType.TextArea,
            "x-multiple": false,
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maxLength: 30,
            "x-defaultValue": [false, true],
            "x-fieldType": ExportSchemaFieldType.TextArea,
            "x-multiple": true,
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maxLength: 30,
            "x-defaultValue": ["a", "b"],
            "x-fieldType": ExportSchemaFieldType.Markdown,
            "x-multiple": false,
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maxLength: 30,
            "x-defaultValue": "a",
            "x-fieldType": ExportSchemaFieldType.Markdown,
            "x-multiple": true,
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": 1,
            "x-fieldType": ExportSchemaFieldType.Asset,
            "x-multiple": false,
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [false, true],
            "x-fieldType": ExportSchemaFieldType.Asset,
            "x-multiple": true,
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": "false date format",
            "x-fieldType": ExportSchemaFieldType.Datetime,
            "x-multiple": false,
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": ["try this date", "againnnnnn"],
            "x-fieldType": ExportSchemaFieldType.Datetime,
            "x-multiple": true,
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": 123,
            "x-fieldType": ExportSchemaFieldType.Bool,
            "x-multiple": false,
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": "I am boooool",
            "x-fieldType": ExportSchemaFieldType.Bool,
            "x-multiple": true,
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": 1,
            "x-fieldType": ExportSchemaFieldType.Select,
            "x-multiple": false,
            "x-options": ["red", "green", "blue"],
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [true, "hello", "world"],
            "x-fieldType": ExportSchemaFieldType.Select,
            "x-multiple": true,
            "x-options": ["red", "green", "blue"],
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maximum: 5.5,
            minimum: -5.5,
            "x-defaultValue": "try this number",
            "x-fieldType": ExportSchemaFieldType.Number,
            "x-multiple": false,
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maximum: 5.5,
            minimum: -5.5,
            "x-defaultValue": ["just", "do", "it"],
            "x-fieldType": ExportSchemaFieldType.Number,
            "x-multiple": true,
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maximum: 10,
            minimum: -10,
            "x-defaultValue": false,
            "x-fieldType": ExportSchemaFieldType.Integer,
            "x-multiple": false,
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            maximum: 10,
            minimum: -10,
            "x-defaultValue": "super integer",
            "x-fieldType": ExportSchemaFieldType.Integer,
            "x-multiple": true,
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": "i am the dark web",
            "x-fieldType": ExportSchemaFieldType.URL,
            "x-multiple": false,
          },
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [false, "have you ever seen the rain"],
            "x-fieldType": ExportSchemaFieldType.URL,
            "x-multiple": true,
          },
        },
      ])(
        "$setup.type field are illegal with default value & multiple: $setup.x-multiple",
        async ({ expectedResult, setup }) => {
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
        "description" | "title" | "x-fieldType" | "x-required" | "x-unique"
      > = {
        description: "test",
        title: "test",
        "x-fieldType": ExportSchemaFieldType.GeometryObject,
        "x-required": false,
        "x-unique": false,
      };

      const EXPECTED_RESULT = true;

      test.each([
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedTypes": ["POINT"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedTypes": ["POINT"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedTypes": ["MULTIPOINT"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedTypes": ["MULTIPOINT"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedTypes": ["LINESTRING"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedTypes": ["LINESTRING"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedTypes": ["MULTILINESTRING"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedTypes": ["MULTILINESTRING"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedTypes": ["POLYGON"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedTypes": ["POLYGON"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedTypes": ["MULTIPOLYGON"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedTypes": ["MULTIPOLYGON"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedTypes": ["GEOMETRYCOLLECTION"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedTypes": ["GEOMETRYCOLLECTION"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
      ])(
        "Field are legal, geoSupportedTypes: $setup.x-geoSupportedTypes without default value & multiple: $setup.x-multiple",
        async ({ expectedResult, setup }) => {
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
        "description" | "title" | "x-fieldType" | "x-required" | "x-unique"
      > = {
        description: "test",
        title: "test",
        "x-fieldType": ExportSchemaFieldType.GeometryObject,
        "x-required": false,
        "x-unique": false,
      };

      const COMMON_EXPECTED_RESULT = true;

      test.each([
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_POINT,
            "x-geoSupportedTypes": ["POINT"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_POINT],
            "x-geoSupportedTypes": ["POINT"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_MULTI_POINT,
            "x-geoSupportedTypes": ["MULTIPOINT"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_MULTI_POINT],
            "x-geoSupportedTypes": ["MULTIPOINT"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_LINE_STRING,
            "x-geoSupportedTypes": ["LINESTRING"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_LINE_STRING],
            "x-geoSupportedTypes": ["LINESTRING"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_MULTI_LINE_STRING,
            "x-geoSupportedTypes": ["MULTILINESTRING"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_MULTI_LINE_STRING],
            "x-geoSupportedTypes": ["MULTILINESTRING"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_POLYGON,
            "x-geoSupportedTypes": ["POLYGON"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_POLYGON],
            "x-geoSupportedTypes": ["POLYGON"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_MULTI_POLYGON,
            "x-geoSupportedTypes": ["MULTIPOLYGON"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_MULTI_POLYGON],
            "x-geoSupportedTypes": ["MULTIPOLYGON"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_GEO_COLLECTION,
            "x-geoSupportedTypes": ["GEOMETRYCOLLECTION"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_GEO_COLLECTION],
            "x-geoSupportedTypes": ["GEOMETRYCOLLECTION"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
      ])(
        "Field are legal, geoSupportedTypes: $setup.x-geoSupportedTypes with default value & multiple: $setup.x-multiple",
        async ({ expectedResult, setup }) => {
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
        "description" | "title" | "x-fieldType" | "x-required" | "x-unique"
      > = {
        description: "test",
        title: "test",
        "x-fieldType": ExportSchemaFieldType.GeometryObject,
        "x-required": false,
        "x-unique": false,
      };

      const COMMON_EXPECTED_RESULT = false;

      test.each([
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_MULTI_POINT,
            "x-geoSupportedTypes": ["POINT"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_MULTI_POINT],
            "x-geoSupportedTypes": ["POINT"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_POINT,
            "x-geoSupportedTypes": ["MULTIPOINT"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_POINT],
            "x-geoSupportedTypes": ["MULTIPOINT"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_POINT,
            "x-geoSupportedTypes": ["LINESTRING"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_POINT],
            "x-geoSupportedTypes": ["LINESTRING"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_POINT,
            "x-geoSupportedTypes": ["MULTILINESTRING"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_POINT],
            "x-geoSupportedTypes": ["MULTILINESTRING"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_POINT,
            "x-geoSupportedTypes": ["POLYGON"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_POINT],
            "x-geoSupportedTypes": ["POLYGON"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_POINT,
            "x-geoSupportedTypes": ["MULTIPOLYGON"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_POINT],
            "x-geoSupportedTypes": ["MULTIPOLYGON"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_POINT,
            "x-geoSupportedTypes": ["GEOMETRYCOLLECTION"],
            "x-multiple": false,
          } as FieldGeoObject,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_POINT],
            "x-geoSupportedTypes": ["GEOMETRYCOLLECTION"],
            "x-multiple": true,
          } as FieldGeoObjectMulti,
        },
      ])(
        "Field are illegal, geoSupportedTypes: $setup.x-geoSupportedTypes with default value & multiple: $setup.x-multiple",
        async ({ expectedResult, setup }) => {
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
        "description" | "title" | "x-fieldType" | "x-required" | "x-unique"
      > = {
        description: "test",
        title: "test",
        "x-fieldType": ExportSchemaFieldType.GeometryEditor,
        "x-required": false,
        "x-unique": false,
      };

      const EXPECTED_RESULT = true;

      test.each([
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedType": "POINT",
            "x-multiple": false,
          } as FieldGeoEditor,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedType": "POINT",
            "x-multiple": true,
          } as FieldGeoEditorMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedType": "LINESTRING",
            "x-multiple": false,
          } as FieldGeoEditor,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedType": "LINESTRING",
            "x-multiple": true,
          } as FieldGeoEditorMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedType": "POLYGON",
            "x-multiple": false,
          } as FieldGeoEditor,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedType": "POLYGON",
            "x-multiple": true,
          } as FieldGeoEditorMulti,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedType": "ANY",
            "x-multiple": false,
          } as FieldGeoEditor,
        },
        {
          expectedResult: EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-geoSupportedType": "ANY",
            "x-multiple": true,
          } as FieldGeoEditorMulti,
        },
      ])(
        "Field are legal, geoSupportedType: $setup.x-geoSupportedType without default value & multiple: $setup.x-multiple",
        async ({ expectedResult, setup }) => {
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
        "description" | "title" | "x-fieldType" | "x-required" | "x-unique"
      > = {
        description: "test",
        title: "test",
        "x-fieldType": ExportSchemaFieldType.GeometryEditor,
        "x-required": false,
        "x-unique": false,
      };

      const COMMON_EXPECTED_RESULT = true;

      test.each([
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_POINT,
            "x-geoSupportedType": "POINT",
            "x-multiple": false,
          } as FieldGeoEditor,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_POINT],
            "x-geoSupportedType": "POINT",
            "x-multiple": true,
          } as FieldGeoEditorMulti,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_LINE_STRING,
            "x-geoSupportedType": "LINESTRING",
            "x-multiple": false,
          } as FieldGeoEditor,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_LINE_STRING],
            "x-geoSupportedType": "LINESTRING",
            "x-multiple": true,
          } as FieldGeoEditorMulti,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_POLYGON,
            "x-geoSupportedType": "POLYGON",
            "x-multiple": false,
          } as FieldGeoEditor,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_POLYGON],
            "x-geoSupportedType": "POLYGON",
            "x-multiple": true,
          } as FieldGeoEditorMulti,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_POINT,
            "x-geoSupportedType": "ANY",
            "x-multiple": false,
          } as FieldGeoEditor,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [
              Test.GEO_JSON_POINT,
              Test.GEO_JSON_LINE_STRING,
              Test.GEO_JSON_POLYGON,
            ],
            "x-geoSupportedType": "ANY",
            "x-multiple": true,
          } as FieldGeoEditorMulti,
        },
      ])(
        "Field are legal, geoSupportedType: $setup.x-geoSupportedType with default value & multiple: $setup.x-multiple",
        async ({ expectedResult, setup }) => {
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
        "description" | "title" | "x-fieldType" | "x-required" | "x-unique"
      > = {
        description: "test",
        title: "test",
        "x-fieldType": ExportSchemaFieldType.GeometryEditor,
        "x-required": false,
        "x-unique": false,
      };

      const COMMON_EXPECTED_RESULT = false;

      test.each([
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_LINE_STRING,
            "x-geoSupportedType": "POINT",
            "x-multiple": false,
          } as FieldGeoEditor,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_LINE_STRING],
            "x-geoSupportedType": "POINT",
            "x-multiple": true,
          } as FieldGeoEditorMulti,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_POINT,
            "x-geoSupportedType": "LINESTRING",
            "x-multiple": false,
          } as FieldGeoEditor,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_POINT],
            "x-geoSupportedType": "LINESTRING",
            "x-multiple": true,
          } as FieldGeoEditorMulti,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": Test.GEO_JSON_POINT,
            "x-geoSupportedType": "POLYGON",
            "x-multiple": false,
          } as FieldGeoEditor,
        },
        {
          expectedResult: COMMON_EXPECTED_RESULT,
          setup: {
            ...COMMON_SCHEMA_FIELD,
            "x-defaultValue": [Test.GEO_JSON_POINT],
            "x-geoSupportedType": "POLYGON",
            "x-multiple": true,
          } as FieldGeoEditorMulti,
        },
      ])(
        "Field are illegal, geoSupportedType: $setup.x-geoSupportedType with default value & multiple: $setup.x-multiple",
        async ({ expectedResult, setup }) => {
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

  describe("Test getUIMetadata method", () => {
    test.each([
      { expected: true, hasModelFields: true, hasSchemaCreateRight: true },
      { expected: false, hasModelFields: false, hasSchemaCreateRight: true },
      { expected: true, hasModelFields: true, hasSchemaCreateRight: false },
      { expected: true, hasModelFields: false, hasSchemaCreateRight: false },
    ])(
      "hasSchemaCreateRight: $hasSchemaCreateRight, hasModelFields: $hasModelFields, expected: $expected",
      ({ expected, hasModelFields, hasSchemaCreateRight }) => {
        const result = ImportSchemaUtils.getUIMetadata({ hasModelFields, hasSchemaCreateRight });

        expect(result.shouldDisable).toEqual(expected);
      },
    );
  });
});
