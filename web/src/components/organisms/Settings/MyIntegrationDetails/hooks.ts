import { useCallback, useMemo } from "react";

import { Integration } from "@reearth-cms/components/molecules/MyIntegration/types";
import { useGetMeQuery, useUpdateIntegrationMutation } from "@reearth-cms/gql/graphql-client-api";

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

  return {
    integrations,
    selectedIntegration,
    handleIntegrationUpdate,
  };
};
