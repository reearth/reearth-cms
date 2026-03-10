/* eslint-disable @typescript-eslint/no-extraneous-class */
import {
  EditorSupportedType,
  SchemaFieldType,
  ObjectSupportedType,
  TypeProperty,
  ImportFieldInput,
  ExportSchemaFieldType,
} from "@reearth-cms/components/molecules/Schema/types";
import { Constant } from "@reearth-cms/utils/constant";
import { ImportSchema, ImportSchemaField } from "@reearth-cms/utils/importSchema";

export abstract class SchemaHelpers {
  public static convertSchemaFieldType(s: string): SchemaFieldType {
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

  public static defaultTypePropertyGet(
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

  private static convertImportSchemaTypeProperty(field: ImportSchemaField): TypeProperty {
    switch (field["x-fieldType"]) {
      case ExportSchemaFieldType.Text:
      case ExportSchemaFieldType.TextArea:
      case ExportSchemaFieldType.Markdown:
        return {
          defaultValue: field["x-defaultValue"],
          maxLength: field.maxLength,
        };
      case ExportSchemaFieldType.Asset:
        return {
          defaultValue: field["x-defaultValue"],
        };
      case ExportSchemaFieldType.Bool:
        return {
          defaultValue: field["x-defaultValue"],
        };
      case ExportSchemaFieldType.Datetime:
        return {
          defaultValue: field["x-defaultValue"],
        };
      case ExportSchemaFieldType.Number:
      case ExportSchemaFieldType.Integer:
        return {
          defaultValue: field["x-defaultValue"],
          min: field.minimum,
          max: field.maximum,
        };
      case ExportSchemaFieldType.Select:
        return {
          selectDefaultValue: field["x-defaultValue"],
          values: field["x-options"],
        };
      case ExportSchemaFieldType.URL:
        return {
          defaultValue: field["x-defaultValue"],
        };
      case ExportSchemaFieldType.GeometryObject:
        return {
          defaultValue: field["x-defaultValue"],
          objectSupportedTypes: field["x-geoSupportedTypes"],
        };
      case ExportSchemaFieldType.GeometryEditor:
        return {
          defaultValue: field["x-defaultValue"],
          editorSupportedTypes: field["x-geoSupportedType"] ? [field["x-geoSupportedType"]] : [],
        };
      default:
        return {
          defaultValue: undefined,
        };
    }
  }

  public static convertImportSchemaData(
    properties: ImportSchema["properties"],
    modelId: string | undefined,
  ): ImportFieldInput[] {
    return Object.entries(properties).map(([fieldKey, schemaField]) => ({
      title: schemaField.title,
      metadata: false,
      description: schemaField.description,
      key: fieldKey,
      multiple: schemaField["x-multiple"] || false,
      unique: schemaField["x-unique"] || false,
      isTitle: false,
      required: schemaField["x-required"] || false,
      type: Constant.IMPORT.FIELD_TYPE_MAPPING[schemaField["x-fieldType"]],
      modelId,
      groupId: undefined,
      typeProperty: this.convertImportSchemaTypeProperty(schemaField),
      hidden: false,
    }));
  }
}
