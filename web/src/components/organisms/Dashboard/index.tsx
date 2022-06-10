import { PlusOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import Button from "@reearth-cms/components/atoms/Button";
import MoleculeHeader from "@reearth-cms/components/molecules/Common/Header";
import ProjectCreationModal from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import ProjectList from "@reearth-cms/components/molecules/Dashboard/ProjectList";
import Search from "antd/lib/input/Search";
import Layout, { Content, Header } from "antd/lib/layout/layout";
import Sider from "antd/lib/layout/Sider";
import React, { useState } from "react";
import { useParams } from "react-router-dom";

import useHooks from "./hooks";

export type Props = {
  workspaceId?: string;
};

const Dashboard: React.FC<Props> = () => {
  const { workspaceId } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const {
    user,
    projects,
    personalWorkspace,
    workspaces,
    currentWorkspace,
    handleWorkspaceCreate,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    workspaceModalShown,
    handleProjectModalClose,
    handleProjectModalOpen,
    projectModalShown,
    handleProjectCreate,
  } = useHooks(workspaceId);

  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <Header>
          <MoleculeHeader
            handleModalOpen={handleWorkspaceModalOpen}
            personalWorkspace={personalWorkspace}
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            user={user}
          ></MoleculeHeader>
        </Header>
        <Layout>
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            style={{ backgroundColor: "#fff" }}
          >
            <WorkspaceMenu
              defaultSelectedKeys={["home"]}
              isPersonalWorkspace={
                personalWorkspace?.id === currentWorkspace?.id
              }
              inlineCollapsed={collapsed}
              workspaceId={currentWorkspace?.id}
            ></WorkspaceMenu>
          </Sider>
          <PaddedContent>
            <DashboardCard>Welcome to Re:Earth CMS !</DashboardCard>
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
            <ProjectContainer>
              <ProjectList projects={projects} />
            </ProjectContainer>
          </PaddedContent>
        </Layout>
      </Layout>
      <WorkspaceCreationModal
        open={workspaceModalShown}
        onClose={handleWorkspaceModalClose}
        onSubmit={handleWorkspaceCreate}
      ></WorkspaceCreationModal>
      <ProjectCreationModal
        open={projectModalShown}
        onClose={handleProjectModalClose}
        onSubmit={handleProjectCreate}
      ></ProjectCreationModal>
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

const ProjectContainer = styled(Content)`
  padding: 16px;
  margin: 16px;
  border: 1px solid #d9d9d9;
`;

const DashboardCard = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 24px;

  height: 121px;

  background: linear-gradient(
    79.71deg,
    #1e2086 0%,
    #df3013 66.79%,
    #df3013 93.02%
  );
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
  color: #fff;
`;

const ButtonWrapper = styled.div`
  Button + Button {
    margin-left: 8px;
  }
`;

export default Dashboard;
