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
            enabled: true,
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

  return {
    workspaceSettings,
    handleWorkspaceSettingsUpdate,
  };
};
