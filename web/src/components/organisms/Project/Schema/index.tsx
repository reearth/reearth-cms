import styled from "@emotion/styled";
import React, { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Content from "@reearth-cms/components/atoms/Content";
import FieldList from "@reearth-cms/components/molecules/Schema/FieldList";
import FieldCreationModal from "@reearth-cms/components/molecules/Schema/FieldModal/FieldCreationModal";
import FieldUpdateModal from "@reearth-cms/components/molecules/Schema/FieldModal/FieldUpdateModal";
import ModelFieldList from "@reearth-cms/components/molecules/Schema/ModelFieldList";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

export interface FormValues {
  name: string;
  description: string;
}

const ProjectSchema: React.FC = () => {
  const t = useT();
  const navigate = useNavigate();

  const { projectId, workspaceId, modelId } = useParams();

  const selectModel = useCallback(
    (modelId: string) => {
      navigate(`/workspaces/${workspaceId}/${projectId}/schema/${modelId}`);
    },
    [navigate, workspaceId, projectId],
  );

  const {
    handleFieldCreationModalClose,
    handleFieldCreationModalOpen,
    handleFieldUpdateModalOpen,
    handleFieldUpdateModalClose,
    fieldCreationModalShown,
    fieldUpdateModalShown,
    handleFieldCreate,
    handleFieldKeyUnique,
    handleFieldUpdate,
    selectedField,
    handleFieldDelete,
    model,
    selectedType,
  } = useHooks({
    projectId,
    modelId,
  });

  return (
    <>
      <PaddedContent>
        <StyledModelsMenu title={t("Models")} selectModel={selectModel} />
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

const ModelTitle = styled.h1`
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
  color: rgba(0, 0, 0, 0.85);
  margin: 24px 0;
`;

const StyledModelsMenu = styled(ModelsMenu)`
  width: 200px;
`;

const ContentChild = styled.div`
  flex: 1;
  background-color: #fff;
  padding: 24px;
`;

const PaddedContent = styled(Content)`
  margin: 16px;
  display: flex;
  min-height: 100%;
`;

const FieldListWrapper = styled.div`
  flex: 0 0 calc(100% / 3);
  max-width: 300px;
  padding: 12px;
`;

export default ProjectSchema;
