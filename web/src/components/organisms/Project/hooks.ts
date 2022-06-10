import {
  useGetProjectsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useWorkspace } from "@reearth-cms/state";
import { useCallback, useMemo, useState } from "react";

type Params = {
  projectId?: string;
};

export default ({ projectId }: Params) => {
  const [currentWorkspace] = useWorkspace();

  const workspaceId = currentWorkspace?.id;

  const { data } = useGetProjectsQuery({
    variables: { workspaceId: workspaceId ?? "", first: 100 },
    skip: !workspaceId,
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

  const updateProject = useCallback(
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

  const deleteProject = useCallback(async () => {
    if (!projectId) return;
    const results = await deleteProjectMutation({ variables: { projectId } });
    if (results.errors) {
      console.log("errors");
    } else {
      console.log("succeed");
    }
  }, [projectId, deleteProjectMutation]);

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
    projectId,
    currentWorkspace,
    updateProject,
    deleteProject,
    assetModalOpened,
    toggleAssetModal,
  };
};
