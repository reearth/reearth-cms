import WorkspaceWrapper from "@reearth-cms/components/molecules/Workspace";

import useHooks from "./hooks";

const Workspace: React.FC = () => {
  const {
    username,
    privateProjectsAllowed,
    coverImageUrl,
    projects,
    loading,
    hasCreateRight,
    page,
    pageSize,
    projectSort,
    totalCount,
    handleProjectSearch,
    handleProjectSort,
    handleProjectCreate,
    handleProjectNavigation,
    handleWorkspaceCreate,
    handleProjectAliasCheck,
    handlePageChange,
  } = useHooks();

  return (
    <WorkspaceWrapper
      username={username}
      privateProjectsAllowed={privateProjectsAllowed}
      coverImageUrl={coverImageUrl}
      projects={projects}
      loading={loading}
      hasCreateRight={hasCreateRight}
      page={page}
      pageSize={pageSize}
      projectSort={projectSort}
      totalCount={totalCount}
      onProjectSearch={handleProjectSearch}
      onProjectSort={handleProjectSort}
      onProjectNavigation={handleProjectNavigation}
      onProjectCreate={handleProjectCreate}
      onWorkspaceCreate={handleWorkspaceCreate}
      onProjectAliasCheck={handleProjectAliasCheck}
      onPageChange={handlePageChange}
    />
  );
};

export default Workspace;
