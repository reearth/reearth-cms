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

export type UserRights = {
  role: Role;
  workspace: {
    update: boolean;
    delete: boolean;
  };
  workspaceSetting: {
    update: boolean;
  };
  integrations: {
    connect: boolean;
    update: boolean;
    delete: boolean;
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
  model: {
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
  view: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  content: {
    create: boolean;
    read: boolean;
    update: boolean | null;
    delete: boolean | null;
    publish: boolean;
  };
  asset: {
    create: boolean;
    read: boolean;
    update: boolean | null;
    delete: boolean | null;
  };
  request: {
    create: boolean;
    read: boolean;
    update: boolean | null;
    close: boolean | null;
    approve: boolean;
  };
  comment: {
    create: boolean;
    read: boolean;
    update: boolean | null;
    delete: boolean | null;
  };
};
