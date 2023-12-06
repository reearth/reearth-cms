import { FieldType } from "@reearth-cms/components/molecules/Schema/types";

export type ItemStatus = "DRAFT" | "PUBLIC" | "REVIEW" | "PUBLIC_REVIEW" | "PUBLIC_DRAFT";

export type ItemField = {
  schemaFieldId: string;
  itemGroupId?: string;
  type: FieldType;
  value: any;
};

export type Item = {
  id: string;
  version: string;
  schemaId: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  status: ItemStatus;
  fields: ItemField[] | undefined | null;
  metadata: {
    id?: string;
    version: string;
    fields: ItemField[] | undefined | null;
  };
  threadId: string;
  comments: Comment[];
};

export type FormItem = {
  id: string;
  title: string;
  schemaId: string;
  createdBy: string;
  status: ItemStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type ContentTableField = {
  id: string;
  createdBy: string;
  updatedBy: string;
  schemaId: string;
  status: ItemStatus;
  modelId?: string;
  fields: { [key: string]: any };
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  metadata: { [key: string]: any };
  metadataId: string;
  version: string;
};

export type Comment = {
  id: string;
  author: { id?: string; name: string; type: "User" | "Integration" | null };
  content: string;
  createdAt: string;
};
