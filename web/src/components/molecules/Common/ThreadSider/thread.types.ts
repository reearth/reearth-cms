import { User } from "../Header";

export type Thread = {
  id: string;
  comments: CommentItem[];
};

export type CommentItem = {
  id: string;
  author: User;
  authorId: string;
  content: string;
  createdAt: string;
};
