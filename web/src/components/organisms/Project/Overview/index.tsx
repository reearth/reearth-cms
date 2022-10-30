import ProjectOverviewMolecule from "@reearth-cms/components/molecules/ProjectOverview";
import ModelDeletionModal from "@reearth-cms/components/molecules/ProjectOverview/ModelDeletionModal";
import ModelCreationModal from "@reearth-cms/components/molecules/Schema/ModelCreationModal";

import useHooks from "./hooks";

const ProjectOverview: React.FC = () => {
  const {
    currentProject,
    models,
    isKeyAvailable,
    modelModalShown,
    selectedModel,
    modelDeletionModalShown,
    handleSchemaNavigation,
    handleContentNavigation,
    handleModelKeyCheck,
    handleModelModalOpen,
    handleModelModalClose,
    handleModelCreate,
    handleModelDeletionModalOpen,
    handleModelDeletionModalClose,
    handleModelDelete,
  } = useHooks();

  return (
    <>
      <ProjectOverviewMolecule
        projectName={currentProject?.name}
        projectDescription={currentProject?.description}
        models={models}
        onSchemaNavigate={handleSchemaNavigation}
        onContentNavigate={handleContentNavigation}
        onModelModalOpen={handleModelModalOpen}
        onModelDeletionModalOpen={handleModelDeletionModalOpen}
      />
      <ModelCreationModal
        isKeyAvailable={isKeyAvailable}
        projectId={currentProject?.id}
        onModelKeyCheck={handleModelKeyCheck}
        open={modelModalShown}
        onClose={handleModelModalClose}
        onSubmit={handleModelCreate}
      />
      <ModelDeletionModal
        model={selectedModel}
        open={modelDeletionModalShown}
        onDelete={handleModelDelete}
        onClose={handleModelDeletionModalClose}
      />
    </>
  );
};

export default ProjectOverview;
