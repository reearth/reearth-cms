import { type Dayjs } from "dayjs";

import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { FieldType } from "@reearth-cms/components/molecules/Schema/types";

export type ItemStatus = "DRAFT" | "PUBLIC" | "REVIEW" | "PUBLIC_REVIEW" | "PUBLIC_DRAFT";

export type FormValue =
  | string
  | string[]
  | number
  | number[]
  | boolean
  | boolean[]
  | Dayjs
  | ("" | Dayjs)[]
  | null
  | undefined;

export type FormGroupValue = Record<string, FormValue>;

export type ItemValue = string | string[] | number | number[] | boolean | boolean[];

export type ItemField = {
  schemaFieldId: string;
  itemGroupId?: string;
  type: FieldType;
  value: ItemValue;
};

export type ItemAsset = {
  id: string;
  fileName: string;
};

export type Metadata = {
  id?: string;
  version: string;
  fields: ItemField[] | undefined | null;
};

export type Item = {
  id: string;
  version: string;
  title: string;
  schemaId: string;
  createdBy?: Partial<User>;
  updatedBy?: Partial<User>;
  createdAt: Date;
  updatedAt: Date;
  status: ItemStatus;
  referencedItems: FormItem[];
  fields: ItemField[] | undefined | null;
  metadata: Metadata;
  threadId?: string;
  comments: Comment[];
  assets: ItemAsset[];
  requests: Pick<Request, "id" | "state" | "title">[];
};

export type FormItem = {
  id: string;
  title: string;
  schemaId: string;
  createdBy: string;
  status: ItemStatus;
  version?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ContentTableField = {
  id: string;
  createdBy: { id: string; name: string };
  updatedBy: string;
  schemaId: string;
  status: ItemStatus;
  modelId?: string;
  fields: Record<string, unknown>;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
  metadataId: string;
  version: string;
};

export type Comment = {
  id: string;
  author: { id?: string; name: string; type: "User" | "Integration" | null };
  content: string;
  createdAt: string;
};
