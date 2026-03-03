import { Role, User } from "@reearth-cms/components/molecules/Member/types";
import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";

export type WorkspaceIntegration = {
  createdBy?: User;
  description?: string;
  id?: string;
  imageUrl?: string;
  name?: string;
  role: Role;
};

export type IntegrationMember = {
  active: boolean;
  id: string;
  integration?: Integration;
  integrationRole: Role;
  invitedById: string;
};

export type IntegrationType = "Private" | "Public";
