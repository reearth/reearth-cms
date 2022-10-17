export type Project = {
  id: string;
  name: string;
  description: string;
};

export type User = {
  name: string;
};

export type Member = {
  userId: string;
  role: Role;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type Role = "WRITER" | "READER" | "OWNER";

export type Workspace = {
  id?: string;
  name?: string;
  members?: Member[];
};
