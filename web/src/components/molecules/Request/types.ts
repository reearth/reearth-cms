import { Comment } from "@reearth-cms/components/molecules/Content/types";
import { User } from "@reearth-cms/components/molecules/Member/types";
import { Schema } from "@reearth-cms/components/molecules/Schema/types";

export type RequestState = "APPROVED" | "CLOSED" | "DRAFT" | "WAITING";

export type Request = {
  id: string;
  threadId: string;
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
  items: {
    id: string;
    modelName?: string;
    schema?: Schema;
    initialValues: {
      [key: string]: any;
    };
  }[];
};

export type RequestUpdatePayload = {
  requestId: string;
  title?: string;
  description?: string;
  state?: RequestState;
  reviewersId?: string[];
  items?: {
    itemId: string;
  }[];
};
