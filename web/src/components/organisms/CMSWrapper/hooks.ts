import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

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
import { useMutation, useQuery } from "@apollo/client/react";
import { GetMeDocument } from "@reearth-cms/gql/__generated__/user.generated";
import { CreateWorkspaceDocument } from "@reearth-cms/gql/__generated__/workspace.generated";
import { GetProjectDocument } from "@reearth-cms/gql/__generated__/project.generated";

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

  const { data, refetch } = useQuery(GetMeDocument);

  const [, secondaryRoute, subRoute] = useMemo(() => splitPathname(pathname), [pathname]);

  const username = useMemo(() => data?.me?.name || "", [data?.me?.name]);

  setCurrentUserId(data?.me?.id);

  const handleCollapse = useCallback((collapse: boolean) => {
    setCollapsed(collapse);
  }, []);

  const workspaces = data?.me?.workspaces?.map(workspace =>
    fromGraphQLWorkspace(workspace as GQLWorkspace),
  );
  const workspace = workspaces?.find(workspace => workspace.id === workspaceId);
  const personalWorkspace = useMemo(() => {
    const foundWorkspace = workspaces?.find(
      workspace => workspace.id === data?.me?.myWorkspace?.id,
    );
    return foundWorkspace
      ? {
          id: foundWorkspace.id,
          name: foundWorkspace.name,
          alias: foundWorkspace.alias,
          members: foundWorkspace.members?.map(member =>
            fromGraphQLMember(member as WorkspaceMember),
          ),
        }
      : undefined;
  }, [data?.me?.myWorkspace?.id, workspaces]);
  const personal = workspaceId === data?.me?.myWorkspace?.id;

  useEffect(() => {
    if (currentWorkspace || workspaceId || !data) return;
    setCurrentWorkspace(personalWorkspace ?? undefined);
    setCurrentWorkspaceId(personalWorkspace?.id);
    navigate(`/workspace/${data.me?.myWorkspace?.id}`);
  }, [
    data,
    navigate,
    setCurrentWorkspace,
    setCurrentWorkspaceId,
    currentWorkspace,
    workspaceId,
    personalWorkspace,
  ]);

  useEffect(() => {
    if (workspace?.id && workspace.id !== currentWorkspace?.id) {
      setCurrentWorkspace({
        personal,
        ...workspace,
      });
      setCurrentWorkspaceId(workspace.id);
    }
  }, [currentWorkspace, workspace, personal, setCurrentWorkspace, setCurrentWorkspaceId]);

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
    [createWorkspaceMutation, setCurrentWorkspace, refetch, navigate, t],
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

  const { data: projectData } = useQuery(GetProjectDocument, {
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

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
