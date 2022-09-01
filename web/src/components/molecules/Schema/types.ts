export type Model = {
  id: string;
  name: string;
  description?: string;
  key: string;
  schema: Schema;
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
    }
  | any;
