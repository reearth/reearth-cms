import { Key, useCallback, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { IntegrationMember, Role } from "@reearth-cms/components/molecules/Integration/types";
import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";
import {
  fromGraphQLIntegration,
  fromGraphQLWorkspace,
} from "@reearth-cms/components/organisms/DataConverters/setting";
import {
  useGetMeQuery,
  useAddIntegrationToWorkspaceMutation,
  Role as GQLRole,
  useUpdateIntegrationOfWorkspaceMutation,
  useRemoveIntegrationFromWorkspaceMutation,
  Workspace as GQLWorkspace,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

export default (workspaceId?: string) => {
  const [selectedIntegrationMember, SetSelectedIntegrationMember] = useState<IntegrationMember>();
  const [integrationConnectModalShown, setIntegrationConnectModalShown] = useState(false);
  const [integrationSettingsModalShown, setIntegrationSettingsModalShown] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>();
  const [selection, setSelection] = useState<{ selectedRowKeys: Key[] }>({
    selectedRowKeys: [],
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, refetch, loading } = useGetMeQuery({
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const t = useT();

  const workspace = useMemo(() => {
    const foundWorkspace = data?.me?.workspaces?.find(workspace => workspace.id === workspaceId);
    return foundWorkspace && fromGraphQLWorkspace(foundWorkspace as GQLWorkspace);
  }, [data?.me?.workspaces]);

  const workspaceIntegrationMembers = useMemo(
    () =>
      workspace?.members?.filter(
        (member): member is IntegrationMember =>
          "integration" in member &&
          !!member.integration?.name.toLowerCase().includes(searchTerm ?? ""),
      ),
    [workspace?.members, searchTerm],
  );

  const integrations = useMemo(
    () =>
      data?.me?.integrations
        ?.map(integration => fromGraphQLIntegration(integration))
        .filter(
          integration =>
            !workspaceIntegrationMembers?.some(
              workspaceIntegration => workspaceIntegration.id === integration.id,
            ),
        ),
    [data?.me?.integrations, workspaceIntegrationMembers],
  );

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

  const [addIntegrationToWorkspaceMutation, { loading: addLoading }] =
    useAddIntegrationToWorkspaceMutation();

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

  const [updateIntegrationToWorkspaceMutation, { loading: updateLoading }] =
    useUpdateIntegrationOfWorkspaceMutation();

  const handleUpdateIntegration = useCallback(
    async (role: Role) => {
      if (!workspaceId || !selectedIntegrationMember) return;
      const integration = await updateIntegrationToWorkspaceMutation({
        variables: {
          integrationId: selectedIntegrationMember?.integration?.id || "",
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

  const [removeIntegrationFromWorkspaceMutation] = useRemoveIntegrationFromWorkspaceMutation();

  const handleIntegrationRemove = useCallback(
    async (integrationIds: string[]) => {
      if (!workspaceId) return;
      const results = await Promise.all(
        integrationIds.map(async integrationId => {
          const result = await removeIntegrationFromWorkspaceMutation({
            variables: { workspaceId, integrationId },
            refetchQueries: ["GetMe"],
          });
          if (result.errors) {
            Notification.error({ message: t("Failed to delete one or more intagrations.") });
          }
        }),
      );
      if (results) {
        Notification.success({
          message: t("One or more integrations were successfully deleted!"),
        });
        setSelection({ selectedRowKeys: [] });
      }
    },
    [t, removeIntegrationFromWorkspaceMutation, workspaceId],
  );

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  const handleReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleTableChange = useCallback((page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
  }, []);

  return {
    integrations,
    workspaceIntegrationMembers,
    handleIntegrationConnectModalClose,
    handleIntegrationConnectModalOpen,
    addLoading,
    handleIntegrationConnect,
    handleIntegrationRemove,
    integrationConnectModalShown,
    handleUpdateIntegration,
    updateLoading,
    handleIntegrationSettingsModalClose,
    handleIntegrationSettingsModalOpen,
    integrationSettingsModalShown,
    selectedIntegrationMember,
    selection,
    handleSearchTerm,
    setSelection,
    page,
    pageSize,
    handleTableChange,
    loading,
    handleReload,
  };
};
