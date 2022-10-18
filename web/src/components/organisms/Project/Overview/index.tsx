import ProjectOverviewMolecule from "@reearth-cms/components/molecules/ProjectOverview";
import ModelCreationModal from "@reearth-cms/components/molecules/Schema/ModelCreationModal";

import useHooks from "./hooks";

const ProjectOverview: React.FC = () => {
  const {
    currentProject,
    models,
    isKeyAvailable,
    modelModalShown,
    handleSchemaNavigation,
    handleContentNavigation,
    handleModelKeyCheck,
    handleModelModalOpen,
    handleModelModalClose,
    handleModelCreate,
  } = useHooks();

  return (
    <>
      <ProjectOverviewMolecule
        projectName={currentProject?.name}
        models={models}
        onSchemaNavigate={handleSchemaNavigation}
        onContentNavigate={handleContentNavigation}
        onModelModalOpen={handleModelModalOpen}
      />
      <ModelCreationModal
        isKeyAvailable={isKeyAvailable}
        projectId={currentProject?.id}
        onModelKeyCheck={handleModelKeyCheck}
        open={modelModalShown}
        onClose={handleModelModalClose}
        onSubmit={handleModelCreate}
      />
    </>
  );
};

export default ProjectOverview;
