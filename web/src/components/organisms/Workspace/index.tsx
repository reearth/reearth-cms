import WorkspaceWrapper from "@reearth-cms/components/molecules/Workspace";

import useHooks from "./hooks";

const Workspace: React.FC = () => {
  const {
    coverImageUrl,
    handlePageChange,
    handleProjectAliasCheck,
    handleProjectCreate,
    handleProjectNavigation,
    handleProjectSearch,
    handleProjectSort,
    handleWorkspaceCreate,
    hasCreateRight,
    loading,
    page,
    pageSize,
    privateProjectsAllowed,
    projects,
    projectSort,
    totalCount,
    username,
  } = useHooks();

  return (
    <WorkspaceWrapper
      coverImageUrl={coverImageUrl}
      hasCreateRight={hasCreateRight}
      loading={loading}
      onPageChange={handlePageChange}
      onProjectAliasCheck={handleProjectAliasCheck}
      onProjectCreate={handleProjectCreate}
      onProjectNavigation={handleProjectNavigation}
      onProjectSearch={handleProjectSearch}
      onProjectSort={handleProjectSort}
      onWorkspaceCreate={handleWorkspaceCreate}
      page={page}
      pageSize={pageSize}
      privateProjectsAllowed={privateProjectsAllowed}
      projects={projects}
      projectSort={projectSort}
      totalCount={totalCount}
      username={username}
    />
  );
};

export default Workspace;
