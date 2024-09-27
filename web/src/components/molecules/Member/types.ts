import { t } from "@reearth-cms/i18n";

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Role = "READER" | "WRITER" | "MAINTAINER" | "OWNER";
t("WRITER");
t("READER");
t("MAINTAINER");
t("OWNER");

export type UserRole = {
  role: Role;
  workspace: {
    remove: boolean;
  };
  members: {
    invite: boolean;
    remove: boolean;
    changeRole: boolean;
    leave: boolean;
  };
  project: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    publish: boolean;
  };
  schema: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  model: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    publish: boolean;
  };
  content: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  asset: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  request: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
    deny: boolean;
  };
  comment: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
};
