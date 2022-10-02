import { useCallback, useMemo, useState } from "react";

import {
  Integration,
  IntegrationMember,
} from "@reearth-cms/components/molecules/Integration/types";
import {
  useGetMeQuery,
  useAddIntegrationToWorkspaceMutation,
  Role,
  useUpdateIntegrationOfWorkspaceMutation,
} from "@reearth-cms/gql/graphql-client-api";

export default (workspaceId?: string) => {
  const [selectedConnectionModalIntegration, SetSelectedConnectionModalIntegration] =
    useState<Integration>();
  const [selectedIntegrationMember, SetSelectedIntegrationMember] = useState<IntegrationMember>();
  const [integrationConnectModalShown, setIntegrationConnectModalShown] = useState(false);
  const [integrationSettingsModalShown, setIntegrationSettingsModalShown] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>();
  const { data, refetch } = useGetMeQuery();

  const workspaces = data?.me?.workspaces;
  const workspace = workspaces?.find(workspace => workspace.id === workspaceId);

  const fromIntegration = (integration: any) => ({
    id: integration.id,
    name: integration.name,
    description: integration.description,
    logoUrl: integration.logoUrl,
    developerId: integration.developerId,
    developer: integration.developer,
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
        member && member.__typename === "WorkspaceIntegrationMember" && member.integration
          ? {
              active: member.active,
              integration: fromIntegration(member.integration),
              integrationRole: member.integrationRole,
              invitedById: member.invitedById,
            }
          : undefined,
      )
      .filter(
        (integrationMember): integrationMember is IntegrationMember =>
          !!integrationMember &&
          integrationMember.integration.name.toLowerCase().includes(searchTerm ?? ""),
      );
  }, [workspace, searchTerm]);

  const handleIntegrationConnectModalClose = useCallback(() => {
    SetSelectedConnectionModalIntegration(undefined);
    setIntegrationConnectModalShown(false);
  }, []);

  const handleIntegrationConnectModalOpen = useCallback(() => {
    SetSelectedConnectionModalIntegration(undefined);
    setIntegrationConnectModalShown(true);
  }, []);

  const handleIntegrationSettingsModalClose = useCallback(() => {
    setIntegrationSettingsModalShown(false);
  }, []);

  const handleIntegrationSettingsModalOpen = useCallback((integrationMember: IntegrationMember) => {
    console.log(integrationMember);

    SetSelectedIntegrationMember(integrationMember);
    setIntegrationSettingsModalShown(true);
  }, []);

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
    refetch();
  }, [addIntegrationToWorkspaceMutation, selectedConnectionModalIntegration, workspaceId, refetch]);

  const [updateIntegrationToWorkspaceMutation] = useUpdateIntegrationOfWorkspaceMutation();

  const handleUpdateIntegration = useCallback(
    async (role: string) => {
      if (!workspaceId || !selectedIntegrationMember) return;
      const integration = await updateIntegrationToWorkspaceMutation({
        variables: {
          integrationId: selectedIntegrationMember?.integration.id,
          workspaceId,
          role: role as Role,
        },
      });
      if (integration.errors || !integration.data?.updateIntegrationOfWorkspace) {
        setIntegrationConnectModalShown(false);
      }
      setIntegrationConnectModalShown(false);
      refetch();
    },
    [updateIntegrationToWorkspaceMutation, selectedIntegrationMember, workspaceId, refetch],
  );

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term);
  }, []);

  return {
    integrations,
    workspaceIntegrationMembers,
    selectedConnectionModalIntegration,
    handleConnectionModalIntegrationSelect,
    handleIntegrationConnectModalClose,
    handleIntegrationConnectModalOpen,
    handleIntegrationConnect,
    integrationConnectModalShown,
    handleUpdateIntegration,
    handleIntegrationSettingsModalClose,
    handleIntegrationSettingsModalOpen,
    integrationSettingsModalShown,
    selectedIntegrationMember,
    handleSearchTerm,
  };
};
