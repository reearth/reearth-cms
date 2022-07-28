import styled from "@emotion/styled";
import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import ProjectCreationModal from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import Greeting from "@reearth-cms/components/molecules/Dashboard/Greeting";
import ProjectList from "@reearth-cms/components/molecules/Dashboard/ProjectList";
import { Content } from "antd/lib/layout/layout";
import { useParams } from "react-router-dom";

import useDashboardHooks from "../Dashboard/hooks";

import useHooks from "./hooks";

const Project: React.FC = () => {
  const { Search } = Input;
  const { workspaceId } = useParams();

  const {
    handleProjectSearch,
    handleProjectCreate,
    handleProjectModalClose,
    handleProjectModalOpen,
    projectModalShown,
    projects,
  } = useHooks();

  const {
    handleWorkspaceCreate,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    workspaceModalShown,
  } = useDashboardHooks(workspaceId);

  return (
    <>
      <PaddedContent>
        <Greeting></Greeting>
        <ActionHeader>
          <Search
            onSearch={handleProjectSearch}
            placeholder="input search text"
            allowClear
            type="text"
            style={{ width: 264 }}
          />
          <ButtonWrapper>
            <Button onClick={handleWorkspaceModalOpen}>
              Create a Workspace
            </Button>
            <Button
              onClick={handleProjectModalOpen}
              type="primary"
              icon={<Icon icon="plus" />}
            >
              New Project
            </Button>
          </ButtonWrapper>
        </ActionHeader>
        <ProjectList
          projects={projects}
          workspaceId={workspaceId}
          handleProjectModalOpen={handleProjectModalOpen}
        />
      </PaddedContent>
      <ProjectCreationModal
        open={projectModalShown}
        onClose={handleProjectModalClose}
        onSubmit={handleProjectCreate}
      />
      <WorkspaceCreationModal
        open={workspaceModalShown}
        onClose={handleWorkspaceModalClose}
        onSubmit={handleWorkspaceCreate}
      />
    </>
  );
};

const PaddedContent = styled(Content)`
  margin: 16px;
  background-color: #fff;
`;

const ActionHeader = styled(Content)`
  max-width: 1200px;
  margin: auto;
  padding: 16px;
  display: flex;
  justify-content: space-between;
`;

const ButtonWrapper = styled.div`
  Button + Button {
    margin-left: 8px;
  }
`;

export default Project;
