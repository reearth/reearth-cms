export type Model = {
  id: string;
  name: string;
  description?: string;
  key: string;
  schema: Schema;
  metadataSchema?: MetaDataSchema;
  public: boolean;
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
  | "RichText"
  | "MarkdownText"
  | "Asset"
  | "Date"
  | "Bool"
  | "Select"
  | "Tag"
  | "Integer"
  | "Reference"
  | "Checkbox"
  | "URL";

export type TypeProperty =
  | {
      defaultValue?: string | number;
      maxLength?: number;
      assetDefaultValue?: string;
      selectDefaultValue?: string;
      integerDefaultValue?: number;
      min?: number;
      max?: number;
      correspondingField?: any;
      modelId?: string;
    }
  | any;

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
};

export type FieldModalTabs = "settings" | "validation" | "defaultValue";
