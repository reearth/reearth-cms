import { useMutation } from "@apollo/client/react";
import { useCallback, useState, useMemo, useEffect, ChangeEvent } from "react";
import { useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { UpdateProjectInput } from "@reearth-cms/components/molecules/Workspace/types";
import {
  Role as GQLRole,
  ProjectAccessibility as GQLProjectAccessibility,
} from "@reearth-cms/gql/__generated__/graphql.generated";
import { UpdateProjectDocument } from "@reearth-cms/gql/__generated__/project.generated";
import { useT } from "@reearth-cms/i18n";
import { useProject, useUserRights } from "@reearth-cms/state";

export default () => {
  const t = useT();
  const { projectId } = useParams();
  const [currentProject] = useProject();
  const [userRights] = useUserRights();
  const hasUpdateRight = useMemo(() => !!userRights?.project.update, [userRights?.project.update]);
  const [readmeEditMode, setReadmeEditMode] = useState(false);
  const [readmeValue, setReadmeValue] = useState("");

  const [updateProjectMutation] = useMutation(UpdateProjectDocument);

  const handleProjectUpdate = useCallback(
    async (data: UpdateProjectInput) => {
      if (!data.projectId) return;
      const Project = await updateProjectMutation({
        variables: {
          projectId: data.projectId,
          name: data.name,
          description: data.description,
          readme: data.readme,
          license: data.license,
          alias: data.alias,
          requestRoles: data.requestRoles as GQLRole[],
          accessibility: data.accessibility as GQLProjectAccessibility,
        },
      });
      if (Project.error || !Project.data?.updateProject) {
        Notification.error({ message: t("Failed to update Project.") });
        return;
      }
      Notification.success({ message: t("Successfully updated Project!") });
    },
    [updateProjectMutation, t],
  );

  useEffect(() => {
    if (currentProject?.readme) {
      setReadmeValue(currentProject.readme);
    }
  }, [currentProject?.readme]);

  const handleReadmeSave = useCallback(async () => {
    if (!projectId) return;
    setReadmeEditMode(false);
    await handleProjectUpdate({
      projectId: projectId,
      readme: readmeValue,
    });
  }, [handleProjectUpdate, projectId, readmeValue]);

  const handleReadmeEdit = useCallback(() => {
    setReadmeEditMode(true);
  }, []);

  const handleReadmeMarkdownChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setReadmeValue(e.target.value);
  }, []);

  return {
    readmeValue,
    projectReadme: currentProject?.readme,
    readmeEditMode,
    hasUpdateRight,
    handleProjectUpdate,
    handleReadmeSave,
    handleReadmeEdit,
    handleReadmeMarkdownChange,
  };
};
