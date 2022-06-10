import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useCreateWorkspaceMutation,
  useGetMeQuery,
} from "@reearth-cms/gql/graphql-client-api";
import {
  useProject,
  useUnselectProject,
  useWorkspace,
} from "@reearth-cms/state";
import { useCallback, useEffect, useMemo, useState } from "react";
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

export type Project = {
  id: string;
  name: string;
};

export default (workspaceId?: string) => {
  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();
  const [currentProject] = useProject();
  const unselectProject = useUnselectProject();
  const [workspaceModalShown, setWorkspaceModalShown] = useState(false);
  const [projectModalShown, setProjectModalShown] = useState(false);
  const { data, refetch } = useGetMeQuery();

  const navigate = useNavigate();

  const user: User = {
    name: data?.me?.name || "",
  };

  const workspaces = data?.me?.workspaces;
  const workspace = workspaces?.find(
    (workspace) => workspace.id === workspaceId
  );
  const personalWorkspace = workspaces?.find(
    (workspace) => workspace.id === data?.me?.myWorkspace.id
  );
  const personal = workspaceId === data?.me?.myWorkspace.id;

  useEffect(() => {
    if (currentWorkspace || workspaceId || !data) return;
    setCurrentWorkspace(data.me?.myWorkspace);
    navigate(`/dashboard/${data.me?.myWorkspace?.id}`);
  }, [data, navigate, setCurrentWorkspace, currentWorkspace, workspaceId]);

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

  const handleWorkspaceModalClose = useCallback(
    (r?: boolean) => {
      setWorkspaceModalShown(false);
      if (r) {
        refetch();
      }
    },
    [refetch]
  );

  const handleWorkspaceModalOpen = useCallback(
    () => setWorkspaceModalShown(true),
    []
  );

  useEffect(() => {
    // unselect project
    if (currentProject) {
      unselectProject();
    }
  }, [currentProject, setCurrentWorkspace, unselectProject]);

  const handleProjectModalClose = useCallback(
    (r?: boolean) => {
      setProjectModalShown(false);
      if (r) {
        refetch();
      }
    },
    [refetch]
  );

  const handleProjectModalOpen = useCallback(
    () => setProjectModalShown(true),
    []
  );

  const { data: projectData } = useGetProjectsQuery({
    variables: { workspaceId: workspaceId ?? "", first: 100 },
    skip: !workspaceId,
  });

  const projects = useMemo(() => {
    return (projectData?.projects.nodes ?? [])
      .map<Project | undefined>((project) =>
        project
          ? {
              id: project.id,
              description: project.description,
              name: project.name,
            }
          : undefined
      )
      .filter((project): project is Project => !!project);
  }, [projectData?.projects.nodes]);

  const [createNewProject] = useCreateProjectMutation({
    refetchQueries: ["GetProjects"],
  });

  const handleProjectCreate = useCallback(
    async (data: { name: string; description: string }) => {
      if (!workspaceId) return;
      const project = await createNewProject({
        variables: {
          workspaceId,
          name: data.name,
          description: data.description,
        },
      });
      if (project.errors || !project.data?.createProject) {
        setProjectModalShown(false);
        return;
      }

      setProjectModalShown(false);
      refetch();
    },
    [createNewProject, workspaceId, refetch]
  );

  return {
    user,
    projects,
    personalWorkspace,
    workspaces,
    currentWorkspace,
    workspaceModalShown,
    projectModalShown,
    handleProjectCreate,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    handleWorkspaceCreate,
    handleWorkspaceChange,
    handleProjectModalClose,
    handleProjectModalOpen,
  };
};
