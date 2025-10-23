import ProjectOverviewMolecule from "@reearth-cms/components/molecules/ProjectOverview";
import DeletionModal from "@reearth-cms/components/molecules/Schema/DeletionModal";
import ExportModal from "@reearth-cms/components/molecules/Schema/ExportSchemaModal";
import FormModal from "@reearth-cms/components/molecules/Schema/FormModal";

import useHooks from "./hooks";

const ProjectOverview: React.FC = () => {
  const {
    models,
    modelModalShown,
    selectedModel,
    modelDeletionModalShown,
    modelExportModalShown,
    deleteLoading,
    exportLoading,
    hasCreateRight,
    hasUpdateRight,
    hasDeleteRight,
    handleProjectUpdate,
    handleHomeNavigation,
    handleSchemaNavigation,
    handleContentNavigation,
    handleGoToAssets,
    handleModelSearch,
    handleModelSort,
    handleModelKeyCheck,
    handleModelModalOpen,
    handleModelModalReset,
    handleModelCreate,
    handleModelDeletionModalOpen,
    handleModelDeletionModalClose,
    handleModelUpdateModalOpen,
    handleModelExportModalOpen,
    handleModelExportModalClose,
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
        onProjectUpdate={handleProjectUpdate}
        onModelSearch={handleModelSearch}
        onModelSort={handleModelSort}
        onHomeNavigation={handleHomeNavigation}
        onSchemaNavigate={handleSchemaNavigation}
        onContentNavigate={handleContentNavigation}
        onModelModalOpen={handleModelModalOpen}
        onModelDeletionModalOpen={handleModelDeletionModalOpen}
        onModelUpdateModalOpen={handleModelUpdateModalOpen}
        onModelExportModalOpen={handleModelExportModalOpen}
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
      <ExportModal
        open={modelExportModalShown}
        data={selectedModel}
        exportLoading={exportLoading}
        onExport={handleModelExport}
        onClose={handleModelExportModalClose}
        onGoToAssets={handleGoToAssets}
      />
    </>
  );
};

export default ProjectOverview;
