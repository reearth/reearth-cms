import WorkspaceWrapper from "@reearth-cms/components/molecules/Workspace";

import useHooks from "./hooks";

const Workspace: React.FC = () => {
  const {
    projects,
    projectModalShown,
    workspaceModalShown,
    // setCurrentProject,
    handleProjectSearch,
    handleProjectCreate,
    handleProjectModalOpen,
    handleProjectModalClose,
    handleProjectNavigation,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    handleWorkspaceCreate,
  } = useHooks();

  return (
    <WorkspaceWrapper
      projects={projects}
      projectModal={projectModalShown}
      workspaceModal={workspaceModalShown}
      onProjectSearch={handleProjectSearch}
      onProjectModalOpen={handleProjectModalOpen}
      onProjectNavigation={handleProjectNavigation}
      onWorkspaceModalClose={handleWorkspaceModalClose}
      onWorkspaceModalOpen={handleWorkspaceModalOpen}
      onWorkspaceCreate={handleWorkspaceCreate}
      onClose={handleProjectModalClose}
      onSubmit={handleProjectCreate}
    />
  );
};

export default Workspace;
