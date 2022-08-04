import styled from "@emotion/styled";
import Layout, { Header, Content } from "antd/lib/layout/layout";
import Sider from "antd/lib/layout/Sider";
import React, { useState } from "react";
import { useParams } from "react-router-dom";

import MoleculeHeader from "@reearth-cms/components/molecules/Common/Header";
import ProjectMenu from "@reearth-cms/components/molecules/Common/projectMenu";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import FieldList from "@reearth-cms/components/molecules/Schema/FieldList";
import ModelCreationModal from "@reearth-cms/components/molecules/Schema/ModelCreationModal";
import SchemaMenu from "@reearth-cms/components/molecules/Schema/SchemaMenu";

import useDashboardHooks from "../../Dashboard/hooks";

import useHooks from "./hooks";

export interface FormValues {
  name: string;
  description: string;
}

const ProjectSchema: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { projectId, workspaceId } = useParams();

  const {
    user,
    personalWorkspace,
    currentWorkspace,
    workspaces,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    workspaceModalShown,
    handleWorkspaceCreate,
  } = useDashboardHooks(workspaceId);

  const { handleModelModalClose, handleModelModalOpen, modelModalShown, models } = useHooks({
    projectId,
  });

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
          />
        </Header>
        <Layout>
          <ProjectSider
            collapsible
            collapsed={collapsed}
            onCollapse={value => setCollapsed(value)}
            style={{ backgroundColor: "#fff" }}>
            <ProjectMenu
              projectId={projectId}
              defaultSelectedKeys={["schema"]}
              inlineCollapsed={collapsed}
              workspaceId={currentWorkspace?.id}
            />
          </ProjectSider>
          <PaddedContent>
            <SchemaStyledMenu>
              <SchemaMenu models={models} handleModalOpen={handleModelModalOpen}></SchemaMenu>
            </SchemaStyledMenu>
            <ContentChild></ContentChild>
            <FieldListWrapper>
              <FieldList></FieldList>
            </FieldListWrapper>
          </PaddedContent>
        </Layout>
      </Layout>
      <WorkspaceCreationModal
        open={workspaceModalShown}
        onClose={handleWorkspaceModalClose}
        onSubmit={handleWorkspaceCreate}
      />
      <ModelCreationModal
        open={modelModalShown}
        onClose={handleModelModalClose}
        onSubmit={() => console.log("create")}
      />
    </>
  );
};

const SchemaStyledMenu = styled.div`
  width: 200px;
  max-width: 200px;
`;

const ContentChild = styled.div`
  flex: 1;
  background-color: #fff;
  padding: 24px;
`;

const PaddedContent = styled(Content)`
  margin: 16px;
  display: flex;
`;

const FieldListWrapper = styled.div`
  flex: 0 0 calc(100% / 3);
  max-width: 300px;
  padding: 12px;
`;

const ProjectSider = styled(Sider)`
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

export default ProjectSchema;
