import { useCallback, useMemo, useState } from "react";

import { Project } from "@reearth-cms/components/molecules/Workspace/types";
import { useGetProjectsQuery, useCreateProjectMutation } from "@reearth-cms/gql/graphql-client-api";
import { useWorkspace } from "@reearth-cms/state";

export default () => {
  const [currentWorkspace] = useWorkspace();
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
        setProjectModalShown(false);
        return;
      }

      setProjectModalShown(false);
      refetch();
    },
    [createNewProject, workspaceId, refetch],
  );

  const handleProjectModalClose = useCallback(() => {
    setProjectModalShown(false);
  }, []);

  const handleProjectModalOpen = useCallback(() => setProjectModalShown(true), []);

  return {
    projects,
    searchedProjectName,
    currentWorkspace,
    projectModalShown,
    handleProjectSearch,
    handleProjectCreate,
    handleProjectModalOpen,
    handleProjectModalClose,
  };
};
