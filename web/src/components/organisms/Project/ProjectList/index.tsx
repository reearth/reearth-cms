import ProjectCreationModal from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import Dashboard from "@reearth-cms/components/molecules/Dashboard";

import useHooks from "./hooks";

export interface Props {
  handleWorkspaceModalOpen?: () => void;
}

const ProjectList: React.FC<Props> = ({ handleWorkspaceModalOpen }) => {
  const {
    handleProjectSearch,
    handleProjectCreate,
    handleProjectModalClose,
    handleProjectModalOpen,
    projectModalShown,
    projects,
  } = useHooks();

  return (
    <>
      <Dashboard
        handleProjectSearch={handleProjectSearch}
        handleProjectModalOpen={handleProjectModalOpen}
        handleWorkspaceModalOpen={handleWorkspaceModalOpen}
        projects={projects}
      />
      <ProjectCreationModal
        open={projectModalShown}
        onClose={handleProjectModalClose}
        onSubmit={handleProjectCreate}
      />
    </>
  );
};

export default ProjectList;
