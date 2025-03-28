import { Comment } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";
import { FormItem } from "@reearth-cms/components/molecules/Content/types";
import { User } from "@reearth-cms/components/molecules/Member/types";
import { Schema } from "@reearth-cms/components/molecules/Schema/types";

export type RequestState = "APPROVED" | "CLOSED" | "DRAFT" | "WAITING";

export type Request = {
  id: string;
  threadId?: string;
  title: string;
  description: string;
  comments: Comment[];
  createdAt: Date;
  reviewers: User[];
  state: RequestState;
  createdBy?: User;
  updatedAt: Date;
  approvedAt?: Date;
  closedAt?: Date;
  items: ItemInRequest[];
};

export type ItemInRequest = {
  id: string;
  title: string;
  modelId?: string;
  modelName?: string;
  version?: string;
  schema?: Schema;
  initialValues: Record<string, unknown>;
  referencedItems: FormItem[];
};

export type RequestItem = {
  itemId: string;
  version?: string;
};

export type RequestUpdatePayload = {
  requestId: string;
  title?: string;
  description?: string;
  state?: RequestState;
  reviewersId?: string[];
  items?: RequestItem[];
};
