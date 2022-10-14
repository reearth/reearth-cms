import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { User } from "@reearth-cms/components/molecules/Dashboard/types";
import { useCreateWorkspaceMutation, useGetMeQuery } from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useWorkspace } from "@reearth-cms/state";

export default (workspaceId?: string) => {
  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();
  const [workspaceModalShown, setWorkspaceModalShown] = useState(false);
  const { data, refetch } = useGetMeQuery();
  const t = useT();

  const navigate = useNavigate();

  const user: User = {
    name: data?.me?.name || "",
  };

  const workspaces = data?.me?.workspaces;
  const workspace = workspaces?.find(workspace => workspace.id === workspaceId);
  const personalWorkspace = workspaces?.find(
    workspace => workspace.id === data?.me?.myWorkspace.id,
  );
  const personal = workspaceId === data?.me?.myWorkspace.id;

  useEffect(() => {
    if (currentWorkspace || workspaceId || !data) return;
    setCurrentWorkspace(data.me?.myWorkspace);
    navigate(`/dashboard/${data.me?.myWorkspace?.id}`);
  }, [data, navigate, setCurrentWorkspace, currentWorkspace, workspaceId]);

  useEffect(() => {
    if (workspace?.id && workspace.id !== currentWorkspace?.id) {
      setCurrentWorkspace({
        personal,
        ...workspace,
      });
    }
  }, [currentWorkspace, workspace, setCurrentWorkspace, personal]);

  const handleWorkspaceChange = useCallback(
    (workspaceId: string) => {
      const workspace = workspaces?.find(workspace => workspace.id === workspaceId);
      if (workspace) {
        setCurrentWorkspace(workspace);
        navigate(`/dashboard/${workspaceId}`);
      }
    },
    [workspaces, setCurrentWorkspace, navigate],
  );

  const [createWorkspaceMutation] = useCreateWorkspaceMutation();
  const handleWorkspaceCreate = useCallback(
    async (data: { name: string }) => {
      const results = await createWorkspaceMutation({
        variables: { name: data.name },
        refetchQueries: ["GetWorkspaces"],
      });
      if (results.data?.createWorkspace) {
        Notification.success({ message: t("Successfully created workspace!") });
        setCurrentWorkspace(results.data.createWorkspace.workspace);
        navigate(`/dashboard/${results.data.createWorkspace.workspace.id}`);
      }
      refetch();
    },
    [createWorkspaceMutation, setCurrentWorkspace, refetch, navigate, t],
  );

  const handleWorkspaceModalClose = useCallback(() => {
    setWorkspaceModalShown(false);
  }, []);

  const handleWorkspaceModalOpen = useCallback(() => setWorkspaceModalShown(true), []);

  return {
    user,
    personalWorkspace,
    workspaces,
    currentWorkspace,
    workspaceModalShown,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    handleWorkspaceCreate,
    handleWorkspaceChange,
  };
};
