import { useMutation } from "@apollo/client/react";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";

import Notification from "@reearth-cms/components/atoms/Notification";
import { fromGraphQLWorkspace } from "@reearth-cms/components/organisms/DataConverters/setting";
import { Workspace as GQLWorkspace } from "@reearth-cms/gql/__generated__/graphql.generated";
import {
  DeleteWorkspaceDocument,
  UpdateWorkspaceDocument,
} from "@reearth-cms/gql/__generated__/workspace.generated";
import { useT } from "@reearth-cms/i18n";
import { useWorkspace, useUserRights } from "@reearth-cms/state";

export default () => {
  const t = useT();
  const navigate = useNavigate();
  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();
  const [userRights] = useUserRights();
  const hasUpdateRight = useMemo(
    () => !!userRights?.workspace.update,
    [userRights?.workspace.update],
  );
  const hasDeleteRight = useMemo(
    () => !!userRights?.workspace.delete,
    [userRights?.workspace.delete],
  );

  const workspaceId = currentWorkspace?.id;
  const workspaceName = currentWorkspace?.name;

  const [updateWorkspaceMutation, { loading: updateWorkspaceLoading }] =
    useMutation(UpdateWorkspaceDocument);
  const [deleteWorkspaceMutation] = useMutation(DeleteWorkspaceDocument, {
    refetchQueries: ["GetMe"],
  });

  const handleWorkspaceUpdate = useCallback(
    async (name: string) => {
      if (!workspaceId || !name) return;
      const res = await updateWorkspaceMutation({
        variables: {
          workspaceId,
          name,
        },
      });
      if (res.error || !res.data?.updateWorkspace) {
        Notification.error({ message: t("Failed to update workspace.") });
      } else {
        setCurrentWorkspace(
          fromGraphQLWorkspace(res.data.updateWorkspace.workspace as GQLWorkspace),
        );
        Notification.success({ message: t("Successfully updated workspace!") });
      }
    },
    [workspaceId, updateWorkspaceMutation, setCurrentWorkspace, t],
  );

  const handleWorkspaceDelete = useCallback(async () => {
    if (!workspaceId) return;
    const results = await deleteWorkspaceMutation({ variables: { workspaceId } });
    if (results.error) {
      Notification.error({ message: t("Failed to delete workspace.") });
    } else {
      setCurrentWorkspace(undefined);
      Notification.success({ message: t("Successfully deleted workspace!") });
      navigate(`/workspace`);
    }
  }, [workspaceId, deleteWorkspaceMutation, setCurrentWorkspace, navigate, t]);

  return {
    workspaceName,
    updateWorkspaceLoading,
    hasUpdateRight,
    hasDeleteRight,
    handleWorkspaceUpdate,
    handleWorkspaceDelete,
  };
};
