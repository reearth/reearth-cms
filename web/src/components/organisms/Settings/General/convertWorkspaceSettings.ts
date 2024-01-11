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
          props: {
            image: (resource.props as UrlResourceProps).image,
            name: (resource.props as UrlResourceProps).name,
            url: (resource.props as UrlResourceProps).url,
          },
        })) ?? [],
      selectedResource: GQLWorkspaceSettings.tiles?.selectedResource ?? undefined,
      enabled: GQLWorkspaceSettings.tiles?.enabled ?? undefined,
    },
    terrains: {
      resources:
        GQLWorkspaceSettings.terrains?.resources.map(resource => ({
          id: resource.id,
          type: resource.type as TerrainType,
          props: {
            url: (resource.props as CesiumResourceProps).url,
            name: (resource.props as CesiumResourceProps).name,
            image: (resource.props as CesiumResourceProps).image,
            cesiumIonAccessToken: (resource.props as CesiumResourceProps).cesiumIonAccessToken,
            cesiumIonAssetId: (resource.props as CesiumResourceProps).cesiumIonAssetId,
          },
        })) ?? [],
      selectedResource: GQLWorkspaceSettings.terrains?.selectedResource ?? undefined,
      enabled: GQLWorkspaceSettings.terrains?.enabled ?? undefined,
    },
  };
};
