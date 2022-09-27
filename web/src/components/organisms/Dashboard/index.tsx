import styled from "@emotion/styled";
import { JSXElementConstructor, ReactElement, useState, cloneElement } from "react";
import { useParams } from "react-router-dom";

import Content from "@reearth-cms/components/atoms/Content";
import Header from "@reearth-cms/components/atoms/Header";
import Layout from "@reearth-cms/components/atoms/Layout";
import Sider from "@reearth-cms/components/atoms/Sider";
import MoleculeHeader from "@reearth-cms/components/molecules/Common/Header";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";

import useHooks from "./hooks";

type Props = {
  children: ReactElement<any, string | JSXElementConstructor<any>>;
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
          <PaddedContent>{cloneElement(children, { handleWorkspaceModalOpen })}</PaddedContent>
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

const PaddedContent = styled(Content)`
  margin: 16px;
`;

export default Dashboard;
