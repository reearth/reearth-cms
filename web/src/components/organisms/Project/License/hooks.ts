import { useMutation } from "@apollo/client/react";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { UpdateProjectInput } from "@reearth-cms/components/molecules/Workspace/types";
import {
  ProjectAccessibility as GQLProjectAccessibility,
  Role as GQLRole,
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
  const [licenseEditMode, setLicenseEditMode] = useState(false);
  const [licenseValue, setLicenseValue] = useState("");

  const [updateProjectMutation] = useMutation(UpdateProjectDocument);

  const handleProjectUpdate = useCallback(
    async (data: UpdateProjectInput) => {
      if (!data.projectId) return;
      const Project = await updateProjectMutation({
        variables: {
          accessibility: data.accessibility as GQLProjectAccessibility,
          alias: data.alias,
          description: data.description,
          license: data.license,
          name: data.name,
          projectId: data.projectId,
          readme: data.readme,
          requestRoles: data.requestRoles as GQLRole[],
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
      license: licenseValue,
      projectId: projectId,
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
    handleChooseLicenseTemplate,
    handleLicenseEdit,
    handleLicenseMarkdownChange,
    handleLicenseSave,
    handleProjectUpdate,
    hasUpdateRight,
    licenseEditMode,
    licenseValue,
    projectLicense: currentProject?.license,
  };
};
