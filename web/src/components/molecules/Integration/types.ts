import { Role, User } from "@reearth-cms/components/molecules/Member/types";
import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";

export type WorkspaceIntegration = {
  id?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  createdBy?: User;
  role: Role;
};

export type IntegrationMember = {
  id: string;
  integration?: Integration;
  integrationRole: Role;
  invitedById: string;
  active: boolean;
};

export type IntegrationType = "Private" | "Public";
