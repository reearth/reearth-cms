export type Request = {
  id: string;
  threadId: string;
  comments: Comment[];
  createdAt: Date;
};

export type Comment = {
  id: string;
  author: string;
  authorType: "User" | "Integration";
  content: string;
  createdAt: string;
};
