import { useParams } from "react-router-dom";

import ModelsList from "@reearth-cms/components/molecules/Model/ModelsList/ModelsList";
import ModelCreationModal from "@reearth-cms/components/molecules/Schema/ModelCreationModal";

import useHooks from "./hooks";

export interface Props {
  className?: string;
  title: string;
  collapsed?: boolean;
  selectModel: (modelId: string) => void;
}

const ModelsMenu: React.FC<Props> = ({ className, title, collapsed, selectModel }) => {
  const { projectId, modelId } = useParams();

  const {
    modelModalShown,
    isKeyAvailable,
    models,
    model,
    handleModelModalClose,
    handleModelModalOpen,
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
        selectModel={selectModel}
        onModalOpen={handleModelModalOpen}
      />
      <ModelCreationModal
        isKeyAvailable={isKeyAvailable}
        projectId={projectId}
        open={modelModalShown}
        onModelKeyCheck={handleModelKeyCheck}
        onClose={handleModelModalClose}
        onSubmit={handleModelCreate}
      />
    </>
  );
};

export default ModelsMenu;
