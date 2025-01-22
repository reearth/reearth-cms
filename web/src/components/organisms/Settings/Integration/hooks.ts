import { useCallback, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { IntegrationMember } from "@reearth-cms/components/molecules/Integration/types";
import { Role } from "@reearth-cms/components/molecules/Member/types";
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
import { useUserRights } from "@reearth-cms/state";

export default (workspaceId?: string) => {
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationMember>();
  const [searchTerm, setSearchTerm] = useState<string>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, refetch, loading } = useGetMeQuery({
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const t = useT();
  const [userRights] = useUserRights();
  const hasConnectRight = useMemo(
    () => !!userRights?.integrations.connect,
    [userRights?.integrations.connect],
  );
  const hasUpdateRight = useMemo(
    () => !!userRights?.integrations.update,
    [userRights?.integrations.update],
  );
  const hasDeleteRight = useMemo(
    () => !!userRights?.integrations.delete,
    [userRights?.integrations.delete],
  );

  const workspace = useMemo(() => {
    const foundWorkspace = data?.me?.workspaces?.find(workspace => workspace.id === workspaceId);
    return foundWorkspace && fromGraphQLWorkspace(foundWorkspace as GQLWorkspace);
  }, [data?.me?.workspaces, workspaceId]);

  const workspaceIntegrationMembers = useMemo(
    () =>
      workspace?.members?.filter(
        (member): member is IntegrationMember =>
          "integration" in member &&
          !!member.integration?.name.toLowerCase().includes(searchTerm ?? ""),
      ),
    [workspace?.members, searchTerm],
  );

  const myIntegrations = useMemo(
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
        throw new Error();
      }
      Notification.success({ message: t("Successfully connected integration to the workspace!") });
      refetch();
    },
    [addIntegrationToWorkspaceMutation, workspaceId, refetch, t],
  );

  const [updateIntegrationToWorkspaceMutation, { loading: updateLoading }] =
    useUpdateIntegrationOfWorkspaceMutation();

  const handleUpdateIntegration = useCallback(
    async (role: Role) => {
      if (!workspaceId || !selectedIntegration) return;
      const integration = await updateIntegrationToWorkspaceMutation({
        variables: {
          integrationId: selectedIntegration?.integration?.id || "",
          workspaceId,
          role: role as GQLRole,
        },
      });
      if (integration.errors || !integration.data?.updateIntegrationOfWorkspace) {
        Notification.error({ message: t("Failed to update workspace integration.") });
        throw new Error();
      }

      Notification.success({ message: t("Successfully updated workspace integration!") });
      refetch();
    },
    [updateIntegrationToWorkspaceMutation, selectedIntegration, workspaceId, refetch, t],
  );

  const [removeIntegrationFromWorkspaceMutation, { loading: deleteLoading }] =
    useRemoveIntegrationFromWorkspaceMutation();

  const handleIntegrationRemove = useCallback(
    async (integrationIds: string[]) => {
      if (!workspaceId) return;
      try {
        await Promise.all(
          integrationIds.map(async integrationId => {
            const result = await removeIntegrationFromWorkspaceMutation({
              variables: { workspaceId, integrationId },
              refetchQueries: ["GetMe"],
            });
            if (result.errors) {
              throw new Error();
            }
          }),
        );
        Notification.success({
          message: t("One or more integrations were successfully deleted!"),
        });
      } catch (e) {
        Notification.error({ message: t("Failed to delete one or more integrations.") });
        throw e;
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
    loading,
    workspaceIntegrationMembers,
    handleSearchTerm,
    handleReload,
    setSelectedIntegration,
    deleteLoading,
    handleIntegrationRemove,
    page,
    pageSize,
    handleTableChange,
    hasConnectRight,
    hasUpdateRight,
    hasDeleteRight,

    myIntegrations,
    addLoading,
    handleIntegrationConnect,

    selectedIntegration,
    updateLoading,
    handleUpdateIntegration,
  };
};
