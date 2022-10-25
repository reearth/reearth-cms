import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { PublicScope } from "@reearth-cms/components/molecules/Accessibility";
import {
  useCreateWorkspaceMutation,
  useGetMeQuery,
  useGetProjectQuery,
  ProjectPublicationScope,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useWorkspace, useProject } from "@reearth-cms/state";

export default () => {
  const t = useT();
  const { projectId, workspaceId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();
  const [currentProject, setCurrentProject] = useProject();
  const [workspaceModalShown, setWorkspaceModalShown] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { data, refetch } = useGetMeQuery();

  const [secondaryRoute, subRoute] = useMemo(() => {
    const splitPathname = pathname.split("/");
    const secondaryRoute = splitPathname[3];
    const subRoute = secondaryRoute === "project" ? splitPathname[5] : secondaryRoute;
    return [secondaryRoute, subRoute];
  }, [pathname]);

  const selectedKey = useMemo(() => subRoute ?? "home", [subRoute]);

  const username = useMemo(() => data?.me?.name || "", [data?.me?.name]);

  const handleCollapse = useCallback((collapse: boolean) => {
    setCollapsed(collapse);
  }, []);

  const workspaces = data?.me?.workspaces;
  const workspace = workspaces?.find(workspace => workspace.id === workspaceId);
  const personalWorkspace = workspaces?.find(
    workspace => workspace.id === data?.me?.myWorkspace.id,
  );
  const personal = workspaceId === data?.me?.myWorkspace.id;

  useEffect(() => {
    if (currentWorkspace || workspaceId || !data) return;
    setCurrentWorkspace(data.me?.myWorkspace);
    navigate(`/workspace/${data.me?.myWorkspace?.id}`);
  }, [data, navigate, setCurrentWorkspace, currentWorkspace, workspaceId]);

  useEffect(() => {
    if (workspace?.id && workspace.id !== currentWorkspace?.id) {
      setCurrentWorkspace({
        personal,
        ...workspace,
      });
    }
  }, [currentWorkspace, workspace, personal, setCurrentWorkspace]);

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
        navigate(`/workspace/${results.data.createWorkspace.workspace.id}`);
      }
      refetch();
    },
    [createWorkspaceMutation, setCurrentWorkspace, refetch, navigate, t],
  );

  const handleWorkspaceModalClose = useCallback(() => {
    setWorkspaceModalShown(false);
  }, []);

  const handleWorkspaceModalOpen = useCallback(() => setWorkspaceModalShown(true), []);

  const handleNavigateToSettings = useCallback(() => {
    navigate(`/workspace/${personalWorkspace?.id}/account`);
  }, [personalWorkspace?.id, navigate]);

  const { data: projectData } = useGetProjectQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

  useEffect(() => {
    if (projectId) {
      const project = projectData?.node?.__typename === "Project" ? projectData.node : undefined;
      if (project) {
        setCurrentProject({
          id: project.id,
          name: project.name,
          description: project.description,
          scope: convertScope(project.publication?.scope),
        });
      }
    } else {
      setCurrentProject();
    }
  }, [projectId, projectData?.node, setCurrentProject]);

  return {
    username,
    personalWorkspace,
    workspaces,
    currentWorkspace,
    workspaceModalShown,
    currentProject,
    selectedKey,
    secondaryRoute,
    collapsed,
    handleCollapse,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    handleWorkspaceCreate,
    handleNavigateToSettings,
  };
};

const convertScope = (scope?: ProjectPublicationScope): PublicScope | undefined => {
  switch (scope) {
    case "PUBLIC":
      return "public";
    case "PRIVATE":
      return "private";
  }
  return "private";
};
