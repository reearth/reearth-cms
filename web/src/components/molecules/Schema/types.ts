import { Key } from "react";

export interface MetaDataSchema {
  id?: string;
  fields?: Field[];
}

export interface Schema {
  id: string;
  fields: Field[];
}

export interface Field {
  id: string;
  type: FieldType;
  title: string;
  key: string;
  description: string;
  required: boolean;
  unique: boolean;
  multiple: boolean;
  isTitle: boolean;
  metadata?: boolean;
  typeProperty?: TypeProperty;
}

export type FieldType =
  | "Text"
  | "TextArea"
  // | "RichText"
  | "MarkdownText"
  | "Asset"
  | "Date"
  | "Bool"
  | "Select"
  | "Tag"
  | "Integer"
  // | "Float"
  | "Reference"
  | "Checkbox"
  | "URL"
  | "Group"
  | "GeometryObject"
  | "GeometryEditor";

interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TypeProperty {
  defaultValue?: string | boolean | string[] | boolean[];
  maxLength?: number;
  assetDefaultValue?: string;
  selectDefaultValue?: string | string[];
  integerDefaultValue?: number;
  min?: number;
  max?: number;
  correspondingField?: {
    id: string;
    type: FieldType;
    title: string;
    key: Key;
    description: string;
    required: boolean;
    unique: boolean;
    multiple: boolean;
    order: number;
  };
  modelId?: string;
  groupId?: string;
  tags?: Tag[];
  values?: string[];
  schema?: { titleFieldId: string | null };
}

export interface FieldTypePropertyInput {
  text?: { defaultValue?: string; maxLength?: number };
  textArea?: { defaultValue?: string; maxLength?: number };
  markdownText?: { defaultValue?: string; maxLength?: number };
  asset?: { defaultValue?: string };
  date?: { defaultValue: string };
  bool?: { defaultValue?: boolean };
  select?: { defaultValue: string; values: string[] };
  tag?: {
    defaultValue?: string;
    tags: { color: string; id?: string; name: string }[];
  };
  checkbox?: { defaultValue?: boolean };
  integer?: { defaultValue: number | ""; min: number | null; max: number | null };
  reference?: {
    modelId: string;
    schemaId: string;
    correspondingField: {
      key: string;
      title: string;
      description: string;
      required: boolean;
    } | null;
  };
  url?: { defaultValue: string };
  group?: {
    groupId: string;
  };
  point?: { defaultValue: string };
  polyline?: { defaultValue: string };
  polygon?: { defaultValue: string };
}

export type FieldModalTabs = "settings" | "validation" | "defaultValue";

export interface Group {
  id: string;
  schemaId: string;
  projectId: string;
  name: string;
  description: string;
  key: string;
  schema: Schema;
  order: number;
}

export interface ModelFormValues {
  id?: string;
  name: string;
  description: string;
  key: string;
}

export interface FormValues {
  fieldId?: string;
  groupId?: string;
  title: string;
  description: string;
  key: string;
  metadata: boolean;
  multiple: boolean;
  unique: boolean;
  isTitle: boolean;
  required: boolean;
  type?: FieldType;
  typeProperty: FieldTypePropertyInput;
}

export type FormTypes = FormValues & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
  maxLength?: number;
  values?: string[];
  min?: number;
  max?: number;
  tags?: { color: string; id: string; name: string }[];
  group: string;
  supportedTypes?: string[] | string;
};

export type Tab = "fields" | "meta-data";
export type SelectedSchemaType = "model" | "group";
