export const fieldTypes: {
  [P: string]: { icon: string; title: string; description: string; color: string };
} = {
  Text: {
    icon: "textT",
    title: "Text",
    description: "Heading and titles, one-line field",
    color: "#FF7875",
  },
  TextArea: {
    icon: "textAlignLeft",
    title: "TextArea",
    description: "Multi line text",
    color: "#FF7875",
  },
  MarkdownText: {
    icon: "markdown",
    title: "Markdown text",
    description: "Rich text which supports md style",
    color: "#FF7875",
  },
  Asset: {
    icon: "asset",
    title: "Asset",
    description: "Description",
    color: "#FF9C6E",
  },
  Select: {
    icon: "listBullets",
    title: "Option",
    description: "Description",
    color: "#7CB305",
  },
  Integer: {
    icon: "numberNine",
    title: "Int",
    description: "Description",
    color: "#36CFC9",
  },
  URL: {
    icon: "link",
    title: "URL",
    description: "Description",
    color: "#9254DE",
  },
};

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

export type CreationFieldTypePropertyInput = {
  asset?: { defaultValue: string };
  integer?: { defaultValue: number; min: number; max: number };
  markdownText?: { defaultValue: string; maxLength: number };
  select?: { defaultValue: string; values: string[] };
  text?: { defaultValue: string; maxLength: number };
  textArea?: { defaultValue: string; maxLength: number };
  url?: { defaultValue: string };
};
