import { useParams } from "react-router-dom";

import Groups from "@reearth-cms/components/molecules/Model/ModelsList/Groups";
import ModelListBody from "@reearth-cms/components/molecules/Model/ModelsList/ModelListBody";
import ModelListHeader from "@reearth-cms/components/molecules/Model/ModelsList/ModelListHeader";
import Models from "@reearth-cms/components/molecules/Model/ModelsList/Models";
import { SelectedSchemaType } from "@reearth-cms/components/molecules/Schema/types";

import useHooks from "./hooks";

type Props = {
  title: string;
  collapsed: boolean;
  selectedSchemaType: SelectedSchemaType;
  displayGroups?: boolean;
  titleIcon: string;
  onModelSelect: (modelId: string) => void;
  onGroupSelect?: (groupId: string) => void;
};

const ModelsMenu: React.FC<Props> = ({
  title,
  collapsed,
  selectedSchemaType,
  displayGroups,
  titleIcon,
  onModelSelect,
  onGroupSelect,
}) => {
  const { modelId: schemaId } = useParams();

  const {
    models,
    groups,
    modelModalShown,
    groupModalShown,
    hasCreateRight,
    hasUpdateRight,
    handleModelModalOpen,
    handleModelModalClose,
    handleGroupModalOpen,
    handleGroupModalClose,
    handleModelCreate,
    handleGroupCreate,
    handleModelKeyCheck,
    handleGroupKeyCheck,
    handleUpdateModelsOrder,
    handleUpdateGroupsOrder,
  } = useHooks({
    modelId: selectedSchemaType === "model" ? schemaId : undefined,
  });

  return (
    <>
      <ModelListHeader title={title} collapsed={collapsed} titleIcon={titleIcon} />
      <ModelListBody collapsed={collapsed}>
        <Models
          title={title}
          collapsed={collapsed}
          selectedKey={schemaId}
          models={models}
          open={modelModalShown}
          hasCreateRight={hasCreateRight}
          hasUpdateRight={hasUpdateRight}
          onModalOpen={handleModelModalOpen}
          onModelSelect={onModelSelect}
          onModelKeyCheck={handleModelKeyCheck}
          onClose={handleModelModalClose}
          onCreate={handleModelCreate}
          onUpdateModelsOrder={handleUpdateModelsOrder}
        />
        {displayGroups && (
          <Groups
            title={title}
            collapsed={collapsed}
            selectedKey={schemaId}
            groups={groups}
            open={groupModalShown}
            hasCreateRight={hasCreateRight}
            hasUpdateRight={hasUpdateRight}
            onModalOpen={handleGroupModalOpen}
            onGroupKeyCheck={handleGroupKeyCheck}
            onClose={handleGroupModalClose}
            onCreate={handleGroupCreate}
            onGroupSelect={onGroupSelect}
            onUpdateGroupsOrder={handleUpdateGroupsOrder}
          />
        )}
      </ModelListBody>
    </>
  );
};

export default ModelsMenu;
