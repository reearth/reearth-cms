export type Project = {
  id: string;
  name: string;
  description: string;
  requestRoles?: Role[] | null;
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

export type MemberInput = {
  userId: string;
  role: Role;
};

export type Role = "WRITER" | "READER" | "MAINTAINER" | "OWNER";

export type Tile = {
  id: string;
  name: string;
  url: string;
  image: string;
};

export type Tiles = {
  list: Tile[];
  default: string;
  switching: boolean;
};

export type Workspace = {
  id?: string;
  name?: string;
  members?: Member[];
  tiles?: Tiles;
};
