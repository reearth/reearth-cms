import type { GeoJSON } from "geojson";

import { type Dayjs } from "dayjs";

import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { Comment } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";
import { StateType } from "@reearth-cms/components/molecules/Content/Table/types";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";

export type ItemStatus = "DRAFT" | "PUBLIC_DRAFT" | "PUBLIC_REVIEW" | "PUBLIC" | "REVIEW";

export type FormValues = Record<string, FormGroupValue | FormValue>;

export type FormValue =
  | ("" | Dayjs)[]
  | boolean
  | boolean[]
  | Dayjs
  | GeoJSON
  | GeoJSON[]
  | null
  | number
  | number[]
  | string
  | string[]
  | undefined;

export type FormGroupValue = Record<string, FormValue>;

export type ItemValue =
  | boolean
  | boolean[]
  | GeoJSON
  | GeoJSON[]
  | number
  | number[]
  | string
  | string[];

export type ItemField = {
  itemGroupId?: string;
  schemaFieldId: string;
  type: SchemaFieldType;
  value: ItemValue;
};

export type ItemAsset = {
  fileName: string;
  id: string;
};

export type Metadata = {
  fields: ItemField[] | null | undefined;
  id?: string;
  version: string;
};

export type Item = {
  assets: ItemAsset[];
  comments: Comment[];
  createdAt: Date;
  createdBy?: Partial<User>;
  fields: ItemField[] | null | undefined;
  id: string;
  metadata: Metadata;
  referencedItems: FormItem[];
  requests: Pick<Request, "id" | "state" | "title">[];
  schemaId: string;
  status: ItemStatus;
  threadId?: string;
  title: string;
  updatedAt: Date;
  updatedBy?: Partial<User>;
  version: string;
};

export type FormItem = {
  createdAt: Date;
  createdBy: string;
  id: string;
  schemaId: string;
  status: ItemStatus;
  title: string;
  updatedAt: Date;
  version?: string;
};

export type ContentTableField = {
  comments: Comment[];
  createdAt: Date;
  createdBy: { id: string; name: string };
  fields: Record<string, unknown>;
  id: string;
  metadata: Record<string, unknown>;
  metadataId: string;
  modelId?: string;
  schemaId: string;
  status: ItemStatus;
  updatedAt: Date;
  updatedBy: string;
  version: string;
};

export type VersionedItem = {
  creator: Pick<User, "name">;
  fields: ItemField[];
  requests: Pick<Request, "id" | "title">[];
  status: StateType;
  timestamp: Date;
  version: string;
};
