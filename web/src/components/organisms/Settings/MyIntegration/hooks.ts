import { useCallback, useMemo, useState } from "react";

import {
  Integration,
  IntegrationType,
} from "@reearth-cms/components/molecules/MyIntegration/types";
import { useCreateIntegrationMutation, useGetMeQuery } from "@reearth-cms/gql/graphql-client-api";

export default () => {
  const [integrationModalShown, setIntegrationModalShown] = useState(false);
  const { data } = useGetMeQuery();

  const [createNewIntegration] = useCreateIntegrationMutation({
    refetchQueries: ["GetMe"],
  });

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

  const handleIntegrationCreate = useCallback(
    async (data: { name: string; description: string; logoUrl: string; type: IntegrationType }) => {
      const integration = await createNewIntegration({
        variables: {
          name: data.name,
          description: data.description,
          logoUrl: data.logoUrl,
          type: data.type,
        },
      });
      if (integration.errors || !integration.data?.createIntegration) {
        setIntegrationModalShown(false);
        return;
      }

      setIntegrationModalShown(false);
    },
    [createNewIntegration],
  );

  const handleIntegrationModalClose = useCallback(() => {
    setIntegrationModalShown(false);
  }, []);

  const handleIntegrationModalOpen = useCallback(() => setIntegrationModalShown(true), []);

  return {
    integrations,
    integrationModalShown,
    handleIntegrationCreate,
    handleIntegrationModalOpen,
    handleIntegrationModalClose,
  };
};
