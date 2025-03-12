import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { FormValues as ProjectFormValues } from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import { FormValues as WorkspaceFormValues } from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import { fromGraphQLProject } from "@reearth-cms/components/organisms/DataConverters/project";
import { fromGraphQLWorkspace } from "@reearth-cms/components/organisms/DataConverters/setting";
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useCreateWorkspaceMutation,
  Workspace as GQLWorkspace,
  useCheckProjectAliasLazyQuery,
  Project as GQLProject,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useWorkspace, useUserRights } from "@reearth-cms/state";

export default () => {
  const t = useT();
  const navigate = useNavigate();
  const coverImageUrl = window.REEARTH_CONFIG?.coverImageUrl;

  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();

  const [searchedProjectName, setSearchedProjectName] = useState<string>("");
  const [userRights] = useUserRights();
  const hasCreateRight = useMemo(() => !!userRights?.project.create, [userRights?.project.create]);

  const workspaceId = currentWorkspace?.id;

  const {
    data,
    loading,
    refetch: projectsRefetch,
  } = useGetProjectsQuery({
    variables: { workspaceId: workspaceId ?? "", pagination: { first: 100 } },
    skip: !workspaceId,
  });

  const allProjects = useMemo(
    () =>
      data?.projects.nodes
        .map(project => (project ? fromGraphQLProject(project as GQLProject) : undefined))
        .filter(project => !!project) ?? [],
    [data?.projects.nodes],
  );

  const projects = useMemo(
    () =>
      searchedProjectName
        ? allProjects.filter(project =>
            project.name.toLocaleLowerCase().includes(searchedProjectName.toLocaleLowerCase()),
          )
        : allProjects,
    [allProjects, searchedProjectName],
  );

  const [createNewProject] = useCreateProjectMutation({
    refetchQueries: ["GetProjects"],
  });

  const handleProjectSearch = useCallback(
    (value: string) => {
      setSearchedProjectName(value);
    },
    [setSearchedProjectName],
  );

  const handleProjectCreate = useCallback(
    async (data: ProjectFormValues) => {
      if (!workspaceId) throw new Error();
      const project = await createNewProject({
        variables: {
          workspaceId,
          name: data.name,
          alias: data.alias,
          description: data.description,
        },
      });
      if (project.errors || !project.data?.createProject) {
        Notification.error({ message: t("Failed to create project.") });
        throw new Error();
      }
      Notification.success({ message: t("Successfully created project!") });
      projectsRefetch();
    },
    [createNewProject, workspaceId, projectsRefetch, t],
  );

  const handleProjectNavigation = useCallback(
    (projectId: string) => {
      if (!workspaceId || !projectId) return;
      navigate(`/workspace/${workspaceId}/project/${projectId}`);
    },
    [workspaceId, navigate],
  );

  const [createWorkspaceMutation] = useCreateWorkspaceMutation({
    refetchQueries: ["GetMe"],
  });
  const handleWorkspaceCreate = useCallback(
    async (data: WorkspaceFormValues) => {
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
      projectsRefetch();
    },
    [createWorkspaceMutation, setCurrentWorkspace, projectsRefetch, navigate, t],
  );

  const [CheckProjectAlias] = useCheckProjectAliasLazyQuery({
    fetchPolicy: "no-cache",
  });

  const handleProjectAliasCheck = useCallback(
    async (alias: string) => {
      if (!alias) return false;

      const response = await CheckProjectAlias({ variables: { alias } });
      return response.data ? response.data.checkProjectAlias.available : false;
    },
    [CheckProjectAlias],
  );

  return {
    coverImageUrl,
    projects,
    loading,
    hasCreateRight,
    handleProjectSearch,
    handleProjectCreate,
    handleProjectNavigation,
    handleWorkspaceCreate,
    handleProjectAliasCheck,
    projectsRefetch,
  };
};
