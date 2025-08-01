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
    handleProjectSearch,
    handleProjectSort,
    handleProjectCreate,
    handleProjectNavigation,
    handleWorkspaceCreate,
    handleProjectAliasCheck,
  } = useHooks();

  return (
    <WorkspaceWrapper
      username={username}
      privateProjectsAllowed={privateProjectsAllowed}
      coverImageUrl={coverImageUrl}
      projects={projects}
      loading={loading}
      hasCreateRight={hasCreateRight}
      onProjectSearch={handleProjectSearch}
      onProjectSort={handleProjectSort}
      onProjectNavigation={handleProjectNavigation}
      onProjectCreate={handleProjectCreate}
      onWorkspaceCreate={handleWorkspaceCreate}
      onProjectAliasCheck={handleProjectAliasCheck}
    />
  );
};

export default Workspace;
