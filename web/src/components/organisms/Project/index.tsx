import { PlusOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import Button from "@reearth-cms/components/atoms/Button";
import Search from "@reearth-cms/components/atoms/Search";
import ProjectCreationModal from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import Greeting from "@reearth-cms/components/molecules/Dashboard/Greeting";
import ProjectList from "@reearth-cms/components/molecules/Dashboard/ProjectList";
import { Content } from "antd/lib/layout/layout";
import { useParams } from "react-router-dom";

import useDashboardHooks from "../Dashboard/hooks";

import useHooks from "./hooks";

const Project: React.FC = () => {
  const { workspaceId } = useParams();

  const {
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
            placeholder="input search text"
            allowClear
            style={{ width: 264 }}
          />
          <ButtonWrapper>
            <Button onClick={handleWorkspaceModalOpen}>
              Create a Workspace
            </Button>
            <Button
              onClick={handleProjectModalOpen}
              type="primary"
              icon={<PlusOutlined />}
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
