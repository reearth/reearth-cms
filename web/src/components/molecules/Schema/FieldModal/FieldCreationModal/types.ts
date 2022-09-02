export enum CreationFiledType {
  Asset = "Asset",
  Bool = "Bool",
  Date = "Date",
  Integer = "Integer",
  MarkdownText = "MarkdownText",
  Reference = "Reference",
  RichText = "RichText",
  Select = "Select",
  Tag = "Tag",
  Text = "Text",
  TextArea = "TextArea",
  Url = "URL",
}

export type CreationFieldTypePropertyInput = {
  asset?: { defaultValue: string };
  integer?: { defaultValue: number; min: number; max: number };
  markdownText?: { defaultValue: string; maxLength: number };
  select?: { defaultValue: string; values: string[] };
  text?: { defaultValue: string; maxLength: number };
  textArea?: { defaultValue: string; maxLength: number };
  url?: { defaultValue: string };
};
