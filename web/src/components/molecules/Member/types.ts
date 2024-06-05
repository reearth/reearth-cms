export interface User {
  id: string;
  name: string;
  email: string;
}

export type RoleUnion = "READER" | "WRITER" | "MAINTAINER" | "OWNER";
