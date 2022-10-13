import { User } from "../../Dashboard/types";

export type Thread = {
  id: string;
  comments: Comment[];
};

export type Comment = {
  id: string;
  author: User;
  authorId: string;
  content: string;
  createdAt: string;
};
