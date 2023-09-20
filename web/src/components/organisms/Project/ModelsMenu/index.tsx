import { useParams } from "react-router-dom";

import Groups from "@reearth-cms/components/molecules/Model/ModelsList/Groups";
import ModelListHeader from "@reearth-cms/components/molecules/Model/ModelsList/ModelListHeader";
import Models from "@reearth-cms/components/molecules/Model/ModelsList/Models";

import useHooks from "./hooks";

export interface Props {
  className?: string;
  title: string;
  collapsed?: boolean;
  displayGroups?: boolean;
  onModelSelect: (modelId: string) => void;
  onGroupSelect?: (groupId: string) => void;
}

const ModelsMenu: React.FC<Props> = ({
  className,
  title,
  collapsed,
  displayGroups,
  onModelSelect,
  onGroupSelect,
}) => {
  const { modelId } = useParams();

  const {
    model,
    models,
    groups,
    modelModalShown,
    groupModalShown,
    isModelKeyAvailable,
    isGroupKeyAvailable,
    handleModelModalOpen,
    handleModelModalClose,
    handleGroupModalOpen,
    handleGroupModalClose,
    handleModelCreate,
    handleModelKeyCheck,
    handleGroupKeyCheck,
  } = useHooks({
    modelId,
  });

  return (
    <>
      <ModelListHeader title={title} collapsed={collapsed} />
      <Models
        className={className}
        title={title}
        collapsed={collapsed}
        selectedKey={model?.id}
        models={models}
        onModelSelect={onModelSelect}
        onModalOpen={handleModelModalOpen}
        isKeyAvailable={isModelKeyAvailable}
        open={modelModalShown}
        onModelKeyCheck={handleModelKeyCheck}
        onClose={handleModelModalClose}
        onCreate={handleModelCreate}
      />
      {displayGroups && (
        <Groups
          className={className}
          title={title}
          collapsed={collapsed}
          selectedKey={model?.id}
          groups={groups}
          onGroupSelect={onGroupSelect}
          onModalOpen={handleGroupModalOpen}
          isKeyAvailable={isGroupKeyAvailable}
          open={groupModalShown}
          onGroupKeyCheck={handleGroupKeyCheck}
          onClose={handleGroupModalClose}
          onCreate={handleModelCreate}
        />
      )}
    </>
  );
};

export default ModelsMenu;
