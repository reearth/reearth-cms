import { useCallback, useMemo, useState } from "react";

import { Integration } from "@reearth-cms/components/molecules/Integration/types";
import { useGetMeQuery } from "@reearth-cms/gql/graphql-client-api";

export default () => {
  const [integrationConnectModalShown, setIntegrationConnectModalShown] = useState(false);
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
  const handleIntegrationConnectModalClose = useCallback(() => {
    setIntegrationConnectModalShown(false);
  }, []);

  const handleIntegrationConnectModalOpen = useCallback(
    () => setIntegrationConnectModalShown(true),
    [],
  );
  return {
    integrations,
    handleIntegrationConnectModalClose,
    handleIntegrationConnectModalOpen,
    integrationConnectModalShown,
  };
};
