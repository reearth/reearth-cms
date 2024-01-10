import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import {
  WorkspaceSettings as GQLWorkspaceSettings,
  TileType,
  TerrainType,
  UrlResourceProps,
  CesiumResourceProps,
} from "@reearth-cms/gql/graphql-client-api";

export const convertWorkspaceSettings = (
  GQLWorkspaceSettings: GQLWorkspaceSettings,
): WorkspaceSettings => {
  return {
    id: GQLWorkspaceSettings.id,
    tiles: {
      resources:
        GQLWorkspaceSettings.tiles?.resources.map(resource => ({
          id: resource.id,
          type: resource.type as TileType,
          props: (resource.props ?? undefined) as UrlResourceProps | undefined,
        })) ?? [],
      selectedResource: GQLWorkspaceSettings.tiles?.selectedResource ?? undefined,
      enabled: GQLWorkspaceSettings.tiles?.enabled ?? undefined,
    },
    terrains: {
      resources:
        GQLWorkspaceSettings.terrains?.resources.map(resource => ({
          id: resource.id,
          type: resource.type as TerrainType,
          props: (resource.props ?? undefined) as CesiumResourceProps | undefined,
        })) ?? [],
      selectedResource: GQLWorkspaceSettings.terrains?.selectedResource ?? undefined,
      enabled: GQLWorkspaceSettings.terrains?.enabled ?? undefined,
    },
  };
};
