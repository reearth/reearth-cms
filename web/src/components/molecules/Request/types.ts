import { Comment } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";
import { FormItem } from "@reearth-cms/components/molecules/Content/types";
import { User } from "@reearth-cms/components/molecules/Member/types";
import { Schema } from "@reearth-cms/components/molecules/Schema/types";

export type RequestState = "APPROVED" | "CLOSED" | "DRAFT" | "WAITING";

export type Request = {
  approvedAt?: Date;
  closedAt?: Date;
  comments: Comment[];
  createdAt: Date;
  createdBy?: User;
  description: string;
  id: string;
  items: ItemInRequest[];
  reviewers: User[];
  state: RequestState;
  threadId?: string;
  title: string;
  updatedAt: Date;
};

export type ItemInRequest = {
  id: string;
  initialValues: Record<string, unknown>;
  modelId?: string;
  modelName?: string;
  referencedItems: FormItem[];
  schema?: Schema;
  title: string;
  version?: string;
};

export type RequestItem = {
  itemId: string;
  version?: string;
};

export type RequestUpdatePayload = {
  description?: string;
  items?: RequestItem[];
  requestId: string;
  reviewersId?: string[];
  state?: RequestState;
  title?: string;
};
