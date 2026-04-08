import { expect, test, describe } from "vitest";

import { ExportSchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { ImportSchema, ImportSchemaField } from "@reearth-cms/utils/importSchema";

import { SchemaHelpers } from "./helpers";

describe("convertImportSchemaData", () => {
  test("single text field", () => {
    const properties: ImportSchema["properties"] = {
      myField: {
        title: "My Field",
        description: "A text field",
        "x-fieldType": ExportSchemaFieldType.Text,
        "x-multiple": true,
        "x-unique": true,
        "x-required": true,
        "x-defaultValue": ["hello"],
        maxLength: 100,
      },
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, "model-1");

    expect(result).toEqual([
      {
        title: "My Field",
        metadata: false,
        description: "A text field",
        key: "myField",
        multiple: true,
        unique: true,
        isTitle: false,
        required: true,
        type: "Text",
        modelId: "model-1",
        groupId: undefined,
        typeProperty: { text: { defaultValue: ["hello"], maxLength: 100 } },
        hidden: false,
      },
    ]);
  });

  test("multiple fields", () => {
    const properties: ImportSchema["properties"] = {
      field1: {
        title: "Field 1",
        description: "First",
        "x-fieldType": ExportSchemaFieldType.Text,
        "x-defaultValue": "a",
      },
      field2: {
        title: "Field 2",
        description: "Second",
        "x-fieldType": ExportSchemaFieldType.Bool,
        "x-defaultValue": true,
      },
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, "model-1");

    expect(result).toHaveLength(2);
    expect(result[0].key).toBe("field1");
    expect(result[0].type).toBe("Text");
    expect(result[1].key).toBe("field2");
    expect(result[1].type).toBe("Bool");
  });

  test("optional x-* properties default to false", () => {
    const properties: ImportSchema["properties"] = {
      myField: {
        title: "Title",
        "x-fieldType": ExportSchemaFieldType.Text,
      },
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, "model-1");

    expect(result[0].multiple).toBe(false);
    expect(result[0].unique).toBe(false);
    expect(result[0].required).toBe(false);
  });

  test("modelId undefined", () => {
    const properties: ImportSchema["properties"] = {
      myField: {
        title: "Title",
        "x-fieldType": ExportSchemaFieldType.Text,
      },
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, undefined);

    expect(result[0].modelId).toBeUndefined();
  });

  test("all field types map correctly", () => {
    const typeMapping: [ExportSchemaFieldType, string][] = [
      [ExportSchemaFieldType.Text, "Text"],
      [ExportSchemaFieldType.TextArea, "TextArea"],
      [ExportSchemaFieldType.Markdown, "MarkdownText"],
      [ExportSchemaFieldType.Asset, "Asset"],
      [ExportSchemaFieldType.Datetime, "Date"],
      [ExportSchemaFieldType.Bool, "Bool"],
      [ExportSchemaFieldType.Select, "Select"],
      [ExportSchemaFieldType.Integer, "Integer"],
      [ExportSchemaFieldType.Number, "Number"],
      [ExportSchemaFieldType.URL, "URL"],
      [ExportSchemaFieldType.GeometryObject, "GeometryObject"],
      [ExportSchemaFieldType.GeometryEditor, "GeometryEditor"],
    ];

    for (const [exportType, expectedType] of typeMapping) {
      const properties: ImportSchema["properties"] = {
        field: {
          title: "Title",
          "x-fieldType": exportType,
        } as ImportSchemaField,
      };

      const result = SchemaHelpers.convertImportSchemaData(properties, undefined);
      expect(result[0].type).toBe(expectedType);
    }
  });

  test("typeProperty for text with maxLength", () => {
    const properties: ImportSchema["properties"] = {
      field: {
        title: "Title",
        "x-fieldType": ExportSchemaFieldType.Text,
        "x-defaultValue": "default",
        maxLength: 50,
      },
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, undefined);

    expect(result[0].typeProperty).toEqual({
      text: { defaultValue: "default", maxLength: 50 },
    });
  });

  test("typeProperty for textArea with maxLength", () => {
    const properties: ImportSchema["properties"] = {
      field: {
        title: "Title",
        "x-fieldType": ExportSchemaFieldType.TextArea,
        "x-defaultValue": "some text",
        maxLength: 200,
      },
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, undefined);

    expect(result[0].typeProperty).toEqual({
      textArea: { defaultValue: "some text", maxLength: 200 },
    });
  });

  test("typeProperty for markdown with maxLength", () => {
    const properties: ImportSchema["properties"] = {
      field: {
        title: "Title",
        "x-fieldType": ExportSchemaFieldType.Markdown,
        "x-defaultValue": "# Hello",
        maxLength: 500,
      },
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, undefined);

    expect(result[0].typeProperty).toEqual({
      markdownText: { defaultValue: "# Hello", maxLength: 500 },
    });
  });

  test("typeProperty for number with min/max", () => {
    const properties: ImportSchema["properties"] = {
      field: {
        title: "Title",
        "x-fieldType": ExportSchemaFieldType.Number,
        "x-defaultValue": 10,
        minimum: 0,
        maximum: 100,
      },
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, undefined);

    expect(result[0].typeProperty).toEqual({
      number: { defaultValue: 10, min: 0, max: 100 },
    });
  });

  test("typeProperty for integer with min/max", () => {
    const properties: ImportSchema["properties"] = {
      field: {
        title: "Title",
        "x-fieldType": ExportSchemaFieldType.Integer,
        "x-defaultValue": 5,
        minimum: 1,
        maximum: 10,
      },
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, undefined);

    expect(result[0].typeProperty).toEqual({
      integer: { defaultValue: 5, min: 1, max: 10 },
    });
  });

  test("typeProperty for select with options", () => {
    const properties: ImportSchema["properties"] = {
      field: {
        title: "Title",
        "x-fieldType": ExportSchemaFieldType.Select,
        "x-defaultValue": "opt1",
        "x-options": ["opt1", "opt2", "opt3"],
      },
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, undefined);

    expect(result[0].typeProperty).toEqual({
      select: { defaultValue: "opt1", values: ["opt1", "opt2", "opt3"] },
    });
  });

  test("typeProperty for select with multiple default values", () => {
    const properties: ImportSchema["properties"] = {
      field: {
        title: "Title",
        "x-fieldType": ExportSchemaFieldType.Select,
        "x-multiple": true,
        "x-defaultValue": ["opt1", "opt2"],
        "x-options": ["opt1", "opt2", "opt3"],
      },
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, undefined);

    expect(result[0].typeProperty).toEqual({
      select: { defaultValue: ["opt1", "opt2"], values: ["opt1", "opt2", "opt3"] },
    });
  });

  test("typeProperty for geometryObject with supportedTypes", () => {
    const properties: ImportSchema["properties"] = {
      field: {
        title: "Title",
        "x-fieldType": ExportSchemaFieldType.GeometryObject,
        "x-geoSupportedTypes": ["POINT", "POLYGON"],
      },
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, undefined);

    expect(result[0].typeProperty).toEqual({
      geometryObject: { defaultValue: undefined, supportedTypes: ["POINT", "POLYGON"] },
    });
  });

  test("typeProperty for geometryEditor with supportedType", () => {
    const properties: ImportSchema["properties"] = {
      field: {
        title: "Title",
        "x-fieldType": ExportSchemaFieldType.GeometryEditor,
        "x-geoSupportedType": "POINT",
      },
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, undefined);

    expect(result[0].typeProperty).toEqual({
      geometryEditor: { defaultValue: undefined, supportedTypes: ["POINT"] },
    });
  });

  test("typeProperty for geometryEditor without supportedType", () => {
    const properties: ImportSchema["properties"] = {
      field: {
        title: "Title",
        "x-fieldType": ExportSchemaFieldType.GeometryEditor,
      } as ImportSchemaField,
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, undefined);

    expect(result[0].typeProperty).toEqual({
      geometryEditor: { defaultValue: undefined, supportedTypes: [] },
    });
  });

  test("typeProperty for bool", () => {
    const properties: ImportSchema["properties"] = {
      field: {
        title: "Title",
        "x-fieldType": ExportSchemaFieldType.Bool,
        "x-defaultValue": true,
      },
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, undefined);

    expect(result[0].typeProperty).toEqual({
      bool: { defaultValue: true },
    });
  });

  test("typeProperty for url", () => {
    const properties: ImportSchema["properties"] = {
      field: {
        title: "Title",
        "x-fieldType": ExportSchemaFieldType.URL,
        "x-defaultValue": "https://example.com",
      },
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, undefined);

    expect(result[0].typeProperty).toEqual({
      url: { defaultValue: "https://example.com" },
    });
  });

  test("typeProperty for text with multiple default values", () => {
    const properties: ImportSchema["properties"] = {
      field: {
        title: "Title",
        "x-fieldType": ExportSchemaFieldType.Text,
        "x-multiple": true,
        "x-defaultValue": ["a", "b"],
        maxLength: 100,
      },
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, undefined);

    expect(result[0].typeProperty).toEqual({
      text: { defaultValue: ["a", "b"], maxLength: 100 },
    });
  });

  test("typeProperty for number with multiple default values", () => {
    const properties: ImportSchema["properties"] = {
      field: {
        title: "Title",
        "x-fieldType": ExportSchemaFieldType.Number,
        "x-multiple": true,
        "x-defaultValue": [1, 2, 3],
        minimum: 0,
        maximum: 100,
      },
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, undefined);

    expect(result[0].typeProperty).toEqual({
      number: { defaultValue: [1, 2, 3], min: 0, max: 100 },
    });
  });

  test("static properties are always set correctly", () => {
    const properties: ImportSchema["properties"] = {
      field: {
        title: "Title",
        "x-fieldType": ExportSchemaFieldType.Text,
      },
    };

    const result = SchemaHelpers.convertImportSchemaData(properties, "model-1");

    expect(result[0].metadata).toBe(false);
    expect(result[0].isTitle).toBe(false);
    expect(result[0].groupId).toBeUndefined();
    expect(result[0].hidden).toBe(false);
  });

  test("empty properties returns empty array", () => {
    const result = SchemaHelpers.convertImportSchemaData({}, "model-1");

    expect(result).toEqual([]);
  });
});
