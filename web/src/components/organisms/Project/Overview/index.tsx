import ProjectOverviewMolecule from "@reearth-cms/components/molecules/ProjectOverview";
import DeletionModal from "@reearth-cms/components/molecules/Schema/DeletionModal";
import FormModal from "@reearth-cms/components/molecules/Schema/FormModal";

import useHooks from "./hooks";

const ProjectOverview: React.FC = () => {
  const {
    models,
    modelModalShown,
    selectedModel,
    modelDeletionModalShown,
    deleteLoading,
    exportLoading,
    hasCreateRight,
    hasUpdateRight,
    hasDeleteRight,
    hasSchemaCreateRight,
    hasContentCreateRight,
    handleProjectUpdate,
    handleHomeNavigation,
    handleSchemaNavigation,
    handleImportSchemaNavigation,
    handleImportContentNavigation,
    handleContentNavigation,
    handleModelSearch,
    handleModelSort,
    handleModelKeyCheck,
    handleModelModalOpen,
    handleModelModalReset,
    handleModelCreate,
    handleModelDeletionModalOpen,
    handleModelDeletionModalClose,
    handleModelUpdateModalOpen,
    handleModelDelete,
    handleModelExport,
    handleModelUpdate,
  } = useHooks();

  return (
    <>
      <ProjectOverviewMolecule
        models={models}
        hasCreateRight={hasCreateRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
        hasSchemaCreateRight={hasSchemaCreateRight}
        hasContentCreateRight={hasContentCreateRight}
        exportLoading={exportLoading}
        onProjectUpdate={handleProjectUpdate}
        onModelSearch={handleModelSearch}
        onModelSort={handleModelSort}
        onHomeNavigation={handleHomeNavigation}
        onSchemaNavigate={handleSchemaNavigation}
        onImportSchemaNavigate={handleImportSchemaNavigation}
        onContentNavigate={handleContentNavigation}
        onImportContentNavigate={handleImportContentNavigation}
        onModelModalOpen={handleModelModalOpen}
        onModelDeletionModalOpen={handleModelDeletionModalOpen}
        onModelUpdateModalOpen={handleModelUpdateModalOpen}
        onModelExport={handleModelExport}
      />
      <FormModal
        data={selectedModel}
        open={modelModalShown}
        onClose={handleModelModalReset}
        onCreate={handleModelCreate}
        onUpdate={handleModelUpdate}
        onKeyCheck={handleModelKeyCheck}
        isModel
      />
      <DeletionModal
        open={modelDeletionModalShown}
        data={selectedModel}
        deleteLoading={deleteLoading}
        onDelete={handleModelDelete}
        onClose={handleModelDeletionModalClose}
        isModel
      />
    </>
  );
};

export default ProjectOverview;
