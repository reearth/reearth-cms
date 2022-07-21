import { Project } from "@reearth-cms/components/molecules/Dashboard/types";
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useWorkspace } from "@reearth-cms/state";
import { useCallback, useMemo, useState } from "react";

export default () => {
  const [currentWorkspace] = useWorkspace();
  const [projectModalShown, setProjectModalShown] = useState(false);

  const workspaceId = currentWorkspace?.id;

  const { data, refetch } = useGetProjectsQuery({
    variables: { workspaceId: workspaceId ?? "", first: 100 },
    skip: !workspaceId,
  });

  const projects = useMemo(() => {
    return (data?.projects.nodes ?? [])
      .map<Project | undefined>((project) =>
        project
          ? {
              id: project.id,
              description: project.description,
              name: project.name,
            }
          : undefined
      )
      .filter((project): project is Project => !!project);
  }, [data?.projects.nodes]);

  const [createNewProject] = useCreateProjectMutation({
    refetchQueries: ["GetProjects"],
  });

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
    [createNewProject, workspaceId, refetch]
  );

  const handleProjectModalClose = useCallback(
    (r?: boolean) => {
      setProjectModalShown(false);
      if (r) {
        refetch();
      }
    },
    [refetch]
  );

  const handleProjectModalOpen = useCallback(
    () => setProjectModalShown(true),
    []
  );

  return {
    projects,
    currentWorkspace,
    projectModalShown,
    handleProjectCreate,
    handleProjectModalOpen,
    handleProjectModalClose,
  };
};
