import { skipToken, useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router";

import { MenuInfo } from "@reearth-cms/components/atoms/Menu";
import Notification from "@reearth-cms/components/atoms/Notification";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import { fromGraphQLProject } from "@reearth-cms/components/organisms/DataConverters/project";
import {
  fromGraphQLMember,
  fromGraphQLWorkspace,
} from "@reearth-cms/components/organisms/DataConverters/setting";
import {
  WorkspaceMember,
  Workspace as GQLWorkspace,
  Project as GQLProject,
} from "@reearth-cms/gql/__generated__/graphql.generated";
import { GetProjectDocument } from "@reearth-cms/gql/__generated__/project.generated";
import { GetMeDocument } from "@reearth-cms/gql/__generated__/user.generated";
import { CreateWorkspaceDocument } from "@reearth-cms/gql/__generated__/workspace.generated";
import { useT } from "@reearth-cms/i18n";
import {
  useWorkspace,
  useProject,
  useUserId,
  useWorkspaceId,
  useUserRights,
} from "@reearth-cms/state";
import { joinPaths, splitPathname } from "@reearth-cms/utils/path";

import { userRightsGet } from "./utils";

export default () => {
  const t = useT();
  const { projectId, workspaceId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const logoUrl = window.REEARTH_CONFIG?.logoUrl;
  const dashboardBaseUrl = window.REEARTH_CONFIG?.dashboardBaseUrl;

  const [currentUserId, setCurrentUserId] = useUserId();
  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();
  const [, setCurrentWorkspaceId] = useWorkspaceId();
  const [currentProject, setCurrentProject] = useProject();
  const [, setUserRights] = useUserRights();
  const [workspaceModalShown, setWorkspaceModalShown] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { data, refetch } = useQuery(GetMeDocument, { fetchPolicy: "cache-and-network" });

  const [, secondaryRoute, subRoute] = useMemo(() => splitPathname(pathname), [pathname]);

  const {
    username,
    profilePictureUrl,
    workspaces,
    workspace,
    personalWorkspace,
    isCurrentWorkspacePersonal,
  } = useMemo(() => {
    const workspaces = data?.me?.workspaces?.map(workspace =>
      fromGraphQLWorkspace(workspace as GQLWorkspace),
    );
    const findWorkspace = workspaces?.find(workspace => workspace.id === data?.me?.myWorkspace?.id);

    const currentWorkspace = workspaces?.find(workspace => workspace.id === workspaceId);

    return {
      username: data?.me?.name || "",
      profilePictureUrl: data?.me?.profilePictureUrl ?? undefined,
      workspaces,
      workspace: currentWorkspace,
      isCurrentWorkspacePersonal: !!currentWorkspace,
      personalWorkspace: findWorkspace
        ? {
            id: findWorkspace.id,
            name: findWorkspace.name,
            alias: findWorkspace.alias,
            members: findWorkspace.members?.map(member =>
              fromGraphQLMember(member as WorkspaceMember),
            ),
          }
        : undefined,
    };
  }, [data, workspaceId]);

  useEffect(() => {
    setCurrentUserId(data?.me?.id);
  }, [data?.me?.id, setCurrentUserId]);

  const handleCollapse = useCallback((collapse: boolean) => {
    setCollapsed(collapse);
  }, []);

  useEffect(() => {
    if (currentWorkspace || workspaceId || !data) return;
    navigate(`/workspace/${data.me?.myWorkspace?.id}`);
  }, [currentWorkspace, data, navigate, workspaceId]);

  useEffect(() => {
    if (!workspace) return;

    if (isCurrentWorkspacePersonal) {
      setCurrentWorkspace(prev =>
        workspace.id === prev?.id ? prev : { personal: isCurrentWorkspacePersonal, ...workspace },
      );
      setCurrentWorkspaceId(prev =>
        prev === personalWorkspace?.id ? prev : personalWorkspace?.id,
      );
    } else {
      setCurrentWorkspace(prev => (prev?.id === personalWorkspace?.id ? prev : personalWorkspace));
      setCurrentWorkspaceId(prev => (workspace.id === prev ? prev : workspace.id));
    }
  }, [
    isCurrentWorkspacePersonal,
    personalWorkspace,
    setCurrentWorkspace,
    setCurrentWorkspaceId,
    workspace,
  ]);

  useEffect(() => {
    const userInfo = currentWorkspace?.members?.find(
      member => "userId" in member && member.userId === data?.me?.id,
    );
    if (userInfo) {
      setUserRights(userRightsGet((userInfo as UserMember).role));
    }
  }, [currentUserId, currentWorkspace, data?.me?.id, setUserRights]);

  const [createWorkspaceMutation] = useMutation(CreateWorkspaceDocument);
  const handleWorkspaceCreate = useCallback(
    async (data: { name: string }) => {
      const results = await createWorkspaceMutation({
        variables: { name: data.name },
      });
      if (results.data?.createWorkspace) {
        Notification.success({ message: t("Successfully created workspace!") });
        setCurrentWorkspace(
          fromGraphQLWorkspace(results.data.createWorkspace.workspace as GQLWorkspace),
        );
        navigate(`/workspace/${results.data.createWorkspace.workspace.id}`);
      }
      refetch();
    },
    [createWorkspaceMutation, refetch, t, setCurrentWorkspace, navigate],
  );

  const handleWorkspaceModalClose = useCallback(() => {
    setWorkspaceModalShown(false);
  }, []);

  const handleWorkspaceModalOpen = useCallback(() => setWorkspaceModalShown(true), []);

  const handleNavigateToSettings = useCallback(() => {
    if (dashboardBaseUrl) {
      window.open(joinPaths(dashboardBaseUrl, "settings/profile"), "_blank", "noopener,noreferrer");
    } else {
      navigate(`/workspace/${personalWorkspace?.id}/account`);
    }
  }, [dashboardBaseUrl, navigate, personalWorkspace?.id]);

  const { data: projectData } = useQuery(
    GetProjectDocument,
    projectId ? { variables: { projectId } } : skipToken,
  );

  useEffect(() => {
    if (projectId) {
      const project = projectData?.node?.__typename === "Project" ? projectData.node : undefined;
      if (project) {
        setCurrentProject(fromGraphQLProject(project as GQLProject));
      }
    } else {
      setCurrentProject(undefined);
    }
  }, [projectId, projectData?.node, setCurrentProject]);

  const handleProjectMenuNavigate = useCallback(
    (info: MenuInfo) => {
      if (info.key === "home") {
        navigate(`/workspace/${workspaceId}`);
      } else if (info.key === "models") {
        navigate(`/workspace/${workspaceId}/project/${projectId}`);
      } else {
        navigate(`/workspace/${workspaceId}/project/${projectId}/${info.key}`);
      }
    },
    [navigate, workspaceId, projectId],
  );

  const handleWorkspaceMenuNavigate = useCallback(
    (info: MenuInfo) => {
      if (info.key === "home") {
        navigate(`/workspace/${workspaceId}`);
      } else if (info.key === "members" && dashboardBaseUrl) {
        window.open(
          joinPaths(dashboardBaseUrl, currentWorkspace?.alias ?? "", "members"),
          "_blank",
          "noopener,noreferrer",
        );
      } else if (info.key === "workspaceSettings" && dashboardBaseUrl) {
        window.open(
          joinPaths(dashboardBaseUrl, currentWorkspace?.alias ?? "", "settings/general"),
          "_blank",
          "noopener,noreferrer",
        );
      } else if (info.key === "account" && dashboardBaseUrl) {
        window.open(
          joinPaths(dashboardBaseUrl, "settings/profile"),
          "_blank",
          "noopener,noreferrer",
        );
      } else {
        navigate(`/workspace/${workspaceId}/${info.key}`);
      }
    },
    [currentWorkspace?.alias, dashboardBaseUrl, navigate, workspaceId],
  );

  const handleWorkspaceNavigation = useCallback(
    (id: string) => {
      navigate(`/workspace/${id}`);
    },
    [navigate],
  );

  const handleHomeNavigation = useCallback(() => {
    navigate(`/workspace/${currentWorkspace?.id}`);
  }, [currentWorkspace?.id, navigate]);

  return {
    username,
    profilePictureUrl,
    personalWorkspace,
    workspaces,
    currentWorkspace,
    workspaceModalShown,
    currentProject,
    selectedKey: subRoute,
    secondaryRoute,
    collapsed,
    handleCollapse,
    handleProjectMenuNavigate,
    handleWorkspaceMenuNavigate,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    handleWorkspaceCreate,
    handleNavigateToSettings,
    handleWorkspaceNavigation,
    handleHomeNavigation,
    logoUrl,
  };
};
