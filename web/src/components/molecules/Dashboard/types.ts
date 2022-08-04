export type Model = {
  id: string;
  name: string;
  description: string;
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

export type Project = {
  id: string;
  name: string;
  description: string;
};

export type User = {
  name: string;
};

export type Member = {
  userId: string;
  user: {
    id?: string;
    name?: string;
  };
};

export type Workspace = {
  id?: string;
  name?: string;
  members?: Member[];
};
