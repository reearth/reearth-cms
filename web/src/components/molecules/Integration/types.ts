import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";

export type IntegrationMember = {
  id: string;
  integration?: Integration;
  integrationRole: Role;
  invitedById: string;
  active: boolean;
};

export type Role = "WRITER" | "READER" | "OWNER" | "MAINTAINER";

export type IntegrationType = "Private" | "Public";
