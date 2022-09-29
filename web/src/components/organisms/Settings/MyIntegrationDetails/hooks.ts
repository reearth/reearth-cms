import { useCallback, useMemo } from "react";

import { WebhookTrigger } from "@reearth-cms/components/molecules/MyIntegrations/types";
import integrationHook from "@reearth-cms/components/organisms/Settings/MyIntegrations/hooks";
import {
  useCreateWebhookMutation,
  useUpdateIntegrationMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
} from "@reearth-cms/gql/graphql-client-api";

type Params = {
  integrationId?: string;
  webhookId?: string;
};

export default ({ integrationId, webhookId }: Params) => {
  const { integrations } = integrationHook();

  const selectedIntegration = useMemo(() => {
    return integrations.find(integration => integration.id === integrationId);
  }, [integrations, integrationId]);

  const webhookInitialValues = useMemo(() => {
    if (!selectedIntegration || !selectedIntegration.config.webhooks || !webhookId) return;
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
    async (data: { name: string; url: string; active: boolean; trigger: WebhookTrigger }) => {
      if (!integrationId) return;
      const webhook = await createNewWebhook({
        variables: {
          integrationId,
          name: data.name,
          url: data.url,
          active: data.active,
          trigger: data.trigger,
        },
      });
      if (webhook.errors || !webhook.data?.createWebhook) {
        return;
      }
    },
    [createNewWebhook, integrationId],
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
        return;
      }
    },
    [deleteWebhook, integrationId],
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
        },
      });
      if (webhook.errors || !webhook.data?.updateWebhook) {
        return;
      }
    },
    [updateWebhook, integrationId],
  );

  return {
    integrations,
    selectedIntegration,
    webhookInitialValues,
    handleIntegrationUpdate,
    handleWebhookCreate,
    handleWebhookDelete,
    handleWebhookUpdate,
  };
};
