import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { WebhookTrigger } from "@reearth-cms/components/molecules/MyIntegrations/types";
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
import { useWorkspace } from "@reearth-cms/state";

export default () => {
  const { workspaceId, integrationId } = useParams();
  const navigate = useNavigate();
  const { integrations } = integrationHooks();
  const t = useT();
  const [webhookId, setwebhookId] = useState<string>();
  const [currentWorkspace] = useWorkspace();

  const selectedIntegration = useMemo(
    () => integrations?.find(integration => integration.id === integrationId),
    [integrations, integrationId],
  );

  const webhookInitialValues = useMemo(() => {
    if (!selectedIntegration?.config.webhooks || !webhookId) return;
    const selectedWebhook = selectedIntegration.config.webhooks.find(
      webhook => webhook.id === webhookId,
    );
    if (!selectedWebhook) return;
    const trigger: string[] = [];
    Object.entries(selectedWebhook?.trigger).forEach(([key, value]) => value && trigger.push(key));
    return { ...selectedWebhook, trigger };
  }, [selectedIntegration, webhookId]);

  const [updateIntegrationMutation, { loading: updateIntegrationLoading }] =
    useUpdateIntegrationMutation();

  const handleIntegrationUpdate = useCallback(
    async (data: { name: string; description: string; logoUrl: string }) => {
      if (!integrationId) return;
      const result = await updateIntegrationMutation({
        variables: {
          integrationId,
          name: data.name,
          description: data.description,
          logoUrl: data.logoUrl,
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
      navigate(`/workspace/${currentWorkspace?.id}/myIntegrations`);
    }
  }, [currentWorkspace, integrationId, deleteIntegrationMutation, navigate, t]);

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
    async (data: {
      name: string;
      url: string;
      active: boolean;
      trigger: WebhookTrigger;
      secret: string;
    }) => {
      if (!integrationId) return;
      const webhook = await createNewWebhook({
        variables: {
          integrationId,
          name: data.name,
          url: data.url,
          active: data.active,
          trigger: data.trigger,
          secret: data.secret,
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
          webhookId: webhookId,
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
    async (data: {
      webhookId: string;
      name: string;
      url: string;
      active: boolean;
      trigger: WebhookTrigger;
      secret?: string;
    }) => {
      if (!integrationId) return;
      const webhook = await updateWebhook({
        variables: {
          integrationId,
          webhookId: data.webhookId,
          name: data.name,
          active: data.active,
          trigger: data.trigger,
          url: data.url,
          secret: data.secret,
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

  const handleWebhookSelect = useCallback(
    (id: string) => {
      setwebhookId(id);
    },
    [setwebhookId],
  );

  const handleIntegrationHeaderBack = useCallback(() => {
    navigate(`/workspace/${workspaceId}/myIntegrations`);
  }, [navigate, workspaceId]);

  return {
    integrations,
    selectedIntegration,
    webhookInitialValues,
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
    handleWebhookSelect,
    handleIntegrationHeaderBack,
  };
};
