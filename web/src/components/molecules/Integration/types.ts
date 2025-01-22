import { Role } from "@reearth-cms/components/molecules/Member/types";
import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";

export type IntegrationMember = {
  id: string;
  integration?: Integration;
  integrationRole: Role;
  invitedById: string;
  active: boolean;
};

export type IntegrationType = "Private" | "Public";
