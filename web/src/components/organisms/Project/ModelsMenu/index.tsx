import { useParams } from "react-router-dom";

import ModelsList from "@reearth-cms/components/molecules/Model/ModelsList/ModelsList";
import ModelCreationModal from "@reearth-cms/components/molecules/Schema/ModelCreationModal";

import useHooks from "./hooks";

export interface Props {
  className?: string;
  title: string;
  collapsed?: boolean;
  onModelSelect: (modelId: string) => void;
}

const ModelsMenu: React.FC<Props> = ({ className, title, collapsed, onModelSelect }) => {
  const { projectId, modelId } = useParams();

  const {
    model,
    models,
    modelModalShown,
    isKeyAvailable,
    handleModalOpen,
    handleModalClose,
    handleModelCreate,
    handleModelKeyCheck,
  } = useHooks({
    projectId,
    modelId,
  });

  return (
    <>
      <ModelsList
        className={className}
        title={title}
        selectedKey={model?.id}
        models={models}
        collapsed={collapsed}
        onModelSelect={onModelSelect}
        onModalOpen={handleModalOpen}
      />
      <ModelCreationModal
        isKeyAvailable={isKeyAvailable}
        projectId={projectId}
        open={modelModalShown}
        onModelKeyCheck={handleModelKeyCheck}
        onClose={handleModalClose}
        onSubmit={handleModelCreate}
      />
    </>
  );
};

export default ModelsMenu;
