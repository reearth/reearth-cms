import { useParams } from "react-router-dom";

import Groups from "@reearth-cms/components/molecules/Model/ModelsList/Groups";
import ModelListBody from "@reearth-cms/components/molecules/Model/ModelsList/ModelListBody";
import ModelListHeader from "@reearth-cms/components/molecules/Model/ModelsList/ModelListHeader";
import Models from "@reearth-cms/components/molecules/Model/ModelsList/Models";
import { SelectedSchemaType } from "@reearth-cms/components/molecules/Schema/types";

import useHooks from "./hooks";

type Props = {
  collapsed: boolean;
  displayGroups?: boolean;
  onGroupSelect?: (groupId: string) => void;
  onModelSelect: (modelId: string) => void;
  selectedSchemaType: SelectedSchemaType;
  title: string;
  titleIcon: string;
};

const ModelsMenu: React.FC<Props> = ({
  collapsed,
  displayGroups,
  onGroupSelect,
  onModelSelect,
  selectedSchemaType,
  title,
  titleIcon,
}) => {
  const { modelId: schemaId } = useParams();

  const {
    groupModalShown,
    groups,
    handleGroupCreate,
    handleGroupKeyCheck,
    handleGroupModalClose,
    handleGroupModalOpen,
    handleModelCreate,
    handleModelKeyCheck,
    handleModelModalClose,
    handleModelModalOpen,
    handleUpdateGroupsOrder,
    handleUpdateModelsOrder,
    hasCreateRight,
    hasUpdateRight,
    modelModalShown,
    models,
  } = useHooks({
    modelId: selectedSchemaType === "model" ? schemaId : undefined,
  });

  return (
    <>
      <ModelListHeader collapsed={collapsed} title={title} titleIcon={titleIcon} />
      <ModelListBody collapsed={collapsed}>
        <Models
          collapsed={collapsed}
          hasCreateRight={hasCreateRight}
          hasUpdateRight={hasUpdateRight}
          models={models}
          onClose={handleModelModalClose}
          onCreate={handleModelCreate}
          onModalOpen={handleModelModalOpen}
          onModelKeyCheck={handleModelKeyCheck}
          onModelSelect={onModelSelect}
          onUpdateModelsOrder={handleUpdateModelsOrder}
          open={modelModalShown}
          selectedKey={schemaId}
          title={title}
        />
        {displayGroups && (
          <Groups
            collapsed={collapsed}
            groups={groups}
            hasCreateRight={hasCreateRight}
            hasUpdateRight={hasUpdateRight}
            onClose={handleGroupModalClose}
            onCreate={handleGroupCreate}
            onGroupKeyCheck={handleGroupKeyCheck}
            onGroupSelect={onGroupSelect}
            onModalOpen={handleGroupModalOpen}
            onUpdateGroupsOrder={handleUpdateGroupsOrder}
            open={groupModalShown}
            selectedKey={schemaId}
            title={title}
          />
        )}
      </ModelListBody>
    </>
  );
};

export default ModelsMenu;
