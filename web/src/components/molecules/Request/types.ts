import { ProColumns } from "@ant-design/pro-table";

import { ContentTableField } from "../Content/types";
import { User } from "../Member/types";

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
  items: {
    fields?: ContentTableField;
    columns?: ProColumns<ContentTableField>[];
    modelName?: string;
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

export type Comment = {
  id: string;
  author: string;
  authorType: "User" | "Integration";
  content: string;
  createdAt: string;
};
