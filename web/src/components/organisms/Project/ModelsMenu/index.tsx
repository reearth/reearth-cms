import { useParams } from "react-router-dom";

import ModelsList from "@reearth-cms/components/molecules/Model/ModelsList/ModelsList";
import ModelCreationModal from "@reearth-cms/components/molecules/Schema/ModelCreationModal";

import useHooks from "./hooks";

export interface Props {
  title: string;
  selectModel: (modelId: string, schemaID?: string) => void;
}

const ModelsMenu: React.FC<Props> = ({ title, selectModel }) => {
  const { projectId, modelId } = useParams();

  const {
    handleModelModalClose,
    handleModelModalOpen,
    modelModalShown,
    handleModelCreate,
    handleModelKeyCheck,
    isKeyAvailable,
    models,
    model,
  } = useHooks({
    projectId,
    modelId,
  });

  return (
    <>
      <ModelsList
        title={title}
        selectModel={selectModel}
        defaultSelectedKeys={[model?.id ?? ""]}
        models={models}
        handleModalOpen={handleModelModalOpen}
      />
      <ModelCreationModal
        isKeyAvailable={isKeyAvailable}
        projectId={projectId}
        handleModelKeyCheck={handleModelKeyCheck}
        open={modelModalShown}
        onClose={handleModelModalClose}
        onSubmit={handleModelCreate}
      />
    </>
  );
};

export default ModelsMenu;
