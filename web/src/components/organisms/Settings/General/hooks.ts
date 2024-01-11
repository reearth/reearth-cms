import { useCallback, useMemo } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import {
  WorkspaceSettings,
  TileInput,
  TerrainInput,
} from "@reearth-cms/components/molecules/Workspace/types";
import {
  useGetWorkspaceSettingsQuery,
  useUpdateWorkspaceSettingsMutation,
  ResourceInput,
  WorkspaceSettings as GQLWorkspaceSettings,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useWorkspace } from "@reearth-cms/state";

import { convertWorkspaceSettings } from "./convertWorkspaceSettings";

export default () => {
  const t = useT();

  const [currentWorkspace] = useWorkspace();
  const workspaceId = currentWorkspace?.id;
  const { data } = useGetWorkspaceSettingsQuery({
    variables: { workspaceId: workspaceId ?? "" },
  });
  const workspaceSettings: WorkspaceSettings | undefined = useMemo(() => {
    return data?.node ? convertWorkspaceSettings(data.node as GQLWorkspaceSettings) : undefined;
  }, [data]);

  const tiles: TileInput[] = useMemo(() => {
    const tiles: TileInput[] = [];
    workspaceSettings?.tiles?.resources?.map(resource => tiles.push({ tile: resource }));
    return tiles;
  }, [workspaceSettings?.tiles?.resources]);

  const terrains: TerrainInput[] = useMemo(() => {
    const terrains: TerrainInput[] = [];
    workspaceSettings?.terrains?.resources?.map(resource => terrains.push({ terrain: resource }));
    return terrains;
  }, [workspaceSettings?.terrains?.resources]);

  const [updateWorkspaceMutation] = useUpdateWorkspaceSettingsMutation();

  const handleWorkspaceSettingsUpdate = useCallback(
    async (tiles: TileInput[], terrains: TerrainInput[], isEnable?: boolean) => {
      if (!workspaceId) return;
      const res = await updateWorkspaceMutation({
        variables: {
          id: workspaceId,
          tiles: {
            resources: tiles as ResourceInput[],
            selectedResource: tiles[0]?.tile?.id,
          },
          terrains: {
            resources: terrains as ResourceInput[],
            selectedResource: terrains[0]?.terrain?.id,
            enabled: isEnable ?? workspaceSettings?.terrains?.enabled,
          },
        },
      });

      if (res.errors) {
        Notification.error({ message: t("Failed to update workspace.") });
      } else {
        Notification.success({ message: t("Successfully updated workspace!") });
      }
    },
    [t, updateWorkspaceMutation, workspaceId, workspaceSettings?.terrains?.enabled],
  );

  const handleTerrainToggle = useCallback(
    (isEnable: boolean) => {
      handleWorkspaceSettingsUpdate(tiles, terrains, isEnable);
    },
    [handleWorkspaceSettingsUpdate, tiles, terrains],
  );

  return {
    workspaceSettings,
    tiles,
    terrains,
    handleWorkspaceSettingsUpdate,
    handleTerrainToggle,
  };
};
