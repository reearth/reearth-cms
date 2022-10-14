import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Project } from "@reearth-cms/components/molecules/Dashboard/types";
import { useGetProjectsQuery, useCreateProjectMutation } from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject, useWorkspace } from "@reearth-cms/state";

export default () => {
  const t = useT();
  const navigate = useNavigate();

  const [currentWorkspace] = useWorkspace();
  const [, setCurrentProject] = useProject();
  const [projectModalShown, setProjectModalShown] = useState(false);
  const [searchedProjectName, setSearchedProjectName] = useState<string>("");

  const workspaceId = currentWorkspace?.id;

  const { data, refetch } = useGetProjectsQuery({
    variables: { workspaceId: workspaceId ?? "", first: 100 },
    skip: !workspaceId,
  });

  const projects = useMemo(() => {
    return (data?.projects.nodes ?? [])
      .map<Project | undefined>(project =>
        project
          ? {
              id: project.id,
              description: project.description,
              name: project.name,
            }
          : undefined,
      )
      .filter(
        (project): project is Project =>
          !!project &&
          (!searchedProjectName ||
            (!!searchedProjectName &&
              project.name.toLocaleLowerCase().includes(searchedProjectName.toLocaleLowerCase()))),
      );
  }, [data?.projects.nodes, searchedProjectName]);

  const [createNewProject] = useCreateProjectMutation({
    refetchQueries: ["GetProjects"],
  });

  const handleProjectSearch = useCallback(
    (value: string) => {
      setSearchedProjectName?.(value);
    },
    [setSearchedProjectName],
  );

  const handleProjectCreate = useCallback(
    async (data: { name: string; description: string }) => {
      if (!workspaceId) return;
      const project = await createNewProject({
        variables: {
          workspaceId,
          name: data.name,
          description: data.description,
        },
      });
      if (project.errors || !project.data?.createProject) {
        Notification.error({ message: t("Failed to create project.") });
        return;
      }
      Notification.success({ message: t("Successfully created project!") });
      setProjectModalShown(false);
      refetch();
    },
    [createNewProject, workspaceId, refetch, t],
  );

  const handleProjectModalClose = useCallback(() => {
    setProjectModalShown(false);
  }, []);

  const handleProjectModalOpen = useCallback(() => setProjectModalShown(true), []);

  const handleProjectSettingsNavigation = useCallback(
    (project?: Project) => {
      navigate("/workspaces/" + currentWorkspace?.id + "/" + project?.id);
      setCurrentProject(project);
    },
    [currentWorkspace, setCurrentProject, navigate],
  );

  return {
    projects,
    projectModalShown,
    currentWorkspaceId: currentWorkspace?.id,
    setCurrentProject,
    handleProjectSearch,
    handleProjectCreate,
    handleProjectModalOpen,
    handleProjectModalClose,
    handleProjectSettingsNavigation,
  };
};
