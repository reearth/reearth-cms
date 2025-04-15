import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Role } from "@reearth-cms/components/molecules/Member/types";
import { UserMember, MemberInput } from "@reearth-cms/components/molecules/Workspace/types";
import { fromGraphQLWorkspace } from "@reearth-cms/components/organisms/DataConverters/setting";
import {
  useGetWorkspaceQuery,
  useGetMeQuery,
  useAddUsersToWorkspaceMutation,
  useUpdateMemberOfWorkspaceMutation,
  Role as GQLRole,
  useRemoveMultipleMembersFromWorkspaceMutation,
  Workspace as GQLWorkspace,
  useGetUsersLazyQuery,
  MemberInput as GQLMemberInput,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useWorkspace, useUserRights } from "@reearth-cms/state";
import { stringSortCallback } from "@reearth-cms/utils/sort";

export default () => {
  const t = useT();
  const navigate = useNavigate();

  const [currentWorkspace, setWorkspace] = useWorkspace();
  const workspaceId = useMemo(() => currentWorkspace?.id, [currentWorkspace?.id]);
  const [userRights] = useUserRights();
  const hasInviteRight = useMemo(() => !!userRights?.members.invite, [userRights?.members.invite]);
  const hasRemoveRight = useMemo(() => !!userRights?.members.remove, [userRights?.members.remove]);
  const hasChangeRoleRight = useMemo(
    () => !!userRights?.members.changeRole,
    [userRights?.members.changeRole],
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState<string>();
  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  const {
    data: workspaceData,
    refetch,
    loading,
  } = useGetWorkspaceQuery({
    variables: { id: workspaceId ?? "" },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    skip: !workspaceId,
  });

  const { data, refetch: refetchMe } = useGetMeQuery({
    fetchPolicy: "cache-and-network",
  });

  const me = useMemo(
    () => ({ id: data?.me?.id, myWorkspace: data?.me?.myWorkspace?.id }),
    [data?.me?.id, data?.me?.myWorkspace?.id],
  );

  const workspaceUserMembers = useMemo((): UserMember[] | undefined => {
    if (!workspaceData?.node) return;
    return fromGraphQLWorkspace(workspaceData?.node as GQLWorkspace)
      .members?.map<UserMember | undefined>(member =>
        "userId" in member
          ? {
              userId: member.userId,
              user: member.user,
              role: member.role,
            }
          : undefined,
      )
      .filter(
        (user): user is UserMember =>
          !!user && user.user.name.toLowerCase().includes(searchTerm?.toLowerCase() ?? ""),
      )
      .sort((user1, user2) => stringSortCallback(user1.userId, user2.userId));
  }, [searchTerm, workspaceData?.node]);

  const isAbleToLeave = useMemo(
    () =>
      userRights?.role !== "OWNER" ||
      !!workspaceUserMembers?.some(m => m.role === "OWNER" && m.userId !== me.id),
    [me.id, userRights?.role, workspaceUserMembers],
  );

  const [getUsersQuery, { loading: searchLoading }] = useGetUsersLazyQuery({
    fetchPolicy: "no-cache",
  });

  const handleUserSearch = useCallback(
    async (keyword: string) => {
      const res = await getUsersQuery({ variables: { keyword } });
      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data?.userSearch ?? [];
    },
    [getUsersQuery],
  );

  const [addUsersToWorkspaceMutation, { loading: addLoading }] = useAddUsersToWorkspaceMutation();

  const handleUsersAddToWorkspace = useCallback(
    async (users: MemberInput[]) => {
      if (!workspaceId) return;
      const result = await addUsersToWorkspaceMutation({
        variables: { workspaceId, users: users as GQLMemberInput[] },
      });
      const workspace = result.data?.addUsersToWorkspace?.workspace;
      if (result.errors || !workspace) {
        Notification.error({ message: t("Failed to add one or more members.") });
        return;
      }
      setWorkspace(fromGraphQLWorkspace(workspace as GQLWorkspace));
      Notification.success({ message: t("Successfully added member(s) to the workspace!") });
    },
    [addUsersToWorkspaceMutation, setWorkspace, t, workspaceId],
  );

  const [updateMemberOfWorkspaceMutation, { loading: updateLoading }] =
    useUpdateMemberOfWorkspaceMutation();

  const handleUpdateRole = useCallback(
    async (userId: string, role: Role) => {
      if (!workspaceId) return;
      const result = await updateMemberOfWorkspaceMutation({
        variables: {
          workspaceId,
          userId,
          role: {
            READER: GQLRole.Reader,
            WRITER: GQLRole.Writer,
            MAINTAINER: GQLRole.Maintainer,
            OWNER: GQLRole.Owner,
          }[role],
        },
      });
      const workspace = result.data?.updateUserOfWorkspace?.workspace;
      if (result.errors || !workspace) {
        Notification.error({ message: t("Failed to update member's role.") });
        return;
      }
      setWorkspace(fromGraphQLWorkspace(workspace as GQLWorkspace));
      Notification.success({ message: t("Successfully updated member's role!") });
    },
    [workspaceId, updateMemberOfWorkspaceMutation, t, setWorkspace],
  );

  const [removeMultipleMembersFromWorkspaceMutation] =
    useRemoveMultipleMembersFromWorkspaceMutation();

  const handleMemberRemoveFromWorkspace = useCallback(
    async (userIds: string[]) => {
      if (!workspaceId) return;
      const result = await removeMultipleMembersFromWorkspaceMutation({
        variables: { workspaceId, userIds },
      });
      if (result.errors) {
        Notification.error({
          message: t("Failed to remove member(s) from the workspace."),
        });
        throw new Error();
      }
      Notification.success({
        message: t("Successfully removed member(s) from the workspace!"),
      });
    },
    [workspaceId, removeMultipleMembersFromWorkspaceMutation, t],
  );

  const handleLeave = useCallback(
    async (userId: string) => {
      if (!workspaceId) return;
      const result = await removeMultipleMembersFromWorkspaceMutation({
        variables: { workspaceId, userIds: [userId] },
      });
      if (result.errors) {
        Notification.error({
          message: t("Failed to leave the workspace."),
        });
      } else {
        Notification.success({
          message: t("Successfully left the workspace!"),
        });
        refetchMe();
        navigate(`/workspace/${me.myWorkspace}`);
      }
    },
    [
      workspaceId,
      removeMultipleMembersFromWorkspaceMutation,
      t,
      refetchMe,
      navigate,
      me.myWorkspace,
    ],
  );

  const handleReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleTableChange = useCallback((page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
  }, []);

  return {
    workspaceUserMembers,
    userId: me.id,
    isAbleToLeave,
    handleSearchTerm,
    handleUserSearch,
    searchLoading,
    addLoading,
    handleUsersAddToWorkspace,
    updateLoading,
    handleUpdateRole,
    handleMemberRemoveFromWorkspace,
    handleLeave,
    page,
    pageSize,
    handleTableChange,
    loading,
    handleReload,
    hasInviteRight,
    hasRemoveRight,
    hasChangeRoleRight,
  };
};
