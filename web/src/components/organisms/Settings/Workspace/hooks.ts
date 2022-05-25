import {
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useAddMemberToWorkspaceMutation,
  useUpdateMemberOfWorkspaceMutation,
  Role,
  useRemoveMemberFromWorkspaceMutation,
  Workspace,
  useGetUserBySearchLazyQuery,
} from "@reearth-cms/gql/graphql-client-api";
import { useWorkspace } from "@reearth-cms/state";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export type RoleUnion = "READER" | "WRITER" | "OWNER";

type Params = {
  workspaceId: string | undefined;
};

export default (params: Params) => {
  const [currentWorkspace, setWorkspace] = useWorkspace();

  const navigate = useNavigate();
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
          ? workspaces?.find((t) => t.id === workspaceId)
          : data?.me?.myWorkspace ?? undefined
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace, setWorkspace, workspaces, data?.me]);

  useEffect(() => {
    if (
      params.workspaceId &&
      currentWorkspace?.id &&
      params.workspaceId !== currentWorkspace.id
    ) {
      navigate(`/workspaces/${currentWorkspace?.id}`);
    }
  }, [params, currentWorkspace, navigate]);

  const workspaceId = currentWorkspace?.id;

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

  const [createWorkspaceMutation] = useCreateWorkspaceMutation();
  const handleWorkspaceCreate = useCallback(
    async (data: { name: string }) => {
      const results = await createWorkspaceMutation({
        variables: { name: data.name },
        refetchQueries: ["GetWorkspaces"],
      });
      const workspace = results.data?.createWorkspace?.workspace;
      if (results.errors || !results.data?.createWorkspace) {
        // TODO: notification
      } else {
        // TODO: notification
        setWorkspace(workspace);
      }
    },
    [createWorkspaceMutation, setWorkspace]
  );

  const [updateWorkspaceMutation] = useUpdateWorkspaceMutation();

  const handleNameUpdate = useCallback(
    async (name?: string) => {
      if (!workspaceId || !name) return;
      const results = await updateWorkspaceMutation({
        variables: { workspaceId, name },
      });
      if (results.errors) {
        // TODO: notification
      } else {
        setWorkspace(results.data?.updateWorkspace?.workspace);
        // TODO: notification
      }
    },
    [workspaceId, updateWorkspaceMutation, setWorkspace]
  );

  const [deleteWorkspaceMutation] = useDeleteWorkspaceMutation({
    refetchQueries: ["GetWorkspaces"],
  });
  const handleWorkspaceDelete = useCallback(async () => {
    if (!workspaceId) return;
    const result = await deleteWorkspaceMutation({
      variables: { workspaceId },
    });
    if (result.errors || !result.data?.deleteWorkspace) {
      // TODO: notification
    } else {
      // TODO: notification
      setWorkspace(workspaces[0]);
    }
  }, [workspaceId, setWorkspace, workspaces, deleteWorkspaceMutation]);

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

  const onWorkspaceSelect = useCallback(
    (workspace: Workspace) => {
      if (workspace.id) {
        setWorkspace(workspace);
        navigate(`/workspaces/${workspace.id}`);
      }
    },
    [navigate, setWorkspace]
  );

  return {
    me,
    workspaces,
    currentWorkspace,
    searchedUser,
    changeSearchedUser,
    handleWorkspaceCreate,
    handleNameUpdate,
    handleWorkspaceDelete,
    handleUserSearch,
    handleMemberAddToWorkspace,
    handleMemberOfWorkspaceUpdate,
    handleMemberRemoveFromWorkspace,
    onWorkspaceSelect,
    loading,
  };
};
