import { t } from "@reearth-cms/i18n";

export type User = {
  email: string;
  id: string;
  name: string;
};

export type Role = "MAINTAINER" | "OWNER" | "READER" | "WRITER";
t("WRITER");
t("READER");
t("MAINTAINER");
t("OWNER");

export type UserRights = {
  apiKey: {
    create: boolean;
    delete: boolean;
    read: boolean;
    update: boolean;
  };
  asset: {
    create: boolean;
    delete: boolean | null;
    read: boolean;
    update: boolean | null;
  };
  comment: {
    create: boolean;
    delete: boolean | null;
    read: boolean;
    update: boolean | null;
  };
  content: {
    create: boolean;
    delete: boolean | null;
    publish: boolean;
    read: boolean;
    update: boolean | null;
  };
  integrations: {
    connect: boolean;
    delete: boolean;
    update: boolean;
  };
  members: {
    changeRole: boolean;
    invite: boolean;
    leave: boolean;
    remove: boolean;
  };
  model: {
    create: boolean;
    delete: boolean;
    publish: boolean;
    read: boolean;
    update: boolean;
  };
  project: {
    create: boolean;
    delete: boolean;
    publish: boolean;
    read: boolean;
    update: boolean;
  };
  request: {
    approve: boolean;
    close: boolean | null;
    create: boolean;
    read: boolean;
    update: boolean | null;
  };
  role: Role;
  schema: {
    create: boolean;
    delete: boolean;
    read: boolean;
    update: boolean;
  };
  view: {
    create: boolean;
    delete: boolean;
    read: boolean;
    update: boolean;
  };
  workspace: {
    delete: boolean;
    update: boolean;
  };
  workspaceSetting: {
    update: boolean;
  };
};
