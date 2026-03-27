import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import {
  IntegrationMember,
  WorkspaceIntegration,
} from "@reearth-cms/components/molecules/Integration/types";
import { Role } from "@reearth-cms/components/molecules/Member/types";
import {
  fromGraphQLIntegration,
  fromGraphQLWorkspace,
} from "@reearth-cms/components/organisms/DataConverters/setting";
import {
  Role as GQLRole,
  Workspace as GQLWorkspace,
} from "@reearth-cms/gql/__generated__/graphql.generated";
import { GetMeDocument } from "@reearth-cms/gql/__generated__/user.generated";
import {
  AddIntegrationToWorkspaceDocument,
  RemoveIntegrationFromWorkspaceDocument,
  UpdateIntegrationOfWorkspaceDocument,
} from "@reearth-cms/gql/__generated__/workspace.generated";
import { useT } from "@reearth-cms/i18n";
import { useUserRights } from "@reearth-cms/state";

export default (workspaceId?: string) => {
  const [selectedIntegration, setSelectedIntegration] = useState<WorkspaceIntegration>();

  const [searchTerm, setSearchTerm] = useState<string>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, refetch, loading } = useQuery(GetMeDocument, {
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
      workspace?.members?.filter((member): member is IntegrationMember => "integration" in member),
    [workspace?.members],
  );

  const workspaceIntegrations = useMemo(
    (): WorkspaceIntegration[] | undefined =>
      workspaceIntegrationMembers
        ?.filter(member => !!member.integration?.name.toLowerCase().includes(searchTerm ?? ""))
        .map(member => ({
          id: member.integration?.id,
          name: member.integration?.name,
          description: member.integration?.description ?? undefined,
          imageUrl: undefined,
          createdBy: member.integration?.developer,
          role: member.integrationRole,
        })),
    [workspaceIntegrationMembers, searchTerm],
  );

  const myIntegrations = useMemo(
    () =>
      data?.me?.integrations
        ?.map(integration => fromGraphQLIntegration(integration))
        .filter(
          integration =>
            !workspaceIntegrations?.some(
              workspaceIntegration => workspaceIntegration.id === integration.id,
            ),
        ),
    [data?.me?.integrations, workspaceIntegrations],
  );

  const [addIntegrationToWorkspaceMutation, { loading: addLoading }] = useMutation(
    AddIntegrationToWorkspaceDocument,
  );

  const handleIntegrationConnect = useCallback(
    async (integrationId: string) => {
      if (!integrationId || !workspaceId) return;
      const integrationResponse = await addIntegrationToWorkspaceMutation({
        variables: {
          integrationId,
          workspaceId,
          role: GQLRole.Reader,
        },
      });
      if (integrationResponse.error || !integrationResponse.data?.addIntegrationToWorkspace) {
        Notification.error({ title: t("Failed to connect integration.") });
        throw new Error();
      }
      Notification.success({ title: t("Successfully connected integration to the workspace!") });
      refetch();
    },
    [addIntegrationToWorkspaceMutation, workspaceId, refetch, t],
  );

  const [updateIntegrationToWorkspaceMutation, { loading: updateLoading }] = useMutation(
    UpdateIntegrationOfWorkspaceDocument,
  );

  const handleUpdateIntegration = useCallback(
    async (role: Role) => {
      if (!workspaceId || !selectedIntegration) return;
      const integration = await updateIntegrationToWorkspaceMutation({
        variables: {
          integrationId: selectedIntegration?.id || "",
          workspaceId,
          role: role as GQLRole,
        },
      });
      if (integration.error || !integration.data?.updateIntegrationOfWorkspace) {
        Notification.error({ title: t("Failed to update workspace integration.") });
        throw new Error();
      }

      Notification.success({ title: t("Successfully updated workspace integration!") });
      refetch();
    },
    [updateIntegrationToWorkspaceMutation, selectedIntegration, workspaceId, refetch, t],
  );

  const [removeIntegrationFromWorkspaceMutation, { loading: deleteLoading }] = useMutation(
    RemoveIntegrationFromWorkspaceDocument,
  );

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
            if (result.error) {
              throw new Error();
            }
          }),
        );
        Notification.success({
          title: t("One or more integrations were successfully deleted!"),
        });
      } catch (e) {
        Notification.error({ title: t("Failed to delete one or more integrations.") });
        throw e;
      }
    },
    [t, removeIntegrationFromWorkspaceMutation, workspaceId],
  );

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  const handleTableChange = useCallback((page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
  }, []);

  return {
    loading,
    workspaceIntegrations,
    handleSearchTerm,
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
