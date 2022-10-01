import { useCallback, useMemo, useState } from "react";

import {
  Integration,
  IntegrationMember,
} from "@reearth-cms/components/molecules/Integration/types";
import {
  useGetMeQuery,
  useAddIntegrationToWorkspaceMutation,
  Role,
} from "@reearth-cms/gql/graphql-client-api";

export default (workspaceId?: string) => {
  const [selectedConnectionModalIntegration, SetSelectedConnectionModalIntegration] =
    useState<Integration>();
  const [integrationConnectModalShown, setIntegrationConnectModalShown] = useState(false);
  const { data } = useGetMeQuery();

  const workspaces = data?.me?.workspaces;
  const workspace = workspaces?.find(workspace => workspace.id === workspaceId);

  const fromIntegration = (integration: any) => ({
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
  });

  const integrations = useMemo(() => {
    return (data?.me?.integrations ?? [])
      .map<Integration | undefined>(integration =>
        integration ? fromIntegration(integration) : undefined,
      )
      .filter((integration): integration is Integration => !!integration);
  }, [data?.me?.integrations]);

  const workspaceIntegrationMembers = useMemo(() => {
    return (workspace?.members ?? [])
      .map<IntegrationMember | undefined>(member =>
        member && member.__typename === "WorkspaceIntegrationMember"
          ? {
              active: member.active,
              integration: fromIntegration(member.integration),
              integrationRole: member.integrationRole,
              invitedById: member.invitedById,
            }
          : undefined,
      )
      .filter((integration): integration is IntegrationMember => !!integration);
  }, [workspace]);

  const handleIntegrationConnectModalClose = useCallback(() => {
    setIntegrationConnectModalShown(false);
  }, []);

  const handleIntegrationConnectModalOpen = useCallback(
    () => setIntegrationConnectModalShown(true),
    [],
  );

  const handleConnectionModalIntegrationSelect = useCallback((integration: Integration) => {
    SetSelectedConnectionModalIntegration(integration);
  }, []);

  const [addIntegrationToWorkspaceMutation] = useAddIntegrationToWorkspaceMutation();

  const handleIntegrationConnect = useCallback(async () => {
    if (!selectedConnectionModalIntegration || !workspaceId) return;
    const integration = await addIntegrationToWorkspaceMutation({
      variables: {
        integrationId: selectedConnectionModalIntegration.id,
        workspaceId,
        role: Role.Reader,
      },
    });
    if (integration.errors || !integration.data?.addIntegrationToWorkspace) {
      setIntegrationConnectModalShown(false);
    }
    setIntegrationConnectModalShown(false);
  }, [addIntegrationToWorkspaceMutation, selectedConnectionModalIntegration, workspaceId]);

  return {
    integrations,
    workspaceIntegrationMembers,
    selectedConnectionModalIntegration,
    handleConnectionModalIntegrationSelect,
    handleIntegrationConnectModalClose,
    handleIntegrationConnectModalOpen,
    handleIntegrationConnect,
    integrationConnectModalShown,
  };
};
