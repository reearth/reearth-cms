import { useCallback } from "react";
import { useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import {
  useCreateApiKeyMutation,
  useUpdateApiKeyMutation,
  useRegenerateApiKeyMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject } from "@reearth-cms/state";

export default () => {
  const t = useT();
  const { keyId } = useParams();
  const [currentProject] = useProject();

  const [createAPIKeyMutation] = useCreateApiKeyMutation({ refetchQueries: ["GetProject"] });
  const [updateAPIKeyMutation] = useUpdateApiKeyMutation({ refetchQueries: ["GetProject"] });
  const [regenerateAPIKeyMutation] = useRegenerateApiKeyMutation({
    refetchQueries: ["GetProject"],
  });

  const handleAPIKeyCreate = useCallback(
    async (
      name: string,
      description: string,
      publication: { publicModels: string[]; publicAssets: boolean },
    ) => {
      if (!currentProject?.id) return;
      try {
        await createAPIKeyMutation({
          variables: {
            projectId: currentProject.id,
            name,
            description,
            publication,
          },
        });
        Notification.success({ message: t("API Key created successfully.") });
      } catch {
        Notification.error({ message: t("Failed to create API Key.") });
      }
    },
    [createAPIKeyMutation, currentProject?.id, t],
  );

  const handleAPIKeyUpdate = useCallback(
    async (
      id: string,
      name: string,
      description: string,
      publication: { publicModels: string[]; publicAssets: boolean },
    ) => {
      if (!currentProject?.id) return;
      try {
        await updateAPIKeyMutation({
          variables: {
            id,
            projectId: currentProject.id,
            name,
            description,
            publication,
          },
        });
        Notification.success({ message: t("API Key updated successfully.") });
      } catch {
        Notification.error({ message: t("Failed to update API Key.") });
      }
    },
    [updateAPIKeyMutation, currentProject?.id, t],
  );

  const handleAPIKeyRegenerate = useCallback(
    async (id: string) => {
      if (!currentProject?.id) return;
      try {
        await regenerateAPIKeyMutation({
          variables: {
            projectId: currentProject.id,
            id,
          },
        });
        Notification.success({ message: t("API Key re-generated successfully.") });
      } catch {
        Notification.error({ message: t("Failed to re-generate API Key.") });
      }
    },
    [regenerateAPIKeyMutation, currentProject?.id, t],
  );

  return {
    keyId,
    currentProject,
    handleAPIKeyCreate,
    handleAPIKeyUpdate,
    handleAPIKeyRegenerate,
  };
};
