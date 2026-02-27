import {
  EditorSupportedType,
  ExportSchemaFieldType,
  ImportFieldInput,
  ObjectSupportedType,
  SchemaFieldType,
  TypeProperty,
} from "@reearth-cms/components/molecules/Schema/types";
import { Constant } from "@reearth-cms/utils/constant";
import { ImportSchema, ImportSchemaField } from "@reearth-cms/utils/importSchema";

export function convertSchemaFieldType(s: string): SchemaFieldType {
  switch (s) {
    case "textArea":
      return "TextArea";
    // case "richText":
    //   return "RichText";
    case "markdownText":
      return "MarkdownText";
    case "asset":
      return "Asset";
    case "date":
      return "Date";
    case "bool":
      return "Bool";
    case "select":
      return "Select";
    case "tag":
      return "Tag";
    case "checkbox":
      return "Checkbox";
    case "integer":
      return "Integer";
    case "number":
      return "Number";
    case "reference":
      return "Reference";
    case "url":
      return "URL";
    case "group":
      return "Group";
    case "geometryObject":
      return "GeometryObject";
    case "geometryEditor":
      return "GeometryEditor";
    case "text":
    default:
      return "Text";
  }
}

export function defaultTypePropertyGet(
  type: string,
): Record<
  string,
  { supportedTypes?: EditorSupportedType[] | ObjectSupportedType[] } & TypeProperty
> {
  switch (type.toLowerCase()) {
    case "textarea":
      return {
        textArea: { defaultValue: "", maxLength: undefined },
      };
    // case "richtext":
    //   return {
    //     richText: { defaultValue: "", maxLength: undefined },
    //   };
    case "markdowntext":
      return {
        markdownText: { defaultValue: "", maxLength: undefined },
      };
    case "asset":
      return {
        asset: { defaultValue: "" },
      };
    case "select": {
      return {
        select: { defaultValue: "", values: [] },
      };
    }
    case "integer":
      return {
        integer: {
          defaultValue: "",
          max: undefined,
          min: undefined,
        },
      };
    case "number":
      return {
        number: {
          defaultValue: "",
          max: undefined,
          min: undefined,
        },
      };
    case "bool":
      return {
        bool: { defaultValue: null },
      };
    case "date":
      return {
        date: { defaultValue: "" },
      };
    case "reference":
      return {
        reference: { modelId: "", schema: undefined },
      };
    case "tag": {
      return {
        tag: {
          defaultValue: "",
          tags: [],
        },
      };
    }
    case "checkbox":
      return {
        checkbox: { defaultValue: null },
      };
    case "url":
      return {
        url: { defaultValue: null },
      };
    case "group":
      return {
        group: { groupId: undefined },
      };
    case "geometryobject":
      return {
        geometryObject: {
          defaultValue: "",
          supportedTypes: [],
        },
      };
    case "geometryeditor":
      return {
        geometryEditor: {
          defaultValue: "",
          supportedTypes: [],
        },
      };
    case "text":
    default:
      return {
        text: { defaultValue: "", maxLength: undefined },
      };
  }
}

function convertImportSchemaTypeProperty(
  field: ImportSchemaField,
): Record<
  string,
  { supportedTypes?: EditorSupportedType[] | ObjectSupportedType[] } & TypeProperty
> {
  switch (field["x-fieldType"]) {
    case ExportSchemaFieldType.Text:
      return {
        text: {
          defaultValue: field["x-defaultValue"],
          maxLength: field.maxLength,
        },
      };
    case ExportSchemaFieldType.TextArea:
      return {
        textArea: {
          defaultValue: field["x-defaultValue"],
          maxLength: field.maxLength,
        },
      };
    case ExportSchemaFieldType.Markdown:
      return {
        markdownText: {
          defaultValue: field["x-defaultValue"],
          maxLength: field.maxLength,
        },
      };
    case ExportSchemaFieldType.Asset:
      return {
        asset: {
          defaultValue: field["x-defaultValue"],
        },
      };
    case ExportSchemaFieldType.Bool:
      return {
        bool: { defaultValue: field["x-defaultValue"] },
      };
    case ExportSchemaFieldType.Datetime:
      return {
        date: { defaultValue: field["x-defaultValue"] },
      };
    case ExportSchemaFieldType.Number:
      return {
        number: {
          defaultValue: field["x-defaultValue"],
          max: field.maximum,
          min: field.minimum,
        },
      };
    case ExportSchemaFieldType.Integer:
      return {
        integer: {
          defaultValue: field["x-defaultValue"],
          max: field.maximum,
          min: field.minimum,
        },
      };
    case ExportSchemaFieldType.Select:
      return {
        select: {
          defaultValue: field["x-defaultValue"],
          values: field["x-options"],
        },
      };
    case ExportSchemaFieldType.URL:
      return {
        url: {
          defaultValue: field["x-defaultValue"],
        },
      };
    case ExportSchemaFieldType.GeometryObject:
      return {
        geometryObject: {
          defaultValue: field["x-defaultValue"],
          supportedTypes: field["x-geoSupportedTypes"],
        },
      };
    case ExportSchemaFieldType.GeometryEditor:
      return {
        geometryEditor: {
          defaultValue: field["x-defaultValue"],
          supportedTypes: [field["x-geoSupportedType"]],
        },
      };
    default:
      return {
        text: {
          defaultValue: undefined,
        },
      };
  }
}

export function convertImportSchemaData(
  properties: ImportSchema["properties"],
  modelId: string | undefined,
): ImportFieldInput[] {
  return Object.entries(properties).map(([fieldKey, schemaField]) => ({
    description: schemaField.description,
    groupId: undefined,
    hidden: false,
    isTitle: false,
    key: fieldKey,
    metadata: false,
    modelId: modelId,
    multiple: schemaField["x-multiple"] || false,
    required: schemaField["x-required"] || false,
    title: fieldKey,
    type: Constant.IMPORT.FIELD_TYPE_MAPPING[schemaField["x-fieldType"]],
    typeProperty: convertImportSchemaTypeProperty(schemaField),
    unique: schemaField["x-unique"] || false,
  }));
}
