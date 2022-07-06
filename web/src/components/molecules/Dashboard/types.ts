export type User = {
  name: string;
};

export type Member = {
  userId: string;
  user: {
    id?: string;
    name?: string;
  };
};

export type Workspace = {
  id?: string;
  name?: string;
  members?: Member[];
};
