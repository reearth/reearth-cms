import styled from "@emotion/styled";
import { useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Icon from "@reearth-cms/components/atoms/Icon";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import Sider from "@reearth-cms/components/atoms/Sider";
import FieldList from "@reearth-cms/components/molecules/Schema/FieldList";
import FieldCreationModal from "@reearth-cms/components/molecules/Schema/FieldModal/FieldCreationModal";
import FieldUpdateModal from "@reearth-cms/components/molecules/Schema/FieldModal/FieldUpdateModal";
import ModelFieldList from "@reearth-cms/components/molecules/Schema/ModelFieldList";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

export type FormValues = {
  name: string;
  description: string;
};

const ProjectSchema: React.FC = () => {
  const t = useT();
  const navigate = useNavigate();
  const [collapsed, collapse] = useState(false);

  const { projectId, workspaceId, modelId } = useParams();

  const selectModel = useCallback(
    (modelId: string) => {
      navigate(`/workspace/${workspaceId}/project/${projectId}/schema/${modelId}`);
    },
    [navigate, workspaceId, projectId],
  );

  const {
    fieldCreationModalShown,
    fieldUpdateModalShown,
    selectedField,
    model,
    selectedType,
    handleFieldCreationModalClose,
    handleFieldCreationModalOpen,
    handleFieldUpdateModalOpen,
    handleFieldUpdateModalClose,
    handleFieldCreate,
    handleFieldKeyUnique,
    handleFieldUpdate,
    handleFieldDelete,
  } = useHooks({
    projectId,
    modelId,
  });

  return (
    <>
      <ComplexInnerContents
        left={
          <Sidebar
            collapsible
            collapsed={collapsed}
            onCollapse={collapse}
            collapsedWidth={54}
            width={208}
            trigger={<Icon icon={collapsed ? "modelMenuOpen" : "modelMenuClose"} />}>
            <ModelsMenu title={t("Schema")} collapsed={collapsed} selectModel={selectModel} />
          </Sidebar>
        }
        center={
          <Content>
            {model?.name && (
              <TitleWrapper>
                <ModelTitle>{model.name}</ModelTitle>
              </TitleWrapper>
            )}
            <ModelFieldListWrapper>
              <ModelFieldList
                handleFieldUpdateModalOpen={handleFieldUpdateModalOpen}
                handleFieldDelete={handleFieldDelete}
                fields={model?.schema.fields}
              />
            </ModelFieldListWrapper>
          </Content>
        }
        right={
          <FieldListWrapper>
            <FieldList addField={handleFieldCreationModalOpen} />
          </FieldListWrapper>
        }
      />
      {selectedType && (
        <FieldCreationModal
          handleFieldKeyUnique={handleFieldKeyUnique}
          selectedType={selectedType}
          open={fieldCreationModalShown}
          onClose={handleFieldCreationModalClose}
          onSubmit={handleFieldCreate}
        />
      )}
      {selectedType && (
        <FieldUpdateModal
          handleFieldKeyUnique={handleFieldKeyUnique}
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

const ModelTitle = styled.p`
  font-weight: 500;
  font-size: 20px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.85);
  word-break: break-all;
  width: 100%;
  margin: 0;
`;

const TitleWrapper = styled.div`
  display: flex;
  padding: 22px 24px;
  background-color: #fff;
`;

const Content = styled.div`
  width: 100%;
  background: #fafafa;
`;

const ModelFieldListWrapper = styled.div`
  padding: 24px;
`;

const FieldListWrapper = styled.div`
  height: 100%;
  width: 272px;
  padding: 12px;
  overflow-y: auto;
`;

const Sidebar = styled(Sider)`
  background-color: #fff;

  .ant-layout-sider-trigger {
    background-color: #fff;
    border-top: 1px solid #f0f0f0;
    border-right: 1px solid #f0f0f0;
    color: #002140;
    text-align: left;
    padding: 0 20px;
    margin: 0;
    height: 38px;
    line-height: 38px;
    cursor: pointer;
  }
  .ant-layout-sider-children {
    height: calc(100% + 12px);
  }
  .ant-menu-inline {
    border-right: 1px solid white;

    & > li {
      padding: 0 20px;
    }
  }
  .ant-menu-vertical {
    border-right: none;
  }
`;

export default ProjectSchema;
