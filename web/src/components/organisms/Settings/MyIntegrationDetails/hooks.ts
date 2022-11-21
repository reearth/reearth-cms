import { useCallback, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { WebhookTrigger } from "@reearth-cms/components/molecules/MyIntegrations/types";
import integrationHooks from "@reearth-cms/components/organisms/Settings/MyIntegrations/hooks";
import {
  useCreateWebhookMutation,
  useUpdateIntegrationMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

type Params = {
  integrationId?: string;
};

export default ({ integrationId }: Params) => {
  const { integrations } = integrationHooks();
  const t = useT();
  const [webhookId, setwebhookId] = useState<string>();

  const selectedIntegration = useMemo(() => {
    return integrations?.find(integration => integration.id === integrationId);
  }, [integrations, integrationId]);

  const webhookInitialValues = useMemo(() => {
    if (!selectedIntegration || !selectedIntegration.config.webhooks || !webhookId) return {};
    const selectedWebhook = selectedIntegration.config.webhooks.find(
      webhook => webhook.id === webhookId,
    );
    if (!selectedWebhook) return {};
    const trigger: string[] = [];
    Object.entries(selectedWebhook?.trigger).forEach(([key, value]) => value && trigger.push(key));
    return { ...selectedWebhook, trigger };
  }, [selectedIntegration, webhookId]);

  const [updateIntegrationMutation] = useUpdateIntegrationMutation();

  const handleIntegrationUpdate = useCallback(
    (data: { name: string; description: string; logoUrl: string }) => {
      if (!integrationId) return;
      updateIntegrationMutation({
        variables: {
          integrationId,
          name: data.name,
          description: data.description,
          logoUrl: data.logoUrl,
        },
      });
    },
    [integrationId, updateIntegrationMutation],
  );

  const [createNewWebhook] = useCreateWebhookMutation({
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

  const [updateWebhook] = useUpdateWebhookMutation({
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

  return {
    integrations,
    selectedIntegration,
    webhookInitialValues,
    handleIntegrationUpdate,
    handleWebhookCreate,
    handleWebhookDelete,
    handleWebhookUpdate,
    handleWebhookSelect,
  };
};
