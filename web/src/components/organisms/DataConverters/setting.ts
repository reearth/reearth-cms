import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";
import {
  Member,
  Workspace,
  WorkspaceSettings,
} from "@reearth-cms/components/molecules/Workspace/types";
import {
  CesiumResourceProps,
  Integration as GQLIntegration,
  Workspace as GQLWorkspace,
  WorkspaceSettings as GQLWorkspaceSettings,
  TerrainType,
  TileType,
  UrlResourceProps,
  WorkspaceMember,
  WorkspaceUserMember,
} from "@reearth-cms/gql/__generated__/graphql.generated";

export const fromGraphQLWorkspaceSettings = (
  GQLWorkspaceSettings: GQLWorkspaceSettings,
): WorkspaceSettings => {
  return {
    terrains: {
      enabled: GQLWorkspaceSettings.terrains?.enabled ?? undefined,
      resources:
        GQLWorkspaceSettings.terrains?.resources.map(resource => ({
          id: resource.id,
          props: {
            cesiumIonAccessToken: (resource.props as CesiumResourceProps).cesiumIonAccessToken,
            cesiumIonAssetId: (resource.props as CesiumResourceProps).cesiumIonAssetId,
            image: (resource.props as CesiumResourceProps).image,
            name: (resource.props as CesiumResourceProps).name,
            url: (resource.props as CesiumResourceProps).url,
          },
          type: resource.type as TerrainType,
        })) ?? [],
      selectedResource: GQLWorkspaceSettings.terrains?.selectedResource ?? undefined,
    },
    tiles: {
      enabled: GQLWorkspaceSettings.tiles?.enabled ?? undefined,
      resources:
        GQLWorkspaceSettings.tiles?.resources.map(resource => ({
          id: resource.id,
          props: {
            image: (resource.props as UrlResourceProps).image,
            name: (resource.props as UrlResourceProps).name,
            url: (resource.props as UrlResourceProps).url,
          },
          type: resource.type as TileType,
        })) ?? [],
      selectedResource: GQLWorkspaceSettings.tiles?.selectedResource ?? undefined,
    },
  };
};

export const fromGraphQLIntegration = (integration: GQLIntegration): Integration => ({
  config: {
    token: integration.config?.token,
    webhooks: integration.config?.webhooks.map(webhook => ({
      active: webhook.active,
      createdAt: webhook.createdAt,
      id: webhook.id,
      name: webhook.name,
      secret: webhook.secret,
      trigger: {
        onAssetDecompress: webhook.trigger.onAssetDecompress,
        onAssetDelete: webhook.trigger.onAssetDelete,
        onAssetUpload: webhook.trigger.onAssetUpload,
        onItemCreate: webhook.trigger.onItemCreate,
        onItemDelete: webhook.trigger.onItemDelete,
        onItemPublish: webhook.trigger.onItemPublish,
        onItemUnPublish: webhook.trigger.onItemUnPublish,
        onItemUpdate: webhook.trigger.onItemUpdate,
      },
      updatedAt: webhook.updatedAt,
      url: webhook.url,
    })),
  },
  description: integration.description,
  developer: integration.developer,
  developerId: integration.developerId,
  id: integration.id,
  iType: integration.iType,
  logoUrl: integration.logoUrl,
  name: integration.name,
});

export const fromGraphQLWorkspace = (workspace: GQLWorkspace): Workspace => {
  return {
    alias: workspace.alias ?? "",
    id: workspace.id,
    members: workspace.members.map(member => fromGraphQLMember(member)),
    name: workspace.name,
    personal: workspace.personal,
  };
};

export const fromGraphQLMember = (member: WorkspaceMember): Member => {
  switch (member.__typename) {
    case "WorkspaceIntegrationMember":
      return {
        active: member.active,
        id: member.integrationId,
        integration: member.integration ? fromGraphQLIntegration(member.integration) : undefined,
        integrationRole: member.role,
        invitedById: member.invitedById,
      };
    case "WorkspaceUserMember":
    default:
      return {
        role: member.role,
        user: {
          email: (member as WorkspaceUserMember).user?.email ?? "",
          id: (member as WorkspaceUserMember).user?.id ?? "",
          name: (member as WorkspaceUserMember).user?.name ?? "",
        },
        userId: (member as WorkspaceUserMember).userId,
      };
  }
};
