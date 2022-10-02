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
  role: any;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type Workspace = {
  id?: string;
  name?: string;
  members?: Member[];
};
