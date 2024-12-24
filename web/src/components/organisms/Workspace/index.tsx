import WorkspaceWrapper from "@reearth-cms/components/molecules/Workspace";

import useHooks from "./hooks";

const Workspace: React.FC = () => {
  const {
    coverImageUrl,
    projects,
    loadingProjects,
    hasCreateRight,
    handleProjectSearch,
    handleProjectCreate,
    handleProjectNavigation,
    handleWorkspaceCreate,
    handleProjectAliasCheck,
  } = useHooks();

  return (
    <WorkspaceWrapper
      coverImageUrl={coverImageUrl}
      projects={projects}
      loadingProjects={loadingProjects}
      hasCreateRight={hasCreateRight}
      onProjectSearch={handleProjectSearch}
      onProjectNavigation={handleProjectNavigation}
      onProjectCreate={handleProjectCreate}
      onWorkspaceCreate={handleWorkspaceCreate}
      onProjectAliasCheck={handleProjectAliasCheck}
    />
  );
};

export default Workspace;
