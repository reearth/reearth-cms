import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Role } from "@reearth-cms/components/molecules/Member/types";
import useHooks from "@reearth-cms/components/organisms/Workspace/hooks";
import {
  Role as GQLRole,
  ProjectVisibility,
} from "@reearth-cms/gql/__generated__/graphql.generated";
import {
  CheckProjectAliasDocument,
  DeleteProjectDocument,
  UpdateProjectDocument,
} from "@reearth-cms/gql/__generated__/project.generated";
import { useT } from "@reearth-cms/i18n";
import { useProject, useUserRights, useWorkspace } from "@reearth-cms/state";

export default () => {
  const { projectsRefetch } = useHooks();
  const t = useT();
  const navigate = useNavigate();

  const [currentWorkspace] = useWorkspace();
  const workspaceId = useMemo(() => currentWorkspace?.id, [currentWorkspace?.id]);
  const [currentProject] = useProject();
  const projectId = useMemo(() => currentProject?.id, [currentProject?.id]);
  const [userRights] = useUserRights();
  const hasUpdateRight = useMemo(() => !!userRights?.project.update, [userRights?.project.update]);
  const hasDeleteRight = useMemo(() => !!userRights?.project.delete, [userRights?.project.delete]);
  const hasPublishRight = useMemo(
    () => !!userRights?.project.publish,
    [userRights?.project.publish],
  );

  const [updateProjectMutation] = useMutation(UpdateProjectDocument, {
    refetchQueries: ["GetProject"],
  });
  const [deleteProjectMutation] = useMutation(DeleteProjectDocument);

  const handleProjectUpdate = useCallback(
    async (name: string, alias: string, description: string) => {
      if (!projectId || !name) return;
      const result = await updateProjectMutation({
        variables: {
          projectId,
          name,
          alias,
          description,
          requestRoles: currentProject?.requestRoles as GQLRole[],
        },
      });
      if (result.error || !result.data?.updateProject) {
        Notification.error({ message: t("Failed to update project.") });
        return;
      }
      Notification.success({ message: t("Successfully updated project!") });
    },
    [projectId, updateProjectMutation, currentProject?.requestRoles, t],
  );

  const handleProjectRequestRolesUpdate = useCallback(
    async (requestRoles: Role[]) => {
      if (!projectId || !requestRoles) return;
      const project = await updateProjectMutation({
        variables: {
          projectId,
          requestRoles: requestRoles as GQLRole[],
        },
      });
      if (project.error || !project.data?.updateProject) {
        Notification.error({ message: t("Failed to update request roles.") });
        return;
      }
      Notification.success({ message: t("Successfully updated request roles!") });
    },
    [projectId, updateProjectMutation, t],
  );

  const handleProjectDelete = useCallback(async () => {
    if (!projectId) return;
    const results = await deleteProjectMutation({
      variables: { projectId },
      refetchQueries: ["GetProjects"],
    });
    if (results.error) {
      Notification.error({ message: t("Failed to delete project.") });
      return;
    }
    Notification.success({ message: t("Successfully deleted project!") });
    projectsRefetch();
    navigate(`/workspace/${workspaceId}`);
  }, [projectId, deleteProjectMutation, t, projectsRefetch, navigate, workspaceId]);

  const [CheckProjectAlias] = useLazyQuery(CheckProjectAliasDocument, {
    fetchPolicy: "no-cache",
  });

  const handleProjectAliasCheck = useCallback(
    async (alias: string) => {
      if (!alias) return false;

      if (!workspaceId) {
        throw new Error("Workspace ID is required to check project alias");
      }
      const response = await CheckProjectAlias({ variables: { workspaceId, alias } });
      return response.data ? response.data.checkProjectAlias.available : false;
    },
    [CheckProjectAlias, workspaceId],
  );

  const handleProjectVisibilityChange = useCallback(
    async (visibility: string) => {
      if (!projectId || !visibility) return;
      const result = await updateProjectMutation({
        variables: {
          projectId,
          accessibility: {
            visibility:
              visibility === "PUBLIC" ? ProjectVisibility.Public : ProjectVisibility.Private,
          },
        },
      });
      if (result.error || !result.data?.updateProject) {
        Notification.error({ message: t("Failed to update project visibility.") });
        return;
      }
      Notification.success({ message: t("Successfully updated project visibility!") });
    },
    [projectId, t, updateProjectMutation],
  );

  return {
    project: currentProject,
    hasUpdateRight,
    hasDeleteRight,
    hasPublishRight,
    handleProjectUpdate,
    handleProjectRequestRolesUpdate,
    handleProjectDelete,
    handleProjectAliasCheck,
    handleProjectVisibilityChange,
  };
};
