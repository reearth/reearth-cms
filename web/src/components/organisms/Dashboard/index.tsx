import styled from "@emotion/styled";
import { useState } from "react";
import { useParams } from "react-router-dom";

import Header from "@reearth-cms/components/atoms/Header";
import Layout from "@reearth-cms/components/atoms/Layout";
import Sider from "@reearth-cms/components/atoms/Sider";
import MoleculeHeader from "@reearth-cms/components/molecules/Common/Header";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";

import useHooks from "./hooks";

type Props = {
  children?: React.ReactNode;
  defaultSelectedKeys?: string[];
  menuType?: "project" | "workspace";
};

const Dashboard: React.FC<Props> = ({ children, defaultSelectedKeys, menuType }) => {
  const { projectId, workspaceId } = useParams();
  const [collapsed, setCollapsed] = useState(false);

  const {
    user,
    personalWorkspace,
    workspaces,
    currentWorkspace,
    handleWorkspaceCreate,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    workspaceModalShown,
  } = useHooks(workspaceId);

  return (
    <>
      <DashboardLayout>
        <MainHeader>
          <MoleculeHeader
            handleModalOpen={handleWorkspaceModalOpen}
            personalWorkspace={personalWorkspace}
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            user={user}
          />
        </MainHeader>
        <Layout>
          <DashboardSider
            collapsible
            collapsed={collapsed}
            onCollapse={value => setCollapsed(value)}>
            {menuType === "project" ? (
              projectId && (
                <ProjectMenu
                  projectId={projectId}
                  defaultSelectedKeys={defaultSelectedKeys}
                  inlineCollapsed={collapsed}
                  workspaceId={currentWorkspace?.id}
                />
              )
            ) : (
              <WorkspaceMenu
                defaultSelectedKeys={defaultSelectedKeys}
                isPersonalWorkspace={personalWorkspace?.id === currentWorkspace?.id}
                inlineCollapsed={collapsed}
                workspaceId={currentWorkspace?.id}
              />
            )}
          </DashboardSider>
          {children}
        </Layout>
      </DashboardLayout>
      <WorkspaceCreationModal
        open={workspaceModalShown}
        onClose={handleWorkspaceModalClose}
        onSubmit={handleWorkspaceCreate}
      />
    </>
  );
};

const MainHeader = styled(Header)`
  display: flex;
  align-items: center;
  height: 48px;
  line-height: 48px;
`;

const DashboardLayout = styled(Layout)`
  min-height: 100vh;
`;

const DashboardSider = styled(Sider)`
  position: sticky;
  top: 0;
  min-height: 100%;
  max-height: calc(100vh - 48px);
  background-color: #fff;
  .ant-layout-sider-trigger {
    background-color: #fff;
    color: #002140;
    text-align: left;
    padding: 0 24px;
  }
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
`;

export default Dashboard;
