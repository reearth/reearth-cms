import styled from "@emotion/styled";
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Content from "@reearth-cms/components/atoms/Content";
import Header from "@reearth-cms/components/atoms/Header";
import Layout from "@reearth-cms/components/atoms/Layout";
import Sider from "@reearth-cms/components/atoms/Sider";
import MoleculeHeader from "@reearth-cms/components/molecules/Common/Header";
import ProjectMenu from "@reearth-cms/components/molecules/Common/projectMenu";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import FieldList from "@reearth-cms/components/molecules/Schema/FieldList";
import FieldCreationModal from "@reearth-cms/components/molecules/Schema/FieldModal/FieldCreationModal";
import FieldUpdateModal from "@reearth-cms/components/molecules/Schema/FieldModal/FieldUpdateModal";
import ModelCreationModal from "@reearth-cms/components/molecules/Schema/ModelCreationModal";
import ModelFieldList from "@reearth-cms/components/molecules/Schema/ModelFieldList";
import SchemaMenu from "@reearth-cms/components/molecules/Schema/SchemaMenu";

import useDashboardHooks from "../../Dashboard/hooks";

import useHooks from "./hooks";

export interface FormValues {
  name: string;
  description: string;
}

const ProjectSchema: React.FC = () => {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const { projectId, workspaceId, modelId } = useParams();
  const selectModel = (modelId: string) => {
    navigate(`/workspaces/${workspaceId}/${projectId}/schema/${modelId}`);
  };

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

  const {
    handleModelModalClose,
    handleModelModalOpen,
    modelModalShown,
    handleFieldCreationModalClose,
    handleFieldCreationModalOpen,
    handleFieldUpdateModalOpen,
    handleFieldUpdateModalClose,
    fieldCreationModalShown,
    fieldUpdateModalShown,
    handleModelCreate,
    handleFieldCreate,
    handleFieldUpdate,
    selectedField,
    handleFieldDelete,
    handleModelKeyCheck,
    isKeyAvailable,
    models,
    model,
    selectedType,
  } = useHooks({
    projectId,
    modelId,
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
              <SchemaMenu
                selectModel={selectModel}
                defaultSelectedKeys={[model?.id ?? ""]}
                models={models}
                handleModalOpen={handleModelModalOpen}></SchemaMenu>
            </SchemaStyledMenu>
            <ContentChild>
              <ModelTitle>{model?.name}</ModelTitle>
              <ModelFieldList
                handleFieldUpdateModalOpen={handleFieldUpdateModalOpen}
                handleFieldDelete={handleFieldDelete}
                fields={model?.schema.fields}
              />
            </ContentChild>
            <FieldListWrapper>
              <FieldList addField={handleFieldCreationModalOpen} />
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
        isKeyAvailable={isKeyAvailable}
        projectId={projectId}
        handleModelKeyCheck={handleModelKeyCheck}
        open={modelModalShown}
        onClose={handleModelModalClose}
        onSubmit={handleModelCreate}
      />
      {selectedType && (
        <FieldCreationModal
          selectedType={selectedType}
          open={fieldCreationModalShown}
          onClose={handleFieldCreationModalClose}
          onSubmit={handleFieldCreate}
        />
      )}
      {selectedType && (
        <FieldUpdateModal
          selectedType={selectedType}
          open={fieldUpdateModalShown}
          selectedField={selectedField}
          onClose={handleFieldUpdateModalClose}
          onSubmit={handleFieldUpdate}
        />
      )}
    </>
  );
};

const ModelTitle = styled.h1`
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
  color: rgba(0, 0, 0, 0.85);
  margin: 24px 0;
`;

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
