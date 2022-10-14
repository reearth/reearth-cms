import { useCallback, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import {
  Integration,
  IntegrationMember,
  Role,
} from "@reearth-cms/components/molecules/Integration/types";
import {
  useGetMeQuery,
  useAddIntegrationToWorkspaceMutation,
  Role as GQLRole,
  Integration as GQLIntegration,
  useUpdateIntegrationOfWorkspaceMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

export default (workspaceId?: string) => {
  const [selectedIntegrationMember, SetSelectedIntegrationMember] = useState<IntegrationMember>();
  const [integrationConnectModalShown, setIntegrationConnectModalShown] = useState(false);
  const [integrationSettingsModalShown, setIntegrationSettingsModalShown] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>();
  const { data, refetch } = useGetMeQuery();
  const t = useT();

  const workspaces = useMemo(() => data?.me?.workspaces, [data?.me?.workspaces]);
  const workspace = workspaces?.find(workspace => workspace.id === workspaceId);

  const fromIntegration = (integration: GQLIntegration) => ({
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
    return data?.me?.integrations
      ?.map<Integration | undefined>(integration => fromIntegration(integration))
      .filter((integration): integration is Integration => !!integration);
  }, [data?.me?.integrations]);

  const workspaceIntegrationMembers = useMemo(() => {
    return workspace?.members
      ?.map<IntegrationMember | undefined>(member =>
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
    setIntegrationConnectModalShown(false);
  }, []);

  const handleIntegrationConnectModalOpen = useCallback(() => {
    setIntegrationConnectModalShown(true);
  }, []);

  const handleIntegrationSettingsModalClose = useCallback(() => {
    setIntegrationSettingsModalShown(false);
  }, []);

  const handleIntegrationSettingsModalOpen = useCallback((integrationMember: IntegrationMember) => {
    SetSelectedIntegrationMember(integrationMember);
    setIntegrationSettingsModalShown(true);
  }, []);

  const [addIntegrationToWorkspaceMutation] = useAddIntegrationToWorkspaceMutation();

  const handleIntegrationConnect = useCallback(
    async (integration?: Integration) => {
      if (!integration || !workspaceId) return;
      const integrationResponse = await addIntegrationToWorkspaceMutation({
        variables: {
          integrationId: integration.id,
          workspaceId,
          role: GQLRole.Reader,
        },
      });
      if (integrationResponse.errors || !integrationResponse.data?.addIntegrationToWorkspace) {
        Notification.error({ message: t("Failed to connect integration.") });
        return;
      }
      Notification.success({ message: t("Successfully connected integration to the workspace!") });
      setIntegrationConnectModalShown(false);
      refetch();
    },
    [addIntegrationToWorkspaceMutation, workspaceId, refetch, t],
  );

  const [updateIntegrationToWorkspaceMutation] = useUpdateIntegrationOfWorkspaceMutation();

  const handleUpdateIntegration = useCallback(
    async (role: Role) => {
      if (!workspaceId || !selectedIntegrationMember) return;
      const integration = await updateIntegrationToWorkspaceMutation({
        variables: {
          integrationId: selectedIntegrationMember?.integration.id,
          workspaceId,
          role: role as GQLRole,
        },
      });
      if (integration.errors || !integration.data?.updateIntegrationOfWorkspace) {
        Notification.error({ message: t("Failed to update workspace integration.") });
        return;
      }

      Notification.success({ message: t("Successfully updated workspace integration!") });
      setIntegrationConnectModalShown(false);
      refetch();
    },
    [updateIntegrationToWorkspaceMutation, selectedIntegrationMember, workspaceId, refetch, t],
  );

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term);
  }, []);

  return {
    integrations,
    workspaceIntegrationMembers,
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
