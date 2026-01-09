import { readFileSync } from "fs";
import { join } from "path";

import { describe, expect, test } from "vitest";

import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";

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
import { Test } from "./test";

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
        "title" | "description" | "required" | "unique"
      > = {
        title: "test",
        description: "test",
        required: false,
        unique: false,
      };

      const EXPECTED_RESULT = true;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Text,
            maxLength: 30,
            defaultValue: "hello world",
            multiple: false,
          } as FieldText,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Text,
            maxLength: 30,
            defaultValue: ["hello", "world"],
            multiple: true,
          } as FieldTextMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.TextArea,
            maxLength: 30,
            defaultValue: "hello \n world",
            multiple: false,
          } as FieldTextArea,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.TextArea,
            maxLength: 30,
            defaultValue: ["hello \n world", "hola \n mundo"],
            multiple: true,
          } as FieldTextAreaMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.MarkdownText,
            maxLength: 30,
            defaultValue: "# H1 \n # H2 \n hello world",
            multiple: false,
          } as FieldMarkdownText,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.MarkdownText,
            maxLength: 30,
            defaultValue: ["# H1 \n # H2 \n hello world", "# H1 \n # H2 \n hola mundo"],
            multiple: true,
          } as FieldMarkdownTextMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Asset,
            defaultValue: "asset-id",
            multiple: false,
          } as FieldAsset,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Asset,
            defaultValue: ["asset-id-1", "asset-id-2"],
            multiple: true,
          } as FieldAssetMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Date,
            defaultValue: "2025-12-01T00:00:00+09:00",
            multiple: false,
          } as FieldDate,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Date,
            defaultValue: ["2025-12-01T00:00:00+09:00", "2025-12-02T00:00:00+09:00"],
            multiple: true,
          } as FieldDateMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Bool,
            defaultValue: true,
            multiple: false,
          } as FieldBoolean,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Bool,
            defaultValue: [true, false],
            multiple: true,
          } as FieldBooleanMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Select,
            defaultValue: "green",
            values: ["red", "green", "blue"],
            multiple: false,
          } as FieldSelect,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Select,
            defaultValue: ["green", "blue"],
            values: ["red", "green", "blue"],
            multiple: true,
          } as FieldSelectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Number,
            minimum: -5.5,
            maximum: 5.5,
            defaultValue: 3.5,
            multiple: false,
          } as FieldNumber,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Number,
            minimum: -5.5,
            maximum: 5.5,
            defaultValue: [2.2, 4.4],
            multiple: true,
          } as FieldNumberMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Integer,
            maximum: 10,
            minimum: -10,
            defaultValue: 5,
            multiple: false,
          } as FieldInteger,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Integer,
            maximum: 10,
            minimum: -10,
            defaultValue: [5, 6],
            multiple: true,
          } as FieldIntegerMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.URL,
            defaultValue: "https://hello.com/",
            multiple: false,
          } as FieldURL,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.URL,
            defaultValue: ["https://hello.com/", "https://world.com/"],
            multiple: true,
          } as FieldURLMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.GeometryObject,
            multiple: false,
            defaultValue: Test.GEO_JSON_POINT,
            supportType: ["POINT"],
          } as FieldGeoObject,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.GeometryObject,
            multiple: true,
            defaultValue: [Test.GEO_JSON_POINT],
            supportType: ["POINT"],
          } as FieldGeoObjectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.GeometryEditor,
            multiple: false,
            defaultValue: Test.GEO_JSON_POINT,
            supportType: "POINT",
          } as FieldGeoEditor,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.GeometryEditor,
            multiple: true,
            defaultValue: [Test.GEO_JSON_POINT],
            supportType: "POINT",
          } as FieldGeoEditorMulti,
          expectedResult: EXPECTED_RESULT,
        },
      ])(
        "$setup.type field are legal with default value & multiple: $setup.multiple",
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
        "title" | "description" | "required" | "unique"
      > = {
        title: "test",
        description: "test",
        required: false,
        unique: false,
      };

      const EXPECTED_RESULT = true;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Text,
            multiple: false,
          } as FieldText,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Text,
            multiple: true,
          } as FieldTextMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.TextArea,
            multiple: false,
          } as FieldTextArea,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.TextArea,
            multiple: true,
          } as FieldTextAreaMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.MarkdownText,
            multiple: false,
          } as FieldMarkdownText,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.MarkdownText,
            multiple: true,
          } as FieldMarkdownTextMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Asset,
            multiple: false,
          } as FieldAsset,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Asset,
            multiple: true,
          } as FieldAssetMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Date,
            multiple: false,
          } as FieldDate,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Date,
            multiple: true,
          } as FieldDateMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Bool,
            multiple: false,
          } as FieldBoolean,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Bool,
            multiple: true,
          } as FieldBooleanMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Select,
            values: ["red", "green", "blue"],
            multiple: false,
          } as FieldSelect,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Select,
            values: ["red", "green", "blue"],
            multiple: true,
          } as FieldSelectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Number,
            multiple: false,
          } as FieldNumber,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Number,
            multiple: true,
          } as FieldNumberMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Integer,
            multiple: false,
          } as FieldInteger,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Integer,
            multiple: true,
          } as FieldIntegerMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.URL,
            multiple: false,
          } as FieldURL,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.URL,
            multiple: true,
          } as FieldURLMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.URL,
            multiple: true,
          } as FieldURLMulti,
          expectedResult: EXPECTED_RESULT,
        },
      ])(
        "$setup.type field are legal with default value & multiple: $setup.multiple",
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
        "title" | "description" | "required" | "unique"
      > = {
        title: "test",
        description: "test",
        required: false,
        unique: false,
      };

      const EXPECTED_RESULT = false;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Text,
            maxLength: 1,
            defaultValue: "hello world",
            multiple: false,
          } as FieldText,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Text,
            maxLength: 1,
            defaultValue: ["hello", "world"],
            multiple: true,
          } as FieldTextMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.TextArea,
            maxLength: 1,
            defaultValue: "hello \n world",
            multiple: false,
          } as FieldTextArea,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.TextArea,
            maxLength: 1,
            defaultValue: ["hello \n world", "hola \n mundo"],
            multiple: true,
          } as FieldTextAreaMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.MarkdownText,
            maxLength: 1,
            defaultValue: "# H1 \n # H2 \n hello world",
            multiple: false,
          } as FieldMarkdownText,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.MarkdownText,
            maxLength: 1,
            defaultValue: ["# H1 \n # H2 \n hello world", "# H1 \n # H2 \n hola mundo"],
            multiple: true,
          } as FieldMarkdownTextMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Select,
            defaultValue: "yellow",
            values: ["red", "green", "blue"],
            multiple: false,
          } as FieldSelect,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Select,
            defaultValue: ["black", "white"],
            values: ["red", "green", "blue"],
            multiple: true,
          } as FieldSelectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Number,
            minimum: -5.5,
            maximum: 5.5,
            defaultValue: 10.5,
            multiple: false,
          } as FieldNumber,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Number,
            minimum: -5.5,
            maximum: 5.5,
            defaultValue: [-10.5, 20.5],
            multiple: true,
          } as FieldNumberMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Integer,
            maximum: 10,
            minimum: -10,
            defaultValue: 50,
            multiple: false,
          } as FieldInteger,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Integer,
            maximum: 10,
            minimum: -10,
            defaultValue: [-50, 50],
            multiple: true,
          } as FieldIntegerMulti,
          expectedResult: EXPECTED_RESULT,
        },
      ])(
        "$setup.type field are illegal with default value & multiple: $setup.multiple",
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
        "title" | "description" | "required" | "unique"
      > = {
        title: "test",
        description: "test",
        required: false,
        unique: false,
      };

      const EXPECTED_RESULT = false;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Text,
            maxLength: 30,
            defaultValue: 1,
            multiple: false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Text,
            maxLength: 30,
            defaultValue: [1, 2],
            multiple: true,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.TextArea,
            maxLength: 30,
            defaultValue: 5566,
            multiple: false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.TextArea,
            maxLength: 30,
            defaultValue: [false, true],
            multiple: true,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.MarkdownText,
            maxLength: 30,
            defaultValue: ["a", "b"],
            multiple: false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.MarkdownText,
            maxLength: 30,
            defaultValue: "a",
            multiple: true,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Asset,
            defaultValue: 1,
            multiple: false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Asset,
            defaultValue: [false, true],
            multiple: true,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Date,
            defaultValue: "false date format",
            multiple: false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Date,
            defaultValue: ["try this date", "againnnnnn"],
            multiple: true,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Bool,
            defaultValue: 123,
            multiple: false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Bool,
            defaultValue: "I am boooool",
            multiple: true,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Select,
            defaultValue: 1,
            values: ["red", "green", "blue"],
            multiple: false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Select,
            defaultValue: [true, "hello", "world"],
            values: ["red", "green", "blue"],
            multiple: true,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Number,
            minimum: -5.5,
            maximum: 5.5,
            defaultValue: "try this number",
            multiple: false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Number,
            minimum: -5.5,
            maximum: 5.5,
            defaultValue: ["just", "do", "it"],
            multiple: true,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Integer,
            maximum: 10,
            minimum: -10,
            defaultValue: false,
            multiple: false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.Integer,
            maximum: 10,
            minimum: -10,
            defaultValue: "super integer",
            multiple: true,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.URL,
            defaultValue: "i am the dark web",
            multiple: false,
          },
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            type: SchemaFieldType.URL,
            defaultValue: [false, "have you ever seen the rain"],
            multiple: true,
          },
          expectedResult: EXPECTED_RESULT,
        },
      ])(
        "$setup.type field are illegal with default value & multiple: $setup.multiple",
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
        "title" | "description" | "required" | "unique" | "type"
      > = {
        title: "test",
        description: "test",
        required: false,
        unique: false,
        type: SchemaFieldType.GeometryObject,
      };

      const EXPECTED_RESULT = true;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["POINT"],
          } as FieldGeoObject,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["POINT"],
          } as FieldGeoObjectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["MULTIPOINT"],
          } as FieldGeoObject,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["MULTIPOINT"],
          } as FieldGeoObjectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["LINESTRING"],
          } as FieldGeoObject,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["LINESTRING"],
          } as FieldGeoObjectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["MULTILINESTRING"],
          } as FieldGeoObject,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["MULTILINESTRING"],
          } as FieldGeoObjectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["POLYGON"],
          } as FieldGeoObject,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["POLYGON"],
          } as FieldGeoObjectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["MULTIPOLYGON"],
          } as FieldGeoObject,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["MULTIPOLYGON"],
          } as FieldGeoObjectMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["GEOMETRYCOLLECTION"],
          } as FieldGeoObject,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["GEOMETRYCOLLECTION"],
          } as FieldGeoObjectMulti,
          expectedResult: EXPECTED_RESULT,
        },
      ])(
        "Field are legal, supportType: $setup.supportType without default value & multiple: $setup.multiple",
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
        "title" | "description" | "required" | "unique" | "type"
      > = {
        title: "test",
        description: "test",
        required: false,
        unique: false,
        type: SchemaFieldType.GeometryObject,
      };

      const COMMON_EXPECTED_RESULT = true;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["POINT"],
            defaultValue: Test.GEO_JSON_POINT,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["POINT"],
            defaultValue: [Test.GEO_JSON_POINT],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["MULTIPOINT"],
            defaultValue: Test.GEO_JSON_MULTI_POINT,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["MULTIPOINT"],
            defaultValue: [Test.GEO_JSON_MULTI_POINT],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["LINESTRING"],
            defaultValue: Test.GEO_JSON_LINE_STRING,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["LINESTRING"],
            defaultValue: [Test.GEO_JSON_LINE_STRING],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["MULTILINESTRING"],
            defaultValue: Test.GEO_JSON_MULTI_LINE_STRING,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["MULTILINESTRING"],
            defaultValue: [Test.GEO_JSON_MULTI_LINE_STRING],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["POLYGON"],
            defaultValue: Test.GEO_JSON_POLYGON,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["POLYGON"],
            defaultValue: [Test.GEO_JSON_POLYGON],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["MULTIPOLYGON"],
            defaultValue: Test.GEO_JSON_MULTI_POLYGON,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["MULTIPOLYGON"],
            defaultValue: [Test.GEO_JSON_MULTI_POLYGON],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["GEOMETRYCOLLECTION"],
            defaultValue: Test.GEO_JSON_GEO_COLLECTION,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["GEOMETRYCOLLECTION"],
            defaultValue: [Test.GEO_JSON_GEO_COLLECTION],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
      ])(
        "Field are legal, supportType: $setup.supportType with default value & multiple: $setup.multiple",
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
        "title" | "description" | "required" | "unique" | "type"
      > = {
        title: "test",
        description: "test",
        required: false,
        unique: false,
        type: SchemaFieldType.GeometryObject,
      };

      const COMMON_EXPECTED_RESULT = false;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["POINT"],
            defaultValue: Test.GEO_JSON_MULTI_POINT,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["POINT"],
            defaultValue: [Test.GEO_JSON_MULTI_POINT],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["MULTIPOINT"],
            defaultValue: Test.GEO_JSON_POINT,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["MULTIPOINT"],
            defaultValue: [Test.GEO_JSON_POINT],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["LINESTRING"],
            defaultValue: Test.GEO_JSON_POINT,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["LINESTRING"],
            defaultValue: [Test.GEO_JSON_POINT],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["MULTILINESTRING"],
            defaultValue: Test.GEO_JSON_POINT,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["MULTILINESTRING"],
            defaultValue: [Test.GEO_JSON_POINT],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["POLYGON"],
            defaultValue: Test.GEO_JSON_POINT,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["POLYGON"],
            defaultValue: [Test.GEO_JSON_POINT],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["MULTIPOLYGON"],
            defaultValue: Test.GEO_JSON_POINT,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["MULTIPOLYGON"],
            defaultValue: [Test.GEO_JSON_POINT],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: ["GEOMETRYCOLLECTION"],
            defaultValue: Test.GEO_JSON_POINT,
          } as FieldGeoObject,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: ["GEOMETRYCOLLECTION"],
            defaultValue: [Test.GEO_JSON_POINT],
          } as FieldGeoObjectMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
      ])(
        "Field are illegal, supportType: $setup.supportType with default value & multiple: $setup.multiple",
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
        "title" | "description" | "required" | "unique" | "type"
      > = {
        title: "test",
        description: "test",
        required: false,
        unique: false,
        type: SchemaFieldType.GeometryEditor,
      };

      const EXPECTED_RESULT = true;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: "POINT",
          } as FieldGeoEditor,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: "POINT",
          } as FieldGeoEditorMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: "LINESTRING",
          } as FieldGeoEditor,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: "LINESTRING",
          } as FieldGeoEditorMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: "POLYGON",
          } as FieldGeoEditor,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: "POLYGON",
          } as FieldGeoEditorMulti,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: "ANY",
          } as FieldGeoEditor,
          expectedResult: EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: "ANY",
          } as FieldGeoEditorMulti,
          expectedResult: EXPECTED_RESULT,
        },
      ])(
        "Field are legal, supportType: $setup.supportType without default value & multiple: $setup.multiple",
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
        "title" | "description" | "required" | "unique" | "type"
      > = {
        title: "test",
        description: "test",
        required: false,
        unique: false,
        type: SchemaFieldType.GeometryEditor,
      };

      const COMMON_EXPECTED_RESULT = true;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: "POINT",
            defaultValue: Test.GEO_JSON_POINT,
          } as FieldGeoEditor,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: "POINT",
            defaultValue: [Test.GEO_JSON_POINT],
          } as FieldGeoEditorMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: "LINESTRING",
            defaultValue: Test.GEO_JSON_LINE_STRING,
          } as FieldGeoEditor,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: "LINESTRING",
            defaultValue: [Test.GEO_JSON_LINE_STRING],
          } as FieldGeoEditorMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: "POLYGON",
            defaultValue: Test.GEO_JSON_POLYGON,
          } as FieldGeoEditor,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: "POLYGON",
            defaultValue: [Test.GEO_JSON_POLYGON],
          } as FieldGeoEditorMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: "ANY",
            defaultValue: Test.GEO_JSON_POINT,
          } as FieldGeoEditor,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: "ANY",
            defaultValue: [Test.GEO_JSON_POINT, Test.GEO_JSON_LINE_STRING, Test.GEO_JSON_POLYGON],
          } as FieldGeoEditorMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
      ])(
        "Field are legal, supportType: $setup.supportType with default value & multiple: $setup.multiple",
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
        "title" | "description" | "required" | "unique" | "type"
      > = {
        title: "test",
        description: "test",
        required: false,
        unique: false,
        type: SchemaFieldType.GeometryEditor,
      };

      const COMMON_EXPECTED_RESULT = false;

      test.each([
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: "POINT",
            defaultValue: Test.GEO_JSON_LINE_STRING,
          } as FieldGeoEditor,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: "POINT",
            defaultValue: [Test.GEO_JSON_LINE_STRING],
          } as FieldGeoEditorMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: "LINESTRING",
            defaultValue: Test.GEO_JSON_POINT,
          } as FieldGeoEditor,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: "LINESTRING",
            defaultValue: [Test.GEO_JSON_POINT],
          } as FieldGeoEditorMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: false,
            supportType: "POLYGON",
            defaultValue: Test.GEO_JSON_POINT,
          } as FieldGeoEditor,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
        {
          setup: {
            ...COMMON_SCHEMA_FIELD,
            multiple: true,
            supportType: "POLYGON",
            defaultValue: [Test.GEO_JSON_POINT],
          } as FieldGeoEditorMulti,
          expectedResult: COMMON_EXPECTED_RESULT,
        },
      ])(
        "Field are illegal, supportType: $setup.supportType with default value & multiple: $setup.multiple",
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
