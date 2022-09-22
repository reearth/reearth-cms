import ProjectCreationModal from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import ProjectList from "@reearth-cms/components/molecules/ProjectList/ProjectList";
import WorkspaceWrapper from "@reearth-cms/components/molecules/Workspace";
import Greeting from "@reearth-cms/components/molecules/Workspace/Greeting";
import WorkspaceHeader from "@reearth-cms/components/molecules/Workspace/WorkspaceHeader";

import useHooks from "./hooks";

export interface Props {
  handleWorkspaceModalOpen?: () => void;
}

const Workspace: React.FC<Props> = ({ handleWorkspaceModalOpen }) => {
  const {
    handleProjectSearch,
    handleProjectCreate,
    handleProjectModalClose,
    handleProjectModalOpen,
    projectModalShown,
    projects,
  } = useHooks();

  return (
    <WorkspaceWrapper>
      <Greeting />
      <WorkspaceHeader
        handleProjectSearch={handleProjectSearch}
        handleProjectModalOpen={handleProjectModalOpen}
        handleWorkspaceModalOpen={handleWorkspaceModalOpen}
      />
      <ProjectList projects={projects} handleProjectModalOpen={handleProjectModalOpen} />
      <ProjectCreationModal
        open={projectModalShown}
        onClose={handleProjectModalClose}
        onSubmit={handleProjectCreate}
      />
    </WorkspaceWrapper>
  );
};

export default Workspace;
