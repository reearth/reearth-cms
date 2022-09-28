import { useCallback, useMemo } from "react";

import { Integration, WebhookTrigger } from "@reearth-cms/components/molecules/MyIntegration/types";
import {
  useCreateWebhookMutation,
  useGetMeQuery,
  useUpdateIntegrationMutation,
} from "@reearth-cms/gql/graphql-client-api";

type Params = {
  integrationId?: string;
};

export default ({ integrationId }: Params) => {
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

  return {
    integrations,
    selectedIntegration,
    handleIntegrationUpdate,
    handleWebhookCreate,
  };
};
