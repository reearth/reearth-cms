import {
  useCreateWorkspaceMutation,
  useGetMeQuery,
} from "@reearth-cms/gql/graphql-client-api";
import { useWorkspace } from "@reearth-cms/state";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export type User = {
  name: string;
};

export type Member = {
  user: {
    id?: string;
    name?: string;
  };
};

export type Workspace = {
  id?: string;
  name?: string;
  members?: Member[];
};

export default (workspaceId?: string) => {
  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();
  const { data, refetch } = useGetMeQuery();

  const navigate = useNavigate();

  const user: User = {
    name: data?.me?.name || "",
  };

  const workspaces = data?.me?.workspaces;
  const workspace = workspaces?.find(
    (workspace) => workspace.id === workspaceId
  );
  const personal = workspaceId === data?.me?.myWorkspace.id;

  useEffect(() => {
    if (workspace?.id && workspace.id !== currentWorkspace?.id) {
      setCurrentWorkspace({
        personal,
        ...workspace,
      });
    }
  }, [currentWorkspace, workspace, setCurrentWorkspace, personal]);

  const handleWorkspaceChange = useCallback(
    (workspaceId: string) => {
      const workspace = workspaces?.find(
        (workspace) => workspace.id === workspaceId
      );
      if (workspace) {
        setCurrentWorkspace(workspace);
        navigate(`/dashboard/${workspaceId}`);
      }
    },
    [workspaces, setCurrentWorkspace, navigate]
  );

  const [createWorkspaceMutation] = useCreateWorkspaceMutation();
  const handleWorkspaceCreate = useCallback(
    async (data: { name: string }) => {
      const results = await createWorkspaceMutation({
        variables: { name: data.name },
        refetchQueries: ["GetWorkspaces"],
      });
      if (results.data?.createWorkspace) {
        setCurrentWorkspace(results.data.createWorkspace.workspace);
        navigate(`/dashboard/${results.data.createWorkspace.workspace.id}`);
      }
      refetch();
    },
    [createWorkspaceMutation, setCurrentWorkspace, refetch, navigate]
  );

  return {
    user,
    workspaces,
    currentWorkspace,
    handleWorkspaceCreate,
    handleWorkspaceChange,
  };
};
