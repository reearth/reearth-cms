import { useParams } from "react-router-dom";

import Groups from "@reearth-cms/components/molecules/Model/ModelsList/Groups";
import ModelListHeader from "@reearth-cms/components/molecules/Model/ModelsList/ModelListHeader";
import Models from "@reearth-cms/components/molecules/Model/ModelsList/Models";
import { SelectedSchemaType } from "@reearth-cms/components/molecules/Schema";

import useHooks from "./hooks";

export interface Props {
  className?: string;
  title: string;
  collapsed?: boolean;
  groupId?: string;
  selectedSchemaType?: SelectedSchemaType;
  displayGroups?: boolean;
  onModelSelect: (modelId: string) => void;
  onGroupSelect?: (groupId: string) => void;
}

const ModelsMenu: React.FC<Props> = ({
  className,
  title,
  collapsed,
  groupId,
  selectedSchemaType,
  displayGroups,
  onModelSelect,
  onGroupSelect,
}) => {
  const { modelId } = useParams();

  const {
    model,
    models,
    group,
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
    handleGroupCreate,
    handleModelKeyCheck,
    handleGroupKeyCheck,
  } = useHooks({
    modelId,
    groupId,
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
        selectedSchemaType={selectedSchemaType}
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
          selectedKey={group?.id}
          groups={groups}
          selectedSchemaType={selectedSchemaType}
          onGroupSelect={onGroupSelect}
          onModalOpen={handleGroupModalOpen}
          isKeyAvailable={isGroupKeyAvailable}
          open={groupModalShown}
          onGroupKeyCheck={handleGroupKeyCheck}
          onClose={handleGroupModalClose}
          onCreate={handleGroupCreate}
        />
      )}
    </>
  );
};

export default ModelsMenu;
