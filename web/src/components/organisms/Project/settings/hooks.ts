import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { RequestRoles } from "@reearth-cms/components/molecules/Workspace/types";
import {
  useGetProjectsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  Role as GQLRole,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useWorkspace } from "@reearth-cms/state";

type Params = {
  projectId?: string;
};

export default ({ projectId }: Params) => {
  const navigate = useNavigate();
  const [currentWorkspace] = useWorkspace();
  const t = useT();

  const workspaceId = currentWorkspace?.id;

  const { data, loading } = useGetProjectsQuery({
    variables: { workspaceId: workspaceId ?? "", pagination: { first: 100 } },
    skip: !workspaceId,
  });

  const rawProject = useMemo(
    () => data?.projects.nodes.find((p: any) => p?.id === projectId),
    [data, projectId],
  );
  const project = useMemo(
    () =>
      rawProject?.id
        ? {
            id: rawProject.id,
            name: rawProject.name,
            description: rawProject.description,
            alias: rawProject.alias,
            requestRoles: rawProject.requestRoles?.map(role => role.toLowerCase() as RequestRoles),
          }
        : undefined,
    [rawProject],
  );

  const [updateProjectMutation] = useUpdateProjectMutation({
    refetchQueries: ["GetProject"],
  });
  const [deleteProjectMutation] = useDeleteProjectMutation({
    refetchQueries: ["GetProjects"],
  });

  const handleProjectUpdate = useCallback(
    async (name?: string, description?: string) => {
      if (!projectId || !name) return;
      const project = await updateProjectMutation({
        variables: {
          projectId,
          name: name,
          description: description,
        },
      });
      if (project.errors || !project.data?.updateProject) {
        Notification.error({ message: t("Failed to update project.") });
        return;
      }
      Notification.success({ message: t("Successfully updated project!") });
    },
    [projectId, updateProjectMutation, t],
  );

  const handleProjectRequestRolesUpdate = useCallback(
    async (requestRoles?: RequestRoles[] | null | undefined) => {
      if (!projectId || !requestRoles) return;
      const project = await updateProjectMutation({
        variables: {
          projectId,
          requestRoles: requestRoles.map(role => role.toUpperCase()) as GQLRole[],
        },
      });
      if (project.errors || !project.data?.updateProject) {
        Notification.error({ message: t("Failed to update request roles.") });
        return;
      }
      Notification.success({ message: t("Successfully updated request roles!") });
    },
    [projectId, updateProjectMutation, t],
  );

  const handleProjectDelete = useCallback(async () => {
    if (!projectId) return;
    const results = await deleteProjectMutation({ variables: { projectId } });
    if (results.errors) {
      Notification.error({ message: t("Failed to delete project.") });
    } else {
      Notification.success({ message: t("Successfully deleted project!") });
      navigate(`/workspace/${workspaceId}`);
    }
  }, [projectId, deleteProjectMutation, navigate, workspaceId, t]);

  const [assetModalOpened, setOpenAssets] = useState(false);

  const toggleAssetModal = useCallback(
    (open?: boolean) => {
      if (!open) {
        setOpenAssets(!assetModalOpened);
      } else {
        setOpenAssets(open);
      }
    },
    [assetModalOpened, setOpenAssets],
  );

  return {
    project,
    loading,
    projectId,
    currentWorkspace,
    handleProjectUpdate,
    handleProjectRequestRolesUpdate,
    handleProjectDelete,
    assetModalOpened,
    toggleAssetModal,
  };
};
