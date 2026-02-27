import ProjectOverviewMolecule from "@reearth-cms/components/molecules/ProjectOverview";
import DeletionModal from "@reearth-cms/components/molecules/Schema/DeletionModal";
import FormModal from "@reearth-cms/components/molecules/Schema/FormModal";

import useHooks from "./hooks";

const ProjectOverview: React.FC = () => {
  const {
    deleteLoading,
    exportLoading,
    handleContentNavigation,
    handleHomeNavigation,
    handleImportContentNavigation,
    handleImportSchemaNavigation,
    handleModelCreate,
    handleModelDelete,
    handleModelDeletionModalClose,
    handleModelDeletionModalOpen,
    handleModelExport,
    handleModelKeyCheck,
    handleModelModalOpen,
    handleModelModalReset,
    handleModelSearch,
    handleModelSort,
    handleModelUpdate,
    handleModelUpdateModalOpen,
    handleProjectUpdate,
    handleSchemaNavigation,
    hasContentCreateRight,
    hasCreateRight,
    hasDeleteRight,
    hasSchemaCreateRight,
    hasUpdateRight,
    modelDeletionModalShown,
    modelModalShown,
    models,
    selectedModel,
  } = useHooks();

  return (
    <>
      <ProjectOverviewMolecule
        exportLoading={exportLoading}
        hasContentCreateRight={hasContentCreateRight}
        hasCreateRight={hasCreateRight}
        hasDeleteRight={hasDeleteRight}
        hasSchemaCreateRight={hasSchemaCreateRight}
        hasUpdateRight={hasUpdateRight}
        models={models}
        onContentNavigate={handleContentNavigation}
        onHomeNavigation={handleHomeNavigation}
        onImportContentNavigate={handleImportContentNavigation}
        onImportSchemaNavigate={handleImportSchemaNavigation}
        onModelDeletionModalOpen={handleModelDeletionModalOpen}
        onModelExport={handleModelExport}
        onModelModalOpen={handleModelModalOpen}
        onModelSearch={handleModelSearch}
        onModelSort={handleModelSort}
        onModelUpdateModalOpen={handleModelUpdateModalOpen}
        onProjectUpdate={handleProjectUpdate}
        onSchemaNavigate={handleSchemaNavigation}
      />
      <FormModal
        data={selectedModel}
        isModel
        onClose={handleModelModalReset}
        onCreate={handleModelCreate}
        onKeyCheck={handleModelKeyCheck}
        onUpdate={handleModelUpdate}
        open={modelModalShown}
      />
      <DeletionModal
        data={selectedModel}
        deleteLoading={deleteLoading}
        isModel
        onClose={handleModelDeletionModalClose}
        onDelete={handleModelDelete}
        open={modelDeletionModalShown}
      />
    </>
  );
};

export default ProjectOverview;
