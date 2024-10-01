import WorkspaceWrapper from "@reearth-cms/components/molecules/Workspace";

import useHooks from "./hooks";

const Workspace: React.FC = () => {
  const {
    coverImageUrl,
    projects,
    projectModalShown,
    loadingProjects,
    workspaceModalShown,
    handleProjectSearch,
    handleProjectCreate,
    handleProjectModalOpen,
    handleProjectModalClose,
    handleProjectNavigation,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    handleWorkspaceCreate,
    handleProjectAliasCheck,
  } = useHooks();

  return (
    <WorkspaceWrapper
      coverImageUrl={coverImageUrl}
      projects={projects}
      projectModal={projectModalShown}
      workspaceModal={workspaceModalShown}
      loadingProjects={loadingProjects}
      onProjectSearch={handleProjectSearch}
      onProjectModalOpen={handleProjectModalOpen}
      onProjectNavigation={handleProjectNavigation}
      onWorkspaceModalClose={handleWorkspaceModalClose}
      onWorkspaceModalOpen={handleWorkspaceModalOpen}
      onWorkspaceCreate={handleWorkspaceCreate}
      onClose={handleProjectModalClose}
      onSubmit={handleProjectCreate}
      onProjectAliasCheck={handleProjectAliasCheck}
    />
  );
};

export default Workspace;
