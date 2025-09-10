import { useCallback, useState, useMemo, useEffect, ChangeEvent } from "react";
import { useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { UpdateProjectInput } from "@reearth-cms/components/molecules/Workspace/types";
import {
  Role as GQLRole,
  ProjectAccessibility as GQLProjectAccessibility,
} from "@reearth-cms/gql/__generated__/graphql.generated";
import { useT } from "@reearth-cms/i18n";
import { useProject, useUserRights } from "@reearth-cms/state";
import { UpdateProjectDocument } from "@reearth-cms/gql/__generated__/project.generated";
import { useMutation } from "@apollo/client/react";

export default () => {
  const t = useT();
  const { projectId } = useParams();
  const [currentProject] = useProject();
  const [userRights] = useUserRights();
  const hasUpdateRight = useMemo(() => !!userRights?.project.update, [userRights?.project.update]);
  const [licenseEditMode, setLicenseEditMode] = useState(false);
  const [licenseValue, setLicenseValue] = useState("");

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
    if (currentProject?.license) {
      setLicenseValue(currentProject.license);
    }
  }, [currentProject?.license]);

  const handleLicenseSave = useCallback(async () => {
    if (!projectId) return;
    setLicenseEditMode(false);
    await handleProjectUpdate({
      projectId: projectId,
      license: licenseValue,
    });
  }, [handleProjectUpdate, projectId, licenseValue]);

  const handleLicenseEdit = useCallback(() => {
    setLicenseEditMode(true);
  }, []);

  const handleLicenseMarkdownChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setLicenseValue(e.target.value);
  }, []);

  const handleChooseLicenseTemplate = useCallback((value: string) => {
    setLicenseValue(value);
  }, []);

  return {
    licenseValue,
    projectLicense: currentProject?.license,
    licenseEditMode,
    hasUpdateRight,
    handleProjectUpdate,
    handleLicenseSave,
    handleLicenseEdit,
    handleLicenseMarkdownChange,
    handleChooseLicenseTemplate,
  };
};
