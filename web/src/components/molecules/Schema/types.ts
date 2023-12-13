export type Model = {
  id: string;
  name: string;
  description?: string;
  key: string;
  schema: Schema;
  metadataSchema?: MetaDataSchema;
  public: boolean;
  order?: number;
};

export type MetaDataSchema = {
  id?: string;
  fields?: Field[];
};

export type Schema = {
  id: string;
  fields: Field[];
};

export type Field = {
  id: string;
  type: FieldType;
  title: string;
  key: string;
  description: string | null | undefined;
  required: boolean;
  unique: boolean;
  multiple: boolean;
  isTitle: boolean;
  metadata?: boolean;
  typeProperty?: TypeProperty;
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
  // | "Float"
  | "Reference"
  | "Checkbox"
  | "URL"
  | "Group";

type Tag = { id: string; name: string; color: string };

export type TypeProperty = {
  defaultValue?: string | boolean | string[] | boolean[];
  maxLength?: number;
  assetDefaultValue?: string;
  selectDefaultValue?: string | string[];
  integerDefaultValue?: number;
  min?: number;
  max?: number;
  correspondingField?: any;
  modelId?: string;
  groupId?: string;
  tags?: Tag[];
  values?: string[];
};

export type CreationFieldTypePropertyInput = {
  asset?: { defaultValue: string };
  integer?: { defaultValue: number; min: number; max: number };
  markdownText?: { defaultValue: string; maxLength: number };
  select?: { defaultValue: string; values: string[] };
  text?: { defaultValue: string; maxLength: number };
  textArea?: { defaultValue: string; maxLength: number };
  url?: { defaultValue: string };
  reference?: {
    modelId: string;
    correspondingField: any;
  };
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
  schema: Schema;
};
