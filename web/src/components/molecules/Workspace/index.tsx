import styled from "@emotion/styled";

import ProjectCreationModal, {
  FormValues as ProjectFormValues,
} from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import WorkspaceCreationModal, {
  FormValues as WorkspaceFormValues,
} from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import { UserRights } from "@reearth-cms/components/molecules/Member/types";
import ProjectList from "@reearth-cms/components/molecules/ProjectList/ProjectList";
import Greeting from "@reearth-cms/components/molecules/Workspace/Greeting";
import { Project } from "@reearth-cms/components/molecules/Workspace/types";
import WorkspaceHeader from "@reearth-cms/components/molecules/Workspace/WorkspaceHeader";

type Props = {
  coverImageUrl?: string;
  projects?: Project[];
  projectModal: boolean;
  workspaceModal: boolean;
  loadingProjects: boolean;
  userRights?: UserRights;
  onProjectSearch: (value: string) => void;
  onProjectModalOpen: () => void;
  onProjectNavigation: (project: Project) => void;
  onWorkspaceModalClose: () => void;
  onWorkspaceModalOpen: () => void;
  onWorkspaceCreate: (data: WorkspaceFormValues) => Promise<void>;
  onClose: () => void;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
};

const WorkspaceWrapper: React.FC<Props> = ({
  coverImageUrl,
  projects,
  projectModal,
  workspaceModal,
  loadingProjects,
  userRights,
  onProjectSearch,
  onProjectModalOpen,
  onProjectNavigation,
  onWorkspaceModalClose,
  onWorkspaceModalOpen,
  onWorkspaceCreate,
  onClose,
  onSubmit,
  onProjectAliasCheck,
}) => {
  return (
    <Wrapper>
      <Greeting coverImageUrl={coverImageUrl} />
      <Content>
        <WorkspaceHeader
          userRights={userRights}
          onProjectSearch={onProjectSearch}
          onProjectModalOpen={onProjectModalOpen}
          onWorkspaceModalOpen={onWorkspaceModalOpen}
        />
        <ProjectList
          projects={projects}
          loading={loadingProjects}
          onProjectModalOpen={onProjectModalOpen}
          onProjectNavigation={onProjectNavigation}
        />
        <ProjectCreationModal
          open={projectModal}
          onClose={onClose}
          onSubmit={onSubmit}
          onProjectAliasCheck={onProjectAliasCheck}
        />
      </Content>
      <WorkspaceCreationModal
        open={workspaceModal}
        onClose={onWorkspaceModalClose}
        onSubmit={onWorkspaceCreate}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: #fff;
  margin: 16px;
  min-height: 100%;
`;

const Content = styled.div`
  padding: 32px;
`;

export default WorkspaceWrapper;
