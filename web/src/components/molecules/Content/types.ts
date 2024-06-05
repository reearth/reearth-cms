import { FieldType } from "@reearth-cms/components/molecules/Schema/types";

export type ItemStatus = "DRAFT" | "PUBLIC" | "REVIEW" | "PUBLIC_REVIEW" | "PUBLIC_DRAFT";

export type ItemValue = string | string[] | number | number[] | boolean | boolean[];

export interface ItemField {
  schemaFieldId: string;
  itemGroupId?: string;
  type: FieldType;
  value: ItemValue;
}

export interface ItemAsset {
  id: string;
  fileName: string;
}

export interface Item {
  id: string;
  version: string;
  schemaId: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  status: ItemStatus;
  referencedItems: FormItem[];
  fields: ItemField[] | undefined | null;
  metadata: {
    id?: string;
    version: string;
    fields: ItemField[] | undefined | null;
  };
  threadId: string;
  comments: Comment[];
  assets: ItemAsset[];
}

export interface FormItem {
  id: string;
  title: string;
  schemaId: string;
  createdBy: string;
  status: ItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentTableField {
  id: string;
  createdBy: string;
  updatedBy: string;
  schemaId: string;
  status: ItemStatus;
  modelId?: string;
  fields: Record<string, any>;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
  metadataId: string;
  version: string;
}

export interface Comment {
  id: string;
  author: { id?: string; name: string; type: "User" | "Integration" | null };
  content: string;
  createdAt: string;
}
