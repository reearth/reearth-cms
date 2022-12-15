import { User } from "../Member/types";

export type RequestState = "APPROVED" | "CLOSED" | "DRAFT" | "WAITING";

export type Request = {
  id: string;
  threadId: string;
  title: string;
  comments: Comment[];
  createdAt: Date;
  reviewers: User[];
  state: RequestState;
  createdBy: string;
  updatedAt: Date;
};

export type Comment = {
  id: string;
  author: string;
  authorType: "User" | "Integration";
  content: string;
  createdAt: string;
};
