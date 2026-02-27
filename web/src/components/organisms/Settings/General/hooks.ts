import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import {
  TerrainInput,
  TileInput,
  WorkspaceSettings,
} from "@reearth-cms/components/molecules/Workspace/types";
import { fromGraphQLWorkspaceSettings } from "@reearth-cms/components/organisms/DataConverters/setting";
import {
  WorkspaceSettings as GQLWorkspaceSettings,
  ResourceInput,
} from "@reearth-cms/gql/__generated__/graphql.generated";
import {
  GetWorkspaceSettingsDocument,
  UpdateWorkspaceSettingsDocument,
} from "@reearth-cms/gql/__generated__/workspace.generated";
import { useT } from "@reearth-cms/i18n";
import { useUserRights, useWorkspace } from "@reearth-cms/state";

export default () => {
  const t = useT();

  const [currentWorkspace] = useWorkspace();
  const [userRights] = useUserRights();
  const workspaceId = currentWorkspace?.id;
  const { data, loading, refetch } = useQuery(GetWorkspaceSettingsDocument, {
    variables: { workspaceId: workspaceId ?? "" },
  });

  const defaultSettings: WorkspaceSettings = useMemo(
    () => ({
      terrains: {
        enabled: false,
        resources: [],
      },
      tiles: {
        resources: [],
      },
    }),
    [],
  );

  const workspaceSettings: WorkspaceSettings = useMemo(() => {
    return data?.node
      ? fromGraphQLWorkspaceSettings(data.node as GQLWorkspaceSettings)
      : defaultSettings;
  }, [data?.node, defaultSettings]);

  const [updateWorkspaceMutation, { loading: updateLoading }] = useMutation(
    UpdateWorkspaceSettingsDocument,
  );

  const handleWorkspaceSettingsUpdate = useCallback(
    async (tiles: TileInput[], terrains: TerrainInput[], isEnable?: boolean) => {
      if (!workspaceId) return;
      const res = await updateWorkspaceMutation({
        variables: {
          id: workspaceId,
          terrains: {
            enabled: isEnable ?? workspaceSettings?.terrains?.enabled,
            resources: terrains as ResourceInput[],
            selectedResource: terrains[0]?.terrain?.id,
          },
          tiles: {
            resources: tiles as ResourceInput[],
            selectedResource: tiles[0]?.tile?.id,
          },
        },
      });

      if (res.error) {
        Notification.error({ message: t("Failed to update workspace.") });
      } else {
        Notification.success({ message: t("Successfully updated workspace!") });
      }
      refetch();
    },
    [refetch, t, updateWorkspaceMutation, workspaceId, workspaceSettings?.terrains?.enabled],
  );

  const hasUpdateRight = useMemo(
    () => !!userRights?.workspaceSetting.update,
    [userRights?.workspaceSetting.update],
  );

  return {
    handleWorkspaceSettingsUpdate,
    hasUpdateRight,
    loading,
    updateLoading,
    workspaceSettings,
  };
};
