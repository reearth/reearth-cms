import { useCallback, useEffect, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Member } from "@reearth-cms/components/molecules/Dashboard/types";
import {
  useGetWorkspacesQuery,
  useAddUserToWorkspaceMutation,
  useUpdateMemberOfWorkspaceMutation,
  Role,
  useRemoveMemberFromWorkspaceMutation,
  Workspace,
  useGetUserBySearchLazyQuery,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useWorkspace } from "@reearth-cms/state";

export type RoleUnion = "READER" | "WRITER" | "OWNER";

type Props = {
  workspaceId: string | undefined;
};

export default ({ workspaceId }: Props) => {
  const [currentWorkspace, setWorkspace] = useWorkspace();
  const [roleModalShown, setRoleModalShown] = useState(false);
  const [MemberAddModalShown, setMemberAddModalShown] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | undefined>(undefined);
  const t = useT();

  const [searchedUser, changeSearchedUser] = useState<{
    id: string;
    name: string;
    email: string;
  }>();

  const { data, loading } = useGetWorkspacesQuery();
  const me = { id: data?.me?.id, myWorkspace: data?.me?.myWorkspace.id };
  const workspaces = data?.me?.workspaces as Workspace[];

  useEffect(() => {
    if (!workspaceId) return;
    if (!currentWorkspace) {
      setWorkspace(
        workspaceId
          ? workspaces?.find(t => t.id === workspaceId)
          : data?.me?.myWorkspace ?? undefined,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace, setWorkspace, workspaces, data?.me]);

  const [searchUserQuery, { data: searchUserData }] = useGetUserBySearchLazyQuery({
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    changeSearchedUser(searchUserData?.searchUser ?? undefined);
  }, [searchUserData?.searchUser]);

  const handleUserSearch = useCallback(
    (nameOrEmail: string) => nameOrEmail && searchUserQuery({ variables: { nameOrEmail } }),
    [searchUserQuery],
  );

  const workspaceUserMembers = useMemo((): Member[] | undefined => {
    return currentWorkspace?.members
      ?.map<Member | undefined>(member =>
        member && member.__typename === "WorkspaceUserMember" && member.user
          ? {
              userId: member.userId,
              user: member.user,
              role: member.role,
            }
          : undefined,
      )
      .filter((user): user is Member => !!user);
  }, [currentWorkspace]);

  const [addUserToWorkspaceMutation] = useAddUserToWorkspaceMutation();

  const handleMemberAddToWorkspace = useCallback(
    async (userIds: string[]) => {
      const results = await Promise.all(
        userIds.map(async userId => {
          if (!workspaceId) return;
          const result = await addUserToWorkspaceMutation({
            variables: { userId, workspaceId, role: Role.Reader },
            refetchQueries: ["GetWorkspaces"],
          });
          const workspace = result.data?.addUserToWorkspace?.workspace;
          if (result.errors || !workspace) {
            Notification.error({ message: t("Failed to add one or more members.") });
            return;
          }
          setWorkspace(workspace);
        }),
      );
      if (results) {
        Notification.success({ message: t("Successfully added member(s) to the workspace!") });
      }
    },
    [workspaceId, addUserToWorkspaceMutation, setWorkspace, t],
  );

  const [updateMemberOfWorkspaceMutation] = useUpdateMemberOfWorkspaceMutation();

  const handleMemberOfWorkspaceUpdate = useCallback(
    async (userId: string, role: RoleUnion) => {
      if (workspaceId) {
        const results = await updateMemberOfWorkspaceMutation({
          variables: {
            workspaceId,
            userId,
            role: {
              READER: Role.Reader,
              WRITER: Role.Writer,
              OWNER: Role.Owner,
            }[role],
          },
        });
        const workspace = results.data?.updateUserOfWorkspace?.workspace;
        if (workspace) {
          setWorkspace(workspace);
        }
      }
    },
    [workspaceId, setWorkspace, updateMemberOfWorkspaceMutation],
  );

  const [removeMemberFromWorkspaceMutation] = useRemoveMemberFromWorkspaceMutation();

  const handleMemberRemoveFromWorkspace = useCallback(
    async (userId: string) => {
      if (!workspaceId) return;
      const result = await removeMemberFromWorkspaceMutation({
        variables: { workspaceId, userId },
        refetchQueries: ["GetWorkspaces"],
      });
      const workspace = result.data?.removeUserFromWorkspace?.workspace;
      if (result.errors || !workspace) {
        Notification.error({ message: t("Failed to delete member from the workspace.") });
        return;
      }
      setWorkspace(workspace);
      Notification.success({ message: t("Successfully removed member from the workspace!") });
    },
    [workspaceId, removeMemberFromWorkspaceMutation, setWorkspace, t],
  );

  const handleRoleModalClose = useCallback(() => {
    setRoleModalShown(false);
    setSelectedMember(undefined);
  }, []);

  const handleRoleModalOpen = useCallback((member: Member) => {
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

  return {
    me,
    workspaces,
    currentWorkspace,
    searchedUser,
    changeSearchedUser,
    handleUserSearch,
    handleMemberAddToWorkspace,
    handleMemberOfWorkspaceUpdate,
    handleMemberRemoveFromWorkspace,
    handleRoleModalClose,
    handleRoleModalOpen,
    handleMemberAddModalClose,
    handleMemberAddModalOpen,
    MemberAddModalShown,
    setSelectedMember,
    selectedMember,
    roleModalShown,
    loading,
    workspaceUserMembers,
  };
};
