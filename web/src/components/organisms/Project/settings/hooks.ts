import { Project } from "@reearth-cms/components/molecules/Dashboard/types";
import {
  useGetProjectsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useCreateProjectMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useWorkspace } from "@reearth-cms/state";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Params = {
  projectId?: string;
};

export default ({ projectId }: Params) => {
  const navigate = useNavigate();
  const [currentWorkspace] = useWorkspace();

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

  const rawProject = useMemo(
    () => data?.projects.nodes.find((p: any) => p?.id === projectId),
    [data, projectId]
  );
  const project = useMemo(
    () =>
      rawProject?.id
        ? {
            id: rawProject.id,
            name: rawProject.name,
            description: rawProject.description,
            alias: rawProject.alias,
          }
        : undefined,
    [rawProject]
  );

  const [updateProjectMutation] = useUpdateProjectMutation();
  const [deleteProjectMutation] = useDeleteProjectMutation({
    refetchQueries: ["GetProjects"],
  });

  const handleProjectUpdate = useCallback(
    (data: { name?: string; description: string }) => {
      if (!projectId || !data.name) return;
      updateProjectMutation({
        variables: {
          projectId,
          name: data.name,
          description: data.description,
        },
      });
    },
    [projectId, updateProjectMutation]
  );

  const handleProjectDelete = useCallback(async () => {
    if (!projectId) return;
    const results = await deleteProjectMutation({ variables: { projectId } });
    if (results.errors) {
      console.log("errors");
    } else {
      console.log("succeed");
      navigate(`/dashboard/${workspaceId}`);
    }
  }, [projectId, deleteProjectMutation, navigate, workspaceId]);

  const [assetModalOpened, setOpenAssets] = useState(false);

  const toggleAssetModal = useCallback(
    (open?: boolean) => {
      if (!open) {
        setOpenAssets(!assetModalOpened);
      } else {
        setOpenAssets(open);
      }
    },
    [assetModalOpened, setOpenAssets]
  );

  return {
    project,
    projects,
    projectId,
    currentWorkspace,
    handleProjectUpdate,
    handleProjectDelete,
    assetModalOpened,
    toggleAssetModal,
  };
};
