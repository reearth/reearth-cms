import { readFileSync } from "fs";
import { join } from "path";

import { describe, expect, test } from "vitest";

import { Field, SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";

import { Constant } from "./constant";
import { ImportContentJSON2, ImportContentUtils } from "./importContent";
import { ObjectUtils } from "./object";

async function readFromJSONFile<T>(
  staticFileDirectory: string,
  baseDirectory = "public",
): Promise<ReturnType<typeof ObjectUtils.safeJSONParse<T>>> {
  const filePath = join(baseDirectory, staticFileDirectory);
  const fileContent = readFileSync(filePath, "utf-8");

  return await ObjectUtils.safeJSONParse(fileContent);
}

const DEFAULT_COMMON_FIELD: Pick<Field, "id" | "description" | "title" | "isTitle" | "unique"> = {
  id: "",
  description: "",
  title: "",
  isTitle: false,
  unique: false,
};

describe("Testing content import from static files", () => {
  describe("Validate JSON files", () => {
    test("[Pass case] Check import content template file", async () => {
      const fields = [
        {
          type: SchemaFieldType.Text,
          key: "text-1",
        },
        {
          type: SchemaFieldType.TextArea,
          key: "textarea-1",
        },
        {
          type: SchemaFieldType.MarkdownText,
          key: "markdown-text-1",
        },
        {
          type: SchemaFieldType.Asset,
          key: "asset-1",
        },
        {
          type: SchemaFieldType.Date,
          key: "date-1",
        },
        {
          type: SchemaFieldType.Bool,
          key: "boolean-1",
        },
        {
          type: SchemaFieldType.Select,
          key: "select-1",
        },
        {
          type: SchemaFieldType.Integer,
          key: "int-1",
        },
        {
          type: SchemaFieldType.Number,
          key: "float-1",
        },
        {
          type: SchemaFieldType.URL,
          key: "url-1",
        },
        {
          type: SchemaFieldType.GeometryObject,
          key: "geo-obj-1",
        },
      ].map(({ type, key }) => ({
        ...DEFAULT_COMMON_FIELD,
        type,
        key,
        required: true,
        multiple: false,
        typeProperty: {},
      }));

      const result = await readFromJSONFile<ImportContentJSON2>(
        Constant.PUBLIC_FILE.IMPORT_CONTENT_JSON,
      );

      expect(result.isValid).toBe(true);

      if (!result.isValid) return;

      const contentValidation = await ImportContentUtils.validateContentFromJSON(
        result.data.results,
        fields,
      );
      expect(contentValidation.isValid).toBe(true);

      if (!contentValidation.isValid) {
        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(false);
        expect(typeMismatchFieldKeys.size).toEqual(0);
        expect(outOfRangeFieldKeys.size).toEqual(0);
      }
    });

    describe("[Pass case] Control variable: field key", () => {
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
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Asset },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Date },
        //   expectedResult: EXPECTED_RESULT,
        // },
        {
          setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, correctValue: false },
          expectedResult: EXPECTED_RESULT,
        },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Select },
        //   expectedResult: EXPECTED_RESULT,
        // },
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
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
        //   expectedResult: EXPECTED_RESULT,
        // },
      ])("$setup.type field key match", async ({ setup, expectedResult }) => {
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

        const contentValidation = await ImportContentUtils.validateContentFromJSON(
          contentList,
          fields,
          Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
        );
        expect(contentValidation.isValid).toBe(expectedResult.isValid);

        if (contentValidation.isValid) return;

        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(expectedResult.exceedLimit);
        expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
        expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
      });
    });

    describe("[Fail case] Control variable: field key", () => {
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
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Asset },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Date },
        //   expectedResult: EXPECTED_RESULT,
        // },
        {
          setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool },
          expectedResult: EXPECTED_RESULT,
        },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Select },
        //   expectedResult: EXPECTED_RESULT,
        // },
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
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
        //   expectedResult: EXPECTED_RESULT,
        // },
      ])("$setup.type field key mismatch", async ({ setup, expectedResult }) => {
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
            [setup.wrongKey]: "hello world",
          },
        ];

        const contentValidation = await ImportContentUtils.validateContentFromJSON(
          contentList,
          fields,
          Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
        );
        expect(contentValidation.isValid).toBe(expectedResult.isValid);

        if (contentValidation.isValid) return;

        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(expectedResult.exceedLimit);
        expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
        expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
      });
    });

    describe("[Pass case] Control variable: field value", () => {
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
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Asset },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Date },
        //   expectedResult: EXPECTED_RESULT,
        // },
        {
          setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, correctValue: false },
          expectedResult: EXPECTED_RESULT,
        },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Select },
        //   expectedResult: EXPECTED_RESULT,
        // },
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
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
        //   expectedResult: EXPECTED_RESULT,
        // },
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

        const contentValidation = await ImportContentUtils.validateContentFromJSON(
          contentList,
          fields,
          Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
        );
        expect(contentValidation.isValid).toBe(expectedResult.isValid);

        if (contentValidation.isValid) return;

        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(expectedResult.exceedLimit);
        expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
        expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
      });
    });

    describe("[Fail case] Control variable: field value", () => {
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
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Asset },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Date },
        //   expectedResult: EXPECTED_RESULT,
        // },
        {
          setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, wrongValue: "text" },
          expectedResult: EXPECTED_RESULT,
        },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Select },
        //   expectedResult: EXPECTED_RESULT,
        // },
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
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
        //   expectedResult: EXPECTED_RESULT,
        // },
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

        const contentValidation = await ImportContentUtils.validateContentFromJSON(
          contentList,
          fields,
          Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
        );
        expect(contentValidation.isValid).toBe(expectedResult.isValid);

        if (contentValidation.isValid) return;

        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(expectedResult.exceedLimit);
        expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
        expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
      });
    });

    describe("[Pass case] Control variable: multiple (false), default value", () => {
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
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Asset },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Date },
        //   expectedResult: EXPECTED_RESULT,
        // },
        {
          setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, defaultValue: false },
          expectedResult: EXPECTED_RESULT,
        },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Select },
        //   expectedResult: EXPECTED_RESULT,
        // },
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
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
        //   expectedResult: EXPECTED_RESULT,
        // },
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

        const contentValidation = await ImportContentUtils.validateContentFromJSON(
          contentList,
          fields,
          Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
        );
        expect(contentValidation.isValid).toBe(expectedResult.isValid);

        if (contentValidation.isValid) return;

        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(expectedResult.exceedLimit);
        expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
        expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
      });
    });

    describe("[Fail case] Control variable: multiple (false), default value", () => {
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
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Asset },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Date },
        //   expectedResult: EXPECTED_RESULT,
        // },
        {
          setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, defaultValue: "text" },
          expectedResult: EXPECTED_RESULT,
        },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Select },
        //   expectedResult: EXPECTED_RESULT,
        // },
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
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
        //   expectedResult: EXPECTED_RESULT,
        // },
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

        const contentValidation = await ImportContentUtils.validateContentFromJSON(
          contentList,
          fields,
          Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
        );
        expect(contentValidation.isValid).toBe(expectedResult.isValid);

        if (contentValidation.isValid) return;

        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(expectedResult.exceedLimit);
        expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
        expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
      });
    });

    describe("[Pass case] Control variable: multiple (true), required (false), default value", () => {
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
          setup: { ...COMMON_SETUP, type: SchemaFieldType.Text, defaultValues: ["hello", "world"] },
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
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Asset },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Date },
        //   expectedResult: EXPECTED_RESULT,
        // },
        {
          setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, defaultValues: [true, false] },
          expectedResult: EXPECTED_RESULT,
        },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Select },
        //   expectedResult: EXPECTED_RESULT,
        // },
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
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
        //   expectedResult: EXPECTED_RESULT,
        // },
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

        const contentValidation = await ImportContentUtils.validateContentFromJSON(
          contentList,
          fields,
          Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
        );

        expect(contentValidation.isValid).toBe(expectedResult.isValid);

        if (contentValidation.isValid) return;

        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(expectedResult.exceedLimit);
        expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
        expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
      });
    });

    describe("[Pass case] Control variable: multiple (true), required (true), default value", () => {
      const COMMON_SETUP = {
        key: "field-key",
        required: true,
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
          setup: { ...COMMON_SETUP, type: SchemaFieldType.Text, defaultValues: ["hello", "world"] },
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
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Asset },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Date },
        //   expectedResult: EXPECTED_RESULT,
        // },
        {
          setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, defaultValues: [true, false] },
          expectedResult: EXPECTED_RESULT,
        },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Select },
        //   expectedResult: EXPECTED_RESULT,
        // },
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
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
        //   expectedResult: EXPECTED_RESULT,
        // },
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

        const contentValidation = await ImportContentUtils.validateContentFromJSON(
          contentList,
          fields,
          Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
        );

        expect(contentValidation.isValid).toBe(expectedResult.isValid);

        if (contentValidation.isValid) return;

        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(expectedResult.exceedLimit);
        expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
        expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
      });
    });

    // TODO: need to fix this
    describe.skip("[Fail case] Control variable: multiple (true), required (true), wrong default value type", () => {
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
          setup: { ...COMMON_SETUP, type: SchemaFieldType.Text, defaultValues: "hello" },
          expectedResult: EXPECTED_RESULT,
        },
        // {
        //   setup: {
        //     ...COMMON_SETUP,
        //     type: SchemaFieldType.TextArea,
        //     defaultValues: "hello",
        //   },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: {
        //     ...COMMON_SETUP,
        //     type: SchemaFieldType.MarkdownText,
        //     defaultValues: "hello",
        //   },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Asset },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Date },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Bool, defaultValues: true },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Select },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Integer, defaultValues: 1 },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Number, defaultValues: 1.5 },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: {
        //     ...COMMON_SETUP,
        //     type: SchemaFieldType.URL,
        //     defaultValues: "https://hello.com/",
        //   },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
        //   expectedResult: EXPECTED_RESULT,
        // },
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

        const contentValidation = await ImportContentUtils.validateContentFromJSON(
          contentList,
          fields,
          Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
        );

        expect(contentValidation.isValid).toBe(expectedResult.isValid);

        if (contentValidation.isValid) return;

        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(expectedResult.exceedLimit);
        expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
        expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
      });
    });

    describe("[Pass case] Control variable: multiple (false), required (true), value in range (min, max)", () => {
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
          setup: { ...COMMON_SETUP, type: SchemaFieldType.Number, value: 2.5, min: -5.5, max: 5.5 },
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

        const contentValidation = await ImportContentUtils.validateContentFromJSON(
          contentList,
          fields,
          Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
        );

        expect(contentValidation.isValid).toBe(expectedResult.isValid);

        if (contentValidation.isValid) return;

        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(expectedResult.exceedLimit);
        expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
        expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
      });
    });

    describe("[Fail case] Control variable: multiple (false), required (true), value out of range (min, max)", () => {
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

        const contentValidation = await ImportContentUtils.validateContentFromJSON(
          contentList,
          fields,
          Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
        );

        expect(contentValidation.isValid).toBe(expectedResult.isValid);

        if (contentValidation.isValid) return;

        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(expectedResult.exceedLimit);
        expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
        expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
      });
    });

    describe("[Pass case] Control variable: multiple (false), required (true), value in range (maxLength)", () => {
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
          setup: { ...COMMON_SETUP, type: SchemaFieldType.TextArea, value: "hello", maxLength: 10 },
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

        const contentValidation = await ImportContentUtils.validateContentFromJSON(
          contentList,
          fields,
          Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
        );

        expect(contentValidation.isValid).toBe(expectedResult.isValid);

        if (contentValidation.isValid) return;

        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(expectedResult.exceedLimit);
        expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
        expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
      });
    });

    describe("[Fail case] Control variable: multiple (false), required (true), value out of range (maxLength)", () => {
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

        const contentValidation = await ImportContentUtils.validateContentFromJSON(
          contentList,
          fields,
          Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
        );

        expect(contentValidation.isValid).toBe(expectedResult.isValid);

        if (contentValidation.isValid) return;

        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(expectedResult.exceedLimit);
        expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
        expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
      });
    });

    describe("[Pass case] Control variable: multiple (false), required (true), value in range (values)", () => {
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

        const contentValidation = await ImportContentUtils.validateContentFromJSON(
          contentList,
          fields,
          Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
        );

        expect(contentValidation.isValid).toBe(expectedResult.isValid);

        if (contentValidation.isValid) return;

        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(expectedResult.exceedLimit);
        expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
        expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
      });
    });

    describe("[Fail case] Control variable: multiple (false), required (true), value out of range (values)", () => {
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
            type: SchemaFieldType.Select,
            value: "yellow",
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

        const contentValidation = await ImportContentUtils.validateContentFromJSON(
          contentList,
          fields,
          Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
        );

        expect(contentValidation.isValid).toBe(expectedResult.isValid);

        if (contentValidation.isValid) return;

        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(expectedResult.exceedLimit);
        expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
        expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
      });
    });

    describe("[Pass case] Control variable: content list length", () => {
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
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Asset },
        //   expectedResult: EXPECTED_RESULT,
        // },
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

        const contentValidation = await ImportContentUtils.validateContentFromJSON(
          contentList,
          fields,
          Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
        );
        expect(contentValidation.isValid).toBe(expectedResult.isValid);

        if (contentValidation.isValid) return;

        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(expectedResult.exceedLimit);
        expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
        expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
      });
    });

    describe("[Fail case] Control variable: content list length", () => {
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
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Asset },
        //   expectedResult: EXPECTED_RESULT,
        // },
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

        const contentValidation = await ImportContentUtils.validateContentFromJSON(
          contentList,
          fields,
          Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
        );
        expect(contentValidation.isValid).toBe(expectedResult.isValid);

        if (contentValidation.isValid) return;

        const { exceedLimit, typeMismatchFieldKeys, outOfRangeFieldKeys } = contentValidation.error;

        expect(exceedLimit).toBe(expectedResult.exceedLimit);
        expect(typeMismatchFieldKeys.size).toEqual(expectedResult.typeMismatchFieldKeysCount);
        expect(outOfRangeFieldKeys.size).toEqual(expectedResult.outOfRangeFieldKeysCount);
      });
    });

    describe("[Pass case] Control variable: field value and default value", () => {
      const COMMON_SETUP = {
        key1: "key-1",
        key2: "key-2",
        required: false,
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
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Asset },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: {
        //     ...COMMON_SETUP,
        //     type: SchemaFieldType.Date,
        //     value: "2025-12-01T00:00:00+09:00",
        //     defaultValue: "2025-01-01T00:00:00+09:00",
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
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
        //   expectedResult: EXPECTED_RESULT,
        // },
      ])(
        "$setup.type field auto fill value with default value",
        async ({ setup, expectedResult }) => {
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
            },
          ];

          const expectContentList = [
            {
              [setup.key1]: setup.value,
              [setup.key2]: setup.defaultValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContentFromJSON(
            contentList,
            fields,
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

    describe("[Pass case] Control variable: field value and no default value", () => {
      const COMMON_SETUP = {
        key1: "key-1",
        key2: "key-2",
        required: false,
        multiple: false,
        typeProperty: {},
      };

      const EXPECTED_RESULT = {
        exceedLimit: false,
        typeMismatchFieldKeysCount: 1,
        outOfRangeFieldKeysCount: 0,
        isValid: true,
      };

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
            defaultValue: "default text",
          },
          expectedResult: EXPECTED_RESULT,
        },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.Asset },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: {
        //     ...COMMON_SETUP,
        //     type: SchemaFieldType.Date,
        //     value: "2025-12-01T00:00:00+09:00",
        //     defaultValue: "2025-01-01T00:00:00+09:00",
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
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryObject },
        //   expectedResult: EXPECTED_RESULT,
        // },
        // {
        //   setup: { ...COMMON_SETUP, type: SchemaFieldType.GeometryEditor },
        //   expectedResult: EXPECTED_RESULT,
        // },
      ])(
        "$setup.type field auto fill value with default value",
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
            },
          ];

          const expectContentList = [
            {
              [setup.key1]: setup.value,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContentFromJSON(
            contentList,
            fields,
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

    describe("[Pass case] Control variable: field value and default value (select field)", () => {
      const COMMON_SETUP = {
        key1: "key-1",
        key2: "key-2",
        required: false,
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
            values: ["red", "blue", "green"],
            defaultValue: "blue",
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
              multiple: false,
              typeProperty: {
                defaultValue: setup.defaultValue,
                values: setup.values,
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
                values: setup.values,
              },
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
              [setup.key2]: setup.defaultValue,
            },
          ];

          const contentValidation = await ImportContentUtils.validateContentFromJSON(
            contentList,
            fields,
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

    describe("[Pass case] Control variable: field value and no default value (select field)", () => {
      const COMMON_SETUP = {
        key1: "key-1",
        key2: "key-2",
        required: false,
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
            values: ["red", "blue", "green"],
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
              multiple: false,
              typeProperty: {
                values: setup.values,
              },
            },
            {
              ...DEFAULT_COMMON_FIELD,
              type: setup.type,
              key: setup.key2,
              required: setup.required,
              multiple: false,
              typeProperty: {
                values: setup.values,
              },
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

          const contentValidation = await ImportContentUtils.validateContentFromJSON(
            contentList,
            fields,
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
