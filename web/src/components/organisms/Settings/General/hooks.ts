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
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useWorkspace } from "@reearth-cms/state";

export default () => {
  const [currentWorkspace] = useWorkspace();
  const t = useT();

  const workspaceId = currentWorkspace?.id;
  const { data } = useGetWorkspaceSettingsQuery({
    variables: { workspaceId: workspaceId ?? "" },
  });

  const workspaceSettings: WorkspaceSettings | undefined = useMemo(() => {
    return data ? (data.node as WorkspaceSettings) : undefined;
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
    async (tiles: TileInput[], terrains: TerrainInput[]) => {
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
          },
        },
      });

      if (res.errors) {
        Notification.error({ message: t("Failed to update workspace.") });
      } else {
        Notification.success({ message: t("Successfully updated workspace!") });
      }
    },
    [t, updateWorkspaceMutation, workspaceId],
  );

  const handleTerrainToggle = useCallback(
    async (isEnable: boolean) => {
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
            enabled: isEnable,
          },
        },
      });

      if (res.errors) {
        Notification.error({ message: t("Failed to update workspace.") });
      } else {
        Notification.success({ message: t("Successfully updated workspace!") });
      }
    },
    [t, terrains, tiles, updateWorkspaceMutation, workspaceId],
  );

  return {
    workspaceSettings,
    tiles,
    terrains,
    handleWorkspaceSettingsUpdate,
    handleTerrainToggle,
  };
};
