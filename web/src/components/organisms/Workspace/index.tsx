import ProjectCreationModal from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import ProjectList from "@reearth-cms/components/molecules/ProjectList/ProjectList";
import WorkspaceWrapper from "@reearth-cms/components/molecules/Workspace";
import Greeting from "@reearth-cms/components/molecules/Workspace/Greeting";
import WorkspaceHeader from "@reearth-cms/components/molecules/Workspace/WorkspaceHeader";

import useHooks from "./hooks";

export type Props = {
  onWorkspaceModalOpen?: () => void;
};

const Workspace: React.FC<Props> = ({ onWorkspaceModalOpen }) => {
  const {
    handleProjectSearch,
    handleProjectCreate,
    handleProjectModalClose,
    handleProjectModalOpen,
    projectModalShown,
    projects,
    handleProjectSettingsNavigation,
  } = useHooks();

  return (
    <WorkspaceWrapper>
      <Greeting />
      <WorkspaceHeader
        onProjectSearch={handleProjectSearch}
        onProjectModalOpen={handleProjectModalOpen}
        onWorkspaceModalOpen={onWorkspaceModalOpen}
      />
      <ProjectList
        projects={projects}
        onProjectModalOpen={handleProjectModalOpen}
        onProjectSettingsNavigation={handleProjectSettingsNavigation}
      />
      <ProjectCreationModal
        open={projectModalShown}
        onClose={handleProjectModalClose}
        onSubmit={handleProjectCreate}
      />
    </WorkspaceWrapper>
  );
};

export default Workspace;
