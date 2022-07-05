export type User = {
  name: string;
};

export type Member = {
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
