import { useCallback, useMemo } from "react";

import { Integration, WebhookTrigger } from "@reearth-cms/components/molecules/MyIntegration/types";
import {
  useCreateWebhookMutation,
  useGetMeQuery,
  useUpdateIntegrationMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
} from "@reearth-cms/gql/graphql-client-api";

type Params = {
  integrationId?: string;
  webhookId?: string;
};

export default ({ integrationId, webhookId }: Params) => {
  const { data } = useGetMeQuery();

  const integrations = useMemo(() => {
    return (data?.me?.integrations ?? [])
      .map<Integration | undefined>(integration =>
        integration
          ? {
              id: integration.id,
              name: integration.name,
              description: integration.description,
              logoUrl: integration.logoUrl,
              developerId: integration.developerId,
              iType: integration.iType,
              config: {
                token: integration.config?.token,
                webhooks: integration.config?.webhooks,
              },
            }
          : undefined,
      )
      .filter((integration): integration is Integration => !!integration);
  }, [data?.me?.integrations]);

  const selectedIntegration = useMemo(() => {
    return integrations.find(integration => integration.id === integrationId);
  }, [integrations, integrationId]);

  const webhookInitialValues = useMemo(() => {
    if (!selectedIntegration || !selectedIntegration.config.webhooks || !webhookId) return;
    const initialValues: any = {
      ...selectedIntegration.config.webhooks.find(webhook => webhook.id === webhookId),
      itemTriggers: [],
      assetTriggers: [],
    };
    if (initialValues?.trigger.onItemCreate) {
      initialValues.itemTriggers.push("onItemCreate");
    }
    if (initialValues?.trigger.onItemUpdate) {
      initialValues.itemTriggers.push("onItemUpdate");
    }
    if (initialValues?.trigger.onItemCreate) {
      initialValues.itemTriggers.push("onItemDelete");
    }
    if (initialValues?.trigger.onItemCreate) {
      initialValues.itemTriggers.push("onItemDelete");
    }
    if (initialValues?.trigger.onItemPublish) {
      initialValues.itemTriggers.push("onItemPublish");
    }
    if (initialValues?.trigger.onItemUnPublish) {
      initialValues.itemTriggers.push("onItemUnPublish");
    }

    if (initialValues?.trigger.onAssetDeleted) {
      initialValues.assetTriggers.push("onAssetDeleted");
    }
    if (initialValues?.trigger.onAssetUpload) {
      initialValues.assetTriggers.push("onAssetUpload");
    }
    return initialValues;
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
