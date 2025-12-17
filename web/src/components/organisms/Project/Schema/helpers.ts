import {
  EditorSupportedType,
  SchemaFieldType,
  ObjectSupportedType,
  TypeProperty,
} from "@reearth-cms/components/molecules/Schema/types";
import { ImportSchemaField } from "@reearth-cms/utils/import";

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
  TypeProperty & { supportedTypes?: ObjectSupportedType[] | EditorSupportedType[] }
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
          min: undefined,
          max: undefined,
        },
      };
    case "number":
      return {
        number: {
          defaultValue: "",
          min: undefined,
          max: undefined,
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

export function defaultTypePropertyGet2(
  field: ImportSchemaField,
): Record<
  string,
  TypeProperty & { supportedTypes?: ObjectSupportedType[] | EditorSupportedType[] }
> {
  switch (field.type) {
    case "Text":
      return {
        text: {
          defaultValue: field.defaultValue,
          maxLength: field.maxLength,
        },
      };
    case "TextArea":
      return {
        textArea: {
          defaultValue: field.defaultValue,
          maxLength: field.maxLength,
        },
      };
    case "MarkdownText":
      return {
        markdownText: {
          defaultValue: field.defaultValue,
          maxLength: field.maxLength,
        },
      };
    case "Asset":
      return {
        asset: {
          defaultValue: field.defaultValue,
        },
      };
    case "Bool":
      return {
        bool: { defaultValue: field.defaultValue },
      };
    case "Date":
      return {
        date: { defaultValue: field.defaultValue },
      };
    case "Number":
      return {
        number: {
          defaultValue: field.defaultValue,
          min: field.minimum,
          max: field.maximum,
        },
      };
    case "Integer":
      return {
        integer: {
          defaultValue: field.defaultValue,
          min: field.minimum,
          max: field.maximum,
        },
      };
    case "Select":
      return {
        select: {
          defaultValue: field.defaultValue,
          values: field.values,
        },
      };
    case "URL":
      return {
        url: {
          defaultValue: field.defaultValue,
        },
      };
  }
}
