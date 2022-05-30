import {
  useGetWorkspacesQuery,
  useAddMemberToWorkspaceMutation,
  useUpdateMemberOfWorkspaceMutation,
  Role,
  useRemoveMemberFromWorkspaceMutation,
  Workspace,
  useGetUserBySearchLazyQuery,
} from "@reearth-cms/gql/graphql-client-api";
import { useWorkspace } from "@reearth-cms/state";
import { useCallback, useEffect, useState } from "react";

export type RoleUnion = "READER" | "WRITER" | "OWNER";

type Props = {
  workspaceId: string | undefined;
};

export default ({ workspaceId }: Props) => {
  const [currentWorkspace, setWorkspace] = useWorkspace();
  const [roleModalShown, setRoleModalShown] = useState(false);

  const [searchedUser, changeSearchedUser] = useState<{
    id: string;
    name: string;
    email: string;
  }>();

  const { data, refetch, loading } = useGetWorkspacesQuery();
  const me = { id: data?.me?.id, myWorkspace: data?.me?.myWorkspace.id };
  const workspaces = data?.me?.workspaces as Workspace[];

  useEffect(() => {
    if (!workspaceId) return;
    if (!currentWorkspace) {
      setWorkspace(
        workspaceId
          ? workspaces?.find((t) => t.id === workspaceId)
          : data?.me?.myWorkspace ?? undefined
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace, setWorkspace, workspaces, data?.me]);

  const [searchUserQuery, { data: searchUserData }] =
    useGetUserBySearchLazyQuery();

  useEffect(() => {
    changeSearchedUser(searchUserData?.searchUser ?? undefined);
  }, [searchUserData?.searchUser]);

  const handleUserSearch = useCallback(
    (nameOrEmail: string) =>
      nameOrEmail && searchUserQuery({ variables: { nameOrEmail } }),
    [searchUserQuery]
  );

  const [addMemberToWorkspaceMutation] = useAddMemberToWorkspaceMutation();

  const handleMemberAddToWorkspace = useCallback(
    async (userIds: string[]) => {
      const results = await Promise.all(
        userIds.map(async (userId) => {
          if (!workspaceId) return;
          const result = await addMemberToWorkspaceMutation({
            variables: { userId, workspaceId, role: Role.Reader },
            refetchQueries: ["GetWorkspaces"],
          });
          const workspace = result.data?.addMemberToWorkspace?.workspace;
          if (result.errors || !workspace) {
            // TODO: notification
            return;
          }
          setWorkspace(workspace);
        })
      );
      if (results) {
        // TODO: notification
      }
    },
    [workspaceId, addMemberToWorkspaceMutation, setWorkspace]
  );

  const [updateMemberOfWorkspaceMutation] =
    useUpdateMemberOfWorkspaceMutation();

  const handleMemberOfWorkspaceUpdate = useCallback(
    async (userId: string, role: RoleUnion) => {
      console.log(userId, role);

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
        const workspace = results.data?.updateMemberOfWorkspace?.workspace;
        if (workspace) {
          setWorkspace(workspace);
        }
      }
    },
    [workspaceId, setWorkspace, updateMemberOfWorkspaceMutation]
  );

  const [removeMemberFromWorkspaceMutation] =
    useRemoveMemberFromWorkspaceMutation();

  const handleMemberRemoveFromWorkspace = useCallback(
    async (userId: string) => {
      if (!workspaceId) return;
      const result = await removeMemberFromWorkspaceMutation({
        variables: { workspaceId, userId },
        refetchQueries: ["GetWorkspaces"],
      });
      const workspace = result.data?.removeMemberFromWorkspace?.workspace;
      if (result.errors || !workspace) {
        // TODO: notification
        return;
      }
      setWorkspace(workspace);
      // TODO: notification
    },
    [workspaceId, removeMemberFromWorkspaceMutation, setWorkspace]
  );

  const handleRoleModalClose = useCallback(
    (r?: boolean) => {
      setRoleModalShown(false);
      if (r) {
        refetch();
      }
    },
    [refetch]
  );

  const handleRoleModalOpen = useCallback(() => setRoleModalShown(true), []);

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
    roleModalShown,
    loading,
  };
};
