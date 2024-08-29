import { Key, useCallback, useEffect, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { User, RoleUnion } from "@reearth-cms/components/molecules/Member/types";
import { UserMember, MemberInput } from "@reearth-cms/components/molecules/Workspace/types";
import { fromGraphQLWorkspace } from "@reearth-cms/components/organisms/DataConverters/setting";
import {
  useGetWorkspacesQuery,
  useAddUsersToWorkspaceMutation,
  useUpdateMemberOfWorkspaceMutation,
  Role,
  useRemoveMemberFromWorkspaceMutation,
  Workspace as GQLWorkspace,
  useGetUserBySearchLazyQuery,
  MemberInput as GQLMemberInput,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useWorkspace } from "@reearth-cms/state";
import { stringSortCallback } from "@reearth-cms/utils/sort";

export default () => {
  const [currentWorkspace, setWorkspace] = useWorkspace();
  const [roleModalShown, setRoleModalShown] = useState(false);
  const [MemberAddModalShown, setMemberAddModalShown] = useState(false);
  const [selectedMember, setSelectedMember] = useState<UserMember>();
  const [searchTerm, setSearchTerm] = useState<string>();
  const [owner, setOwner] = useState(false);
  const [selection, setSelection] = useState<{ selectedRowKeys: Key[] }>({
    selectedRowKeys: [],
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const t = useT();

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  const [searchedUser, changeSearchedUser] = useState<User & { isMember: boolean }>();
  const [searchedUserList, changeSearchedUserList] = useState<User[]>([]);

  const { data, refetch, loading } = useGetWorkspacesQuery({
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const me = useMemo(
    () => ({ id: data?.me?.id, myWorkspace: data?.me?.myWorkspace?.id }),
    [data?.me?.id, data?.me?.myWorkspace?.id],
  );
  const workspaces = useMemo(
    () => data?.me?.workspaces?.map(workspace => fromGraphQLWorkspace(workspace as GQLWorkspace)),
    [data?.me?.workspaces],
  );
  const workspaceId = useMemo(() => currentWorkspace?.id, [currentWorkspace?.id]);

  const isOwner = useMemo(
    () =>
      currentWorkspace?.members?.find(
        m => "userId" in m && m.userId === me?.id && m.role === "OWNER",
      ),
    [currentWorkspace?.members, me?.id],
  );

  useEffect(() => {
    setOwner(!!isOwner);
  }, [isOwner]);

  useEffect(() => {
    setWorkspace(workspaces?.find(workspace => workspace.id === workspaceId));
  }, [setWorkspace, workspaces, data?.me, workspaceId]);

  const [searchUserQuery] = useGetUserBySearchLazyQuery({
    fetchPolicy: "no-cache",
  });

  const handleUserAdd = useCallback(() => {
    if (
      searchedUser &&
      searchedUser.id !== data?.me?.id &&
      !searchedUserList.find(user => user.id === searchedUser.id)
    ) {
      changeSearchedUserList([...searchedUserList, searchedUser]);
    }
  }, [data?.me?.id, searchedUser, searchedUserList]);

  const workspaceUserMembers = useMemo((): UserMember[] | undefined => {
    return currentWorkspace?.members
      ?.map<UserMember | undefined>(member =>
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
  }, [currentWorkspace, searchTerm]);

  const handleUserSearch = useCallback(
    async (nameOrEmail: string) => {
      if (nameOrEmail) {
        const res = await searchUserQuery({ variables: { nameOrEmail } });
        if (res.data?.searchUser && res.data.searchUser?.id !== data?.me?.id) {
          const isMember = !!workspaceUserMembers?.some(
            member => member.userId === res.data?.searchUser?.id,
          );
          changeSearchedUser({ ...res.data?.searchUser, isMember });
        } else {
          changeSearchedUser(undefined);
        }
      }
    },
    [data?.me?.id, searchUserQuery, workspaceUserMembers],
  );

  const [addUsersToWorkspaceMutation, { loading: addLoading }] = useAddUsersToWorkspaceMutation();

  const handleUsersAddToWorkspace = useCallback(
    async (users: MemberInput[]) => {
      if (!workspaceId) return;
      const result = await addUsersToWorkspaceMutation({
        variables: { workspaceId, users: users as GQLMemberInput[] },
        refetchQueries: ["GetWorkspaces"],
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

  const handleMemberOfWorkspaceUpdate = useCallback(
    async (userId: string, role: RoleUnion) => {
      if (!workspaceId) return;
      const result = await updateMemberOfWorkspaceMutation({
        variables: {
          workspaceId,
          userId,
          role: {
            READER: Role.Reader,
            WRITER: Role.Writer,
            MAINTAINER: Role.Maintainer,
            OWNER: Role.Owner,
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

  const [removeMemberFromWorkspaceMutation] = useRemoveMemberFromWorkspaceMutation();

  const handleMemberRemoveFromWorkspace = useCallback(
    async (userIds: string[]) => {
      if (!workspaceId) return;
      const results = await Promise.all(
        userIds.map(async userId => {
          const result = await removeMemberFromWorkspaceMutation({
            variables: { workspaceId, userId },
            refetchQueries: ["GetWorkspaces"],
          });
          if (result.errors) {
            Notification.error({
              message: t("Failed to remove member(s) from the workspace."),
            });
          }
        }),
      );
      if (results) {
        Notification.success({
          message: t("Successfully removed member(s) from the workspace!"),
        });
        setSelection({ selectedRowKeys: [] });
      }
    },
    [workspaceId, removeMemberFromWorkspaceMutation, t],
  );

  const handleRoleModalClose = useCallback(() => {
    setRoleModalShown(false);
    setSelectedMember(undefined);
  }, []);

  const handleRoleModalOpen = useCallback((member: UserMember) => {
    setRoleModalShown(true);
    setSelectedMember(member);
  }, []);

  const handleMemberAddModalClose = useCallback(() => {
    setMemberAddModalShown(false);
    setSelectedMember(undefined);
  }, []);

  const handleMemberAddModalOpen = useCallback(() => {
    setMemberAddModalShown(true);
    setSelectedMember(undefined);
  }, []);

  const handleReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleTableChange = useCallback((page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
  }, []);

  return {
    me,
    owner,
    searchedUser,
    handleSearchTerm,
    changeSearchedUser,
    searchedUserList,
    changeSearchedUserList,
    handleUserSearch,
    handleUserAdd,
    addLoading,
    handleUsersAddToWorkspace,
    updateLoading,
    handleMemberOfWorkspaceUpdate,
    selectedMember,
    roleModalShown,
    handleMemberRemoveFromWorkspace,
    handleRoleModalClose,
    handleRoleModalOpen,
    handleMemberAddModalClose,
    handleMemberAddModalOpen,
    MemberAddModalShown,
    workspaceUserMembers,
    selection,
    setSelection,
    page,
    pageSize,
    handleTableChange,
    loading,
    handleReload,
  };
};
