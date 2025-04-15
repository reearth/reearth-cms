import { Key } from "react";

export type MetaDataSchema = {
  id?: string;
  fields?: MetadataField[];
};

export type Schema = {
  id: string;
  fields: Field[];
};

type GroupSchema = Schema & { fields: GroupField[] };

export type Field = {
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
};

export type GroupField = Field & { type: Exclude<FieldType, "Group"> };

export type MetadataField = Field & {
  type: Extract<FieldType, "Tag" | "Bool" | "Checkbox" | "Date" | "Text" | "URL">;
};

export type FieldProps = {
  field: Field;
  itemGroupId?: string;
  disabled: boolean;
  itemHeights?: Record<string, number>;
  onItemHeightChange?: (id: string, height: number) => void;
};

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
  | "Number"
  | "Reference"
  | "Checkbox"
  | "URL"
  | "Group"
  | "GeometryObject"
  | "GeometryEditor";

export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type ObjectSupportedType =
  | "POINT"
  | "MULTIPOINT"
  | "LINESTRING"
  | "MULTILINESTRING"
  | "POLYGON"
  | "MULTIPOLYGON"
  | "GEOMETRYCOLLECTION";

export type EditorSupportedType = "POINT" | "LINESTRING" | "POLYGON" | "ANY";

export type CorrespondingField = {
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

export type TypeProperty = {
  defaultValue?: string | string[] | boolean | boolean[] | null;
  maxLength?: number;
  assetDefaultValue?: string | string[] | null;
  selectDefaultValue?: string | string[] | null;
  integerDefaultValue?: number | number[] | null;
  min?: number;
  max?: number;
  numberMin?: number;
  numberMax?: number;
  correspondingField?: CorrespondingField;
  modelId?: string;
  groupId?: string;
  tags?: Tag[];
  values?: string[];
  schema?: { id: string; titleFieldId: string | null };
  objectSupportedTypes?: ObjectSupportedType[];
  editorSupportedTypes?: EditorSupportedType[];
};

export type FieldTypePropertyInput = {
  text?: { defaultValue?: string; maxLength?: number };
  textArea?: { defaultValue?: string; maxLength?: number };
  markdownText?: { defaultValue?: string; maxLength?: number };
  asset?: { defaultValue?: string };
  date?: { defaultValue: string };
  bool?: { defaultValue?: boolean };
  select?: { defaultValue: string; values: string[] };
  tag?: {
    defaultValue?: string | string[];
    tags: Tag[];
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
};

export type FieldModalTabs = "settings" | "validation" | "defaultValue";

export type Group = {
  id: string;
  schemaId: string;
  projectId: string;
  name: string;
  description: string;
  key: string;
  schema: GroupSchema;
  order: number;
};

export type ModelFormValues = {
  id?: string;
  name: string;
  description: string;
  key: string;
};

export type FormValues = {
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
};

export type FormTypes = FormValues & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
  maxLength?: number;
  values?: string[];
  min?: number;
  max?: number;
  tags?: Tag[];
  group: string;
  supportedTypes?: ObjectSupportedType[] | EditorSupportedType;
};

export type Tab = "fields" | "meta-data";
export type SelectedSchemaType = "model" | "group";
