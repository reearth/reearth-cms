import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import { MenuInfo } from "@reearth-cms/components/atoms/Menu";
import Notification from "@reearth-cms/components/atoms/Notification";
import { PublicScope } from "@reearth-cms/components/molecules/Accessibility";
import { Role } from "@reearth-cms/components/molecules/Workspace/types";
import {
  useCreateWorkspaceMutation,
  useGetMeQuery,
  useGetProjectQuery,
  ProjectPublicationScope,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useWorkspace, useProject, useUserId, useWorkspaceId } from "@reearth-cms/state";
import { splitPathname } from "@reearth-cms/utils/path";

export default () => {
  const t = useT();
  const { projectId, workspaceId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const logoUrl = window.REEARTH_CONFIG?.logoUrl;

  const [, setCurrentUserId] = useUserId();
  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();
  const [, setCurrentWorkspaceId] = useWorkspaceId();
  const [currentProject, setCurrentProject] = useProject();
  const [workspaceModalShown, setWorkspaceModalShown] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { data, refetch } = useGetMeQuery();

  const [, secondaryRoute, subRoute] = useMemo(() => splitPathname(pathname), [pathname]);

  const selectedKey = useMemo(() => subRoute ?? "home", [subRoute]);

  const username = useMemo(() => data?.me?.name || "", [data?.me?.name]);

  setCurrentUserId(data?.me?.id);

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
    setCurrentWorkspaceId(data.me?.myWorkspace?.id);
    navigate(`/workspace/${data.me?.myWorkspace?.id}`);
  }, [data, navigate, setCurrentWorkspace, setCurrentWorkspaceId, currentWorkspace, workspaceId]);

  useEffect(() => {
    if (workspace?.id && workspace.id !== currentWorkspace?.id) {
      setCurrentWorkspace({
        personal,
        ...workspace,
      });
      setCurrentWorkspaceId(workspace.id);
    }
  }, [currentWorkspace, workspace, personal, setCurrentWorkspace, setCurrentWorkspaceId]);

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
          alias: project.alias,
          assetPublic: project.publication?.assetPublic,
          requestRoles: project.requestRoles as Role[],
        });
      }
    } else {
      setCurrentProject(undefined);
    }
  }, [projectId, projectData?.node, setCurrentProject]);

  const [selectedProjectMenuKeys, changeProjectMenuSelected] = useState([selectedKey ?? "home"]);

  useEffect(() => {
    if (selectedKey && selectedKey !== selectedProjectMenuKeys[0]) {
      changeProjectMenuSelected([selectedKey]);
    }
  }, [selectedProjectMenuKeys, selectedKey]);

  const handleProjectMenuNavigate = useCallback(
    (info: MenuInfo) => {
      changeProjectMenuSelected([info.key]);
      if (info.key === "schema") {
        navigate(`/workspace/${workspaceId}/project/${projectId}/schema`);
      } else if (info.key === "content") {
        navigate(`/workspace/${workspaceId}/project/${projectId}/content`);
      } else if (info.key === "asset") {
        navigate(`/workspace/${workspaceId}/project/${projectId}/asset`);
      } else if (info.key === "request") {
        navigate(`/workspace/${workspaceId}/project/${projectId}/request`);
      } else if (info.key === "accessibility") {
        navigate(`/workspace/${workspaceId}/project/${projectId}/accessibility`);
      } else if (info.key === "settings") {
        navigate(`/workspace/${workspaceId}/project/${projectId}/settings`);
      } else {
        navigate(`/workspace/${workspaceId}/project/${projectId}`);
      }
    },
    [navigate, workspaceId, projectId],
  );

  const [selectedWorkspaceMenuKeys, changeSelectedWorkspaceMenuKeys] = useState([
    selectedKey ?? "home",
  ]);

  useEffect(() => {
    if (selectedKey) {
      changeSelectedWorkspaceMenuKeys([selectedKey]);
    }
  }, [selectedKey]);

  const handleWorkspaceMenuNavigate = useCallback(
    (info: MenuInfo) => {
      changeSelectedWorkspaceMenuKeys([info.key]);
      if (info.key === "home") {
        navigate(`/workspace/${workspaceId}`);
      } else {
        navigate(`/workspace/${workspaceId}/${info.key}`);
      }
    },
    [navigate, workspaceId],
  );

  return {
    username,
    personalWorkspace,
    workspaces,
    currentWorkspace,
    workspaceModalShown,
    currentProject,
    selectedProjectMenuKeys,
    selectedWorkspaceMenuKeys,
    secondaryRoute,
    collapsed,
    handleCollapse,
    handleProjectMenuNavigate,
    handleWorkspaceMenuNavigate,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    handleWorkspaceCreate,
    handleNavigateToSettings,
    logoUrl,
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
