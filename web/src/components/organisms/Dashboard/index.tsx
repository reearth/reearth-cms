import styled from "@emotion/styled";
import MoleculeHeader from "@reearth-cms/components/molecules/Common/Header";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import Layout, { Content, Header } from "antd/lib/layout/layout";
import Sider from "antd/lib/layout/Sider";
import React, { useState } from "react";
import { useParams } from "react-router-dom";

import useHooks from "./hooks";

type Props = {
  children?: React.ReactNode;
  defaultSelectedKeys?: string[];
};

const Dashboard: React.FC<Props> = ({ children, defaultSelectedKeys }) => {
  const { workspaceId } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const {
    user,
    personalWorkspace,
    workspaces,
    currentWorkspace,
    handleWorkspaceCreate,
    handleModalClose,
    handleModalOpen,
    modalShown,
  } = useHooks(workspaceId);

  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <MainHeader>
          <MoleculeHeader
            handleModalOpen={handleModalOpen}
            personalWorkspace={personalWorkspace}
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            user={user}
          ></MoleculeHeader>
        </MainHeader>
        <Layout>
          <DashboardSider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
          >
            <WorkspaceMenu
              defaultSelectedKeys={defaultSelectedKeys}
              isPersonalWorkspace={
                personalWorkspace?.id === currentWorkspace?.id
              }
              inlineCollapsed={collapsed}
              workspaceId={currentWorkspace?.id}
            ></WorkspaceMenu>
          </DashboardSider>
          <PaddedContent>{children}</PaddedContent>
        </Layout>
      </Layout>
      <WorkspaceCreationModal
        open={modalShown}
        onClose={handleModalClose}
        onSubmit={handleWorkspaceCreate}
      ></WorkspaceCreationModal>
    </>
  );
};

const MainHeader = styled(Header)`
  display: flex;
  align-items: center;
  height: 48px;
  line-height: 48px;
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
  background-color: #fff;
`;

export default Dashboard;
