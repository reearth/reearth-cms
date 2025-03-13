import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import {
  IntegrationInfo,
  Webhook,
  NewWebhook,
} from "@reearth-cms/components/molecules/MyIntegrations/types";
import integrationHooks from "@reearth-cms/components/organisms/Settings/MyIntegrations/hooks";
import {
  useCreateWebhookMutation,
  useUpdateIntegrationMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useDeleteIntegrationMutation,
  useRegenerateIntegrationTokenMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

export default () => {
  const { workspaceId, integrationId } = useParams();
  const navigate = useNavigate();
  const { loading, integrations } = integrationHooks();
  const t = useT();

  const selectedIntegration = useMemo(
    () => integrations?.find(integration => integration.id === integrationId),
    [integrations, integrationId],
  );

  const [updateIntegrationMutation, { loading: updateIntegrationLoading }] =
    useUpdateIntegrationMutation();

  const handleIntegrationUpdate = useCallback(
    async ({ name, description, logoUrl }: IntegrationInfo) => {
      if (!integrationId) return;
      const result = await updateIntegrationMutation({
        variables: {
          integrationId,
          name,
          description,
          logoUrl,
        },
      });
      if (result.errors) {
        Notification.error({ message: t("Failed to update integration.") });
      } else {
        Notification.success({ message: t("Successfully updated integration!") });
      }
    },
    [integrationId, t, updateIntegrationMutation],
  );

  const [deleteIntegrationMutation] = useDeleteIntegrationMutation({
    refetchQueries: ["GetMe"],
  });

  const handleIntegrationDelete = useCallback(async () => {
    if (!integrationId) return;
    const results = await deleteIntegrationMutation({ variables: { integrationId } });
    if (results.errors) {
      Notification.error({ message: t("Failed to delete integration.") });
    } else {
      Notification.success({ message: t("Successfully deleted integration!") });
      navigate(`/workspace/${workspaceId}/myIntegrations`);
    }
  }, [integrationId, deleteIntegrationMutation, t, navigate, workspaceId]);

  const [regenerateTokenMutation, { loading: regenerateLoading }] =
    useRegenerateIntegrationTokenMutation({
      refetchQueries: ["GetMe"],
    });

  const handleRegenerateToken = useCallback(async () => {
    if (!integrationId) return;
    const result = await regenerateTokenMutation({
      variables: {
        integrationId,
      },
    });
    if (result.errors) {
      Notification.error({
        message: t("The attempt to re-generate the integration token has failed."),
      });
    } else {
      Notification.success({
        message: t("Integration Token has been re-generated!"),
      });
    }
  }, [integrationId, regenerateTokenMutation, t]);

  const [createNewWebhook, { loading: createWebhookLoading }] = useCreateWebhookMutation({
    refetchQueries: ["GetMe"],
  });

  const handleWebhookCreate = useCallback(
    async ({ name, url, active, trigger, secret }: NewWebhook) => {
      if (!integrationId) return;
      const webhook = await createNewWebhook({
        variables: {
          integrationId,
          name,
          url,
          active,
          trigger,
          secret,
        },
      });
      if (webhook.errors || !webhook.data?.createWebhook) {
        Notification.error({ message: t("Failed to create webhook.") });
        return;
      }
      Notification.success({ message: t("Successfully created webhook!") });
    },
    [createNewWebhook, integrationId, t],
  );

  const [deleteWebhook] = useDeleteWebhookMutation({
    refetchQueries: ["GetMe"],
  });

  const handleWebhookDelete = useCallback(
    async (webhookId: string) => {
      if (!integrationId) return;
      const webhook = await deleteWebhook({
        variables: {
          integrationId,
          webhookId,
        },
      });
      if (webhook.errors || !webhook.data?.deleteWebhook) {
        Notification.error({ message: t("Failed to delete webhook.") });
        return;
      }
      Notification.success({ message: t("Successfully deleted webhook!") });
    },
    [deleteWebhook, integrationId, t],
  );

  const [updateWebhook, { loading: updateWebhookLoading }] = useUpdateWebhookMutation({
    refetchQueries: ["GetMe"],
  });

  const handleWebhookUpdate = useCallback(
    async ({ id, name, url, active, trigger, secret }: Webhook) => {
      if (!integrationId) return;
      const webhook = await updateWebhook({
        variables: {
          integrationId,
          webhookId: id,
          name,
          active,
          trigger,
          url,
          secret,
        },
      });
      if (webhook.errors || !webhook.data?.updateWebhook) {
        Notification.error({ message: t("Failed to update webhook.") });
        return;
      }
      Notification.success({ message: t("Successfully updated webhook!") });
    },
    [updateWebhook, integrationId, t],
  );

  const handleIntegrationHeaderBack = useCallback(() => {
    navigate(`/workspace/${workspaceId}/myIntegrations`);
  }, [navigate, workspaceId]);

  return {
    loading,
    selectedIntegration,
    updateIntegrationLoading,
    regenerateLoading,
    createWebhookLoading,
    updateWebhookLoading,
    handleIntegrationUpdate,
    handleIntegrationDelete,
    handleRegenerateToken,
    handleWebhookCreate,
    handleWebhookDelete,
    handleWebhookUpdate,
    handleIntegrationHeaderBack,
  };
};
