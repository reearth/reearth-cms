import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { FormValues as ProjectFormValues } from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import { FormValues as WorkspaceFormValues } from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import { SortBy } from "@reearth-cms/components/molecules/Workspace/types";
import { fromGraphQLProject } from "@reearth-cms/components/organisms/DataConverters/project";
import { fromGraphQLWorkspace } from "@reearth-cms/components/organisms/DataConverters/setting";
import {
  Project as GQLProject,
  useCheckProjectAliasLazyQuery,
  useCheckProjectLimitsQuery,
  useCreateProjectMutation,
  useCreateWorkspaceMutation,
  useGetMeQuery,
  useGetProjectsQuery,
  Workspace as GQLWorkspace,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useUserRights, useWorkspace } from "@reearth-cms/state";

const INITIAL_PAGE = 1;
const INITIAL_PAGE_SIZE = 10;
const INITIAL_PAGE_SORT: SortBy = "updatedat";
const INITIAL_SEARCH_TERM = "";

export default () => {
  const t = useT();
  const navigate = useNavigate();
  const coverImageUrl = window.REEARTH_CONFIG?.coverImageUrl;

  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();

  const location: {
    state?: {
      searchTerm?: string;
      sort: SortBy;
      page: number;
      pageSize: number;
    } | null;
  } = useLocation();

  const [searchedProjectName, setSearchedProjectName] = useState<string>(
    location?.state?.searchTerm ?? INITIAL_SEARCH_TERM,
  );
  const [projectSort, setProjectSort] = useState<SortBy>(
    location?.state?.sort ?? INITIAL_PAGE_SORT,
  );
  const [page, setPage] = useState(location.state?.page ?? INITIAL_PAGE);
  const [pageSize, setPageSize] = useState(location.state?.pageSize ?? INITIAL_PAGE_SIZE);

  const [userRights] = useUserRights();
  const hasCreateRight = useMemo(() => !!userRights?.project.create, [userRights?.project.create]);

  const workspaceId = currentWorkspace?.id;

  const { data: meData } = useGetMeQuery();
  const username = useMemo(() => meData?.me?.name || "", [meData?.me?.name]);

  const {
    data,
    loading,
    refetch: projectsRefetch,
  } = useGetProjectsQuery({
    variables: {
      workspaceId: workspaceId ?? "",
      keyword: searchedProjectName,
      sort: { key: projectSort, reverted: projectSort !== "name" },
      pagination: { first: pageSize, offset: (page - 1) * pageSize },
    },
    skip: !workspaceId,
  });

  const projects = useMemo(
    () =>
      data?.projects.nodes
        .map(project => (project ? fromGraphQLProject(project as GQLProject) : undefined))
        .filter(project => !!project) ?? [],
    [data?.projects.nodes],
  );

  const [createNewProject] = useCreateProjectMutation({
    refetchQueries: ["GetProjects"],
  });

  const handleProjectSearch = useCallback(
    (value: string) => {
      setPage(INITIAL_PAGE);
      setProjectSort(INITIAL_PAGE_SORT);
      setSearchedProjectName(value);
    },
    [setSearchedProjectName],
  );

  const handleProjectSort = useCallback(
    (sort: SortBy) => {
      setPage(INITIAL_PAGE);
      setProjectSort(sort);
    },
    [setProjectSort],
  );

  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
  }, []);

  const handleProjectCreate = useCallback(
    async (data: ProjectFormValues) => {
      if (!workspaceId) throw new Error();
      const project = await createNewProject({
        variables: {
          workspaceId,
          name: data.name,
          alias: data.alias,
          description: data.description,
          visibility: data.visibility,
          license: data.license,
        },
      });
      if (project.errors || !project.data?.createProject) {
        Notification.error({ message: t("Failed to create project.") });
        throw new Error();
      }
      Notification.success({ message: t("Successfully created project!") });
      setPage(INITIAL_PAGE);
      setProjectSort(INITIAL_PAGE_SORT);
      projectsRefetch();
    },
    [createNewProject, workspaceId, projectsRefetch, t],
  );

  const handleProjectNavigation = useCallback(
    (projectId: string) => {
      if (!workspaceId || !projectId) return;
      navigate(`/workspace/${workspaceId}/project/${projectId}`);
    },
    [workspaceId, navigate],
  );

  const [createWorkspaceMutation] = useCreateWorkspaceMutation({
    refetchQueries: ["GetMe"],
  });
  const handleWorkspaceCreate = useCallback(
    async (data: WorkspaceFormValues) => {
      const results = await createWorkspaceMutation({
        variables: { name: data.name },
      });
      if (results.data?.createWorkspace) {
        Notification.success({ message: t("Successfully created workspace!") });
        setCurrentWorkspace(
          fromGraphQLWorkspace(results.data.createWorkspace.workspace as GQLWorkspace),
        );
        navigate(`/workspace/${results.data.createWorkspace.workspace.id}`);
      }
      setPage(INITIAL_PAGE);
      setProjectSort(INITIAL_PAGE_SORT);
      projectsRefetch();
    },
    [createWorkspaceMutation, setCurrentWorkspace, projectsRefetch, navigate, t],
  );

  const [CheckProjectAlias] = useCheckProjectAliasLazyQuery({
    fetchPolicy: "no-cache",
  });

  const handleProjectAliasCheck = useCallback(
    async (alias: string) => {
      if (!alias) return false;

      if (!workspaceId) {
        throw new Error("Workspace ID is required to check project alias");
      }
      const response = await CheckProjectAlias({ variables: { workspaceId, alias } });
      return response.data ? response.data.checkProjectAlias.available : false;
    },
    [CheckProjectAlias, workspaceId],
  );

  const { data: projectLimitsData } = useCheckProjectLimitsQuery({
    variables: { workspaceId: workspaceId ?? "" },
    skip: !workspaceId,
  });

  const privateProjectsAllowed = useMemo(() => {
    return projectLimitsData?.checkWorkspaceProjectLimits?.privateProjectsAllowed ?? false;
  }, [projectLimitsData]);

  return {
    username,
    privateProjectsAllowed,
    coverImageUrl,
    projects,
    loading,
    hasCreateRight,
    page,
    pageSize,
    projectSort,
    totalCount: data?.projects.totalCount ?? 0,
    handleProjectSearch,
    handleProjectSort,
    handleProjectCreate,
    handleProjectNavigation,
    handleWorkspaceCreate,
    handleProjectAliasCheck,
    projectsRefetch,
    handlePageChange,
  };
};
