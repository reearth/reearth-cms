import type { GeoJSON } from "geojson";

import { Key } from "react";

export type MetaDataSchema = {
  fields?: MetadataField[];
  id?: string;
};

export type Schema = {
  fields: Field[];
  id: string;
};

type GroupSchema = { fields: GroupField[] } & Schema;

export type Field = {
  description: string;
  id: string;
  isTitle: boolean;
  key: string;
  metadata?: boolean;
  multiple: boolean;
  required: boolean;
  title: string;
  type: SchemaFieldType;
  typeProperty?: TypeProperty;
  unique: boolean;
};

export type CreateFieldInput = {
  description?: string;
  groupId?: string;
  isTitle: boolean;
  key: string;
  metadata?: boolean;
  modelId?: string;
  multiple: boolean;
  required: boolean;
  title: string;
  type: SchemaFieldType;
  typeProperty: TypeProperty;
  unique: boolean;
};

export type ImportFieldInput = {
  hidden?: boolean;
} & CreateFieldInput;

export type GroupField = { type: Exclude<SchemaFieldType, "Group"> } & Field;

export type MetadataField = {
  type: Extract<SchemaFieldType, "Bool" | "Checkbox" | "Date" | "Tag" | "Text" | "URL">;
} & Field;

export type FieldProps = {
  disabled: boolean;
  field: Field;
  itemGroupId?: string;
  itemHeights?: Record<string, number>;
  onItemHeightChange?: (id: string, height: number) => void;
};

export const SchemaFieldType = {
  Asset: "Asset",
  Bool: "Bool",
  Checkbox: "Checkbox",
  Date: "Date",
  GeometryEditor: "GeometryEditor",
  GeometryObject: "GeometryObject",
  Group: "Group",
  Integer: "Integer",
  // RichText: "RichText",
  MarkdownText: "MarkdownText",
  Number: "Number",
  Reference: "Reference",
  Select: "Select",
  Tag: "Tag",
  Text: "Text",
  TextArea: "TextArea",
  URL: "URL",
} as const;

export type SchemaFieldType = (typeof SchemaFieldType)[keyof typeof SchemaFieldType];

export enum ExportSchemaFieldType {
  Text = "text",
  TextArea = "textArea",
  Markdown = "markdown",
  Asset = "asset",
  Datetime = "datetime",
  Bool = "bool",
  Select = "select",
  Integer = "integer",
  Number = "number",
  URL = "url",
  GeometryObject = "geometryObject",
  GeometryEditor = "geometryEditor",
}

export type Tag = {
  color: string;
  id: string;
  name: string;
};

export type ObjectSupportedType =
  | "GEOMETRYCOLLECTION"
  | "LINESTRING"
  | "MULTILINESTRING"
  | "MULTIPOINT"
  | "MULTIPOLYGON"
  | "POINT"
  | "POLYGON";

export type EditorSupportedType = "ANY" | "LINESTRING" | "POINT" | "POLYGON";

export type CorrespondingField = {
  description: string;
  id: string;
  key: Key;
  multiple: boolean;
  order: number;
  required: boolean;
  title: string;
  type: SchemaFieldType;
  unique: boolean;
};

export type TypeProperty = {
  assetDefaultValue?: null | string | string[];
  correspondingField?: CorrespondingField;
  defaultValue?:
    | boolean
    | boolean[]
    | GeoJSON
    | GeoJSON[]
    | null
    | number
    | number[]
    | string
    | string[];
  editorSupportedTypes?: EditorSupportedType[];
  groupId?: string;
  integerDefaultValue?: null | number | number[];
  max?: number;
  maxLength?: number;
  min?: number;
  modelId?: string;
  numberMax?: number;
  numberMin?: number;
  objectSupportedTypes?: ObjectSupportedType[];
  schema?: { id: string; titleFieldId: null | string };
  selectDefaultValue?: null | string | string[];
  tags?: Tag[];
  values?: string[];
};

export type FieldTypePropertyInput = {
  asset?: { defaultValue?: string };
  bool?: { defaultValue?: boolean };
  checkbox?: { defaultValue?: boolean };
  date?: { defaultValue: string };
  group?: {
    groupId: string;
  };
  integer?: { defaultValue: "" | number; max: null | number; min: null | number };
  markdownText?: { defaultValue?: string; maxLength?: number };
  reference?: {
    correspondingField: {
      description: string;
      key: string;
      required: boolean;
      title: string;
    } | null;
    modelId: string;
    schemaId: string;
  };
  select?: { defaultValue: string; values: string[] };
  tag?: {
    defaultValue?: string | string[];
    tags: Tag[];
  };
  text?: { defaultValue?: string; maxLength?: number };
  textArea?: { defaultValue?: string; maxLength?: number };
  url?: { defaultValue: string };
};

export type FieldModalTabs = "defaultValue" | "settings" | "validation";

export type Group = {
  description: string;
  id: string;
  key: string;
  name: string;
  order: number;
  projectId: string;
  schema: GroupSchema;
  schemaId: string;
};

export type ModelFormValues = {
  description: string;
  id?: string;
  key: string;
  name: string;
};

export type FormValues = {
  description: string;
  fieldId?: string;
  groupId?: string;
  isTitle: boolean;
  key: string;
  metadata: boolean;
  multiple: boolean;
  required: boolean;
  title: string;
  type?: SchemaFieldType;
  typeProperty: FieldTypePropertyInput;
  unique: boolean;
};

export type FormTypes = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
  group: string;
  max?: number;
  maxLength?: number;
  min?: number;
  supportedTypes?: EditorSupportedType | ObjectSupportedType[];
  tags?: Tag[];
  values?: string[];
} & FormValues;

export type Tab = "fields" | "meta-data";
export type SelectedSchemaType = "group" | "model";
