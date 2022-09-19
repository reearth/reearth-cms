import { useMemo } from "react";

import { Integration } from "@reearth-cms/components/molecules/MyIntegration/types";
import { useGetMeQuery } from "@reearth-cms/gql/graphql-client-api";

export default () => {
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
            }
          : undefined,
      )
      .filter((integration): integration is Integration => !!integration);
  }, [data?.me?.integrations]);
  console.log(integrations);

  return {
    integrations,
  };
};
