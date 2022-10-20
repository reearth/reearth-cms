import { useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import SchemaMolecule from "@reearth-cms/components/molecules/Schema";
import FieldCreationModal from "@reearth-cms/components/molecules/Schema/FieldModal/FieldCreationModal";
import FieldUpdateModal from "@reearth-cms/components/molecules/Schema/FieldModal/FieldUpdateModal";

import useHooks from "./hooks";

export type FormValues = {
  name: string;
  description: string;
};

const ProjectSchema: React.FC = () => {
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
      <SchemaMolecule
        collapsed={collapsed}
        model={model}
        onCollapse={collapse}
        selectModel={selectModel}
        onFieldUpdateModalOpen={handleFieldUpdateModalOpen}
        onFieldCreationModalOpen={handleFieldCreationModalOpen}
        onFieldDelete={handleFieldDelete}
      />
      {selectedType && (
        <FieldCreationModal
          selectedType={selectedType}
          open={fieldCreationModalShown}
          handleFieldKeyUnique={handleFieldKeyUnique}
          onClose={handleFieldCreationModalClose}
          onSubmit={handleFieldCreate}
        />
      )}
      {selectedType && (
        <FieldUpdateModal
          selectedType={selectedType}
          open={fieldUpdateModalShown}
          selectedField={selectedField}
          handleFieldKeyUnique={handleFieldKeyUnique}
          onClose={handleFieldUpdateModalClose}
          onSubmit={handleFieldUpdate}
        />
      )}
    </>
  );
};

export default ProjectSchema;
