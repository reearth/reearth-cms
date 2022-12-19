import { FieldType } from "@reearth-cms/components/molecules/Schema/types";

export type ItemField = {
  schemaFieldId: string;
  type: FieldType;
  value: any;
};

export type Item = {
  id: string;
  schemaId: string;
  fields: ItemField[] | undefined | null;
  threadId: string;
  comments: Comment[];
};

export type ContentTableField = {
  id: string;
  schemaId: string;
  modelId?: string;
  fields: { [key: string]: any };
  comments: Comment[];
};

export type Comment = {
  id: string;
  author: string;
  authorType: "User" | "Integration" | null;
  content: string;
  createdAt: string;
};
