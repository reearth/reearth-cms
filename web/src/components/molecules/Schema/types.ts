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
  description: string | null | undefined;
  required: boolean;
  unique: boolean;
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
