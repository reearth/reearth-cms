import WorkspaceWrapper from "@reearth-cms/components/molecules/Workspace";

import useHooks from "./hooks";

const Workspace: React.FC = () => {
  const {
    username,
    isFreePlan,
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
      isFreePlan={isFreePlan}
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
