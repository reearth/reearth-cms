import { useCallback, useMemo, useState } from "react";

import { Integration } from "@reearth-cms/components/molecules/Integration/types";
import { useGetMeQuery } from "@reearth-cms/gql/graphql-client-api";

export default (workspaceId?: string) => {
  const [integrationConnectModalShown, setIntegrationConnectModalShown] = useState(false);
  const { data } = useGetMeQuery();

  const workspaces = data?.me?.workspaces;
  const workspace = workspaces?.find(workspace => workspace.id === workspaceId);

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

  //   const workspaceIntegrations = useMemo(() => {
  //     return (workspace?.members ?? [])
  //       .map<Integration | undefined>(member =>
  //         member
  //           ? {
  //               id: member.integration.id,
  //               name: member.integration.name,
  //               description: member.integration.description,
  //               logoUrl: member.integration.logoUrl,
  //               developerId: member.integration.developerId,
  //               iType: member.integration.iType,
  //               config: {
  //                 token: member.integration.config?.token,
  //                 webhooks: member.integration.config?.webhooks,
  //               },
  //             }
  //           : undefined,
  //       )
  //       .filter((integration): integration is Integration => !!integration);
  //   }, [workspace]);

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
