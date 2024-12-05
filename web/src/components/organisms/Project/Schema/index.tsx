import SchemaMolecule from "@reearth-cms/components/molecules/Schema";
import DeletionModal from "@reearth-cms/components/molecules/Schema/DeletionModal";
import FieldModal from "@reearth-cms/components/molecules/Schema/FieldModal";
import FieldCreationModalWithSteps from "@reearth-cms/components/molecules/Schema/FieldModal/FieldCreationModalWithSteps";
import FormModal from "@reearth-cms/components/molecules/Schema/FormModal";
import useAssetHooks from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const ProjectSchema: React.FC = () => {
  const t = useT();

  const {
    assetList,
    fileList,
    loading,
    uploading,
    uploadModalVisibility,
    uploadUrl,
    uploadType,
    handleUploadModalCancel,
    setUploadUrl,
    setUploadType,
    setFileList,
    setUploadModalVisibility,
    handleAssetsCreate,
    handleAssetCreateFromUrl,
    handleSearchTerm,
    handleAssetsGet,
    handleAssetsReload,
    totalCount,
    page,
    pageSize,
    handleAssetTableChange,
    handleGetAsset,
  } = useAssetHooks(false);

  const {
    data,
    models,
    groups,
    isMeta,
    setIsMeta,
    fieldModalShown,
    selectedField,
    selectedType,
    collapsed,
    fieldCreationLoading,
    fieldUpdateLoading,
    deleteModelLoading,
    deleteGroupLoading,
    setCollapsed,
    selectedSchemaType,
    handleModelSelect,
    handleGroupSelect,
    handleFieldCreationModalOpen,
    handleFieldUpdateModalOpen,
    handleFieldModalClose,
    handleFieldCreate,
    handleReferencedModelGet,
    handleCorrespondingFieldKeyUnique,
    handleFieldKeyUnique,
    handleFieldUpdate,
    handleFieldOrder,
    handleFieldDelete,
    handleKeyCheck,
    handleModalOpen,
    handleModalClose,
    handleDeletionModalOpen,
    handleDeletionModalClose,
    handleSchemaCreate,
    handleSchemaUpdate,
    handleSchemaDelete,
    groupModalShown,
    groupDeletionModalShown,
    modelModalShown,
    modelDeletionModalShown,
    hasCreateRight,
    hasUpdateRight,
    hasDeleteRight,
  } = useHooks();

  return (
    <>
      <SchemaMolecule
        data={data}
        collapsed={collapsed}
        selectedSchemaType={selectedSchemaType}
        hasCreateRight={hasCreateRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
        onModalOpen={handleModalOpen}
        onDeletionModalOpen={handleDeletionModalOpen}
        modelsMenu={
          <ModelsMenu
            title={t("Schema")}
            collapsed={collapsed}
            selectedSchemaType={selectedSchemaType}
            displayGroups
            titleIcon={"unorderedList"}
            onModelSelect={handleModelSelect}
            onGroupSelect={handleGroupSelect}
          />
        }
        setIsMeta={setIsMeta}
        onCollapse={setCollapsed}
        onFieldUpdateModalOpen={handleFieldUpdateModalOpen}
        onFieldCreationModalOpen={handleFieldCreationModalOpen}
        onFieldReorder={handleFieldOrder}
        onFieldDelete={handleFieldDelete}
      />
      <FormModal
        data={data}
        open={modelModalShown || groupModalShown}
        onKeyCheck={handleKeyCheck}
        onClose={handleModalClose}
        onCreate={handleSchemaCreate}
        onUpdate={handleSchemaUpdate}
        isModel={modelModalShown}
      />
      <DeletionModal
        data={data}
        open={modelDeletionModalShown || groupDeletionModalShown}
        deleteLoading={deleteModelLoading || deleteGroupLoading}
        onDelete={handleSchemaDelete}
        onClose={handleDeletionModalClose}
        isModel={modelDeletionModalShown}
      />
      {selectedType && selectedType === "Reference" && (
        <FieldCreationModalWithSteps
          models={models}
          selectedType={selectedType}
          selectedField={selectedField}
          open={fieldModalShown}
          isLoading={fieldUpdateLoading || fieldCreationLoading}
          handleReferencedModelGet={handleReferencedModelGet}
          handleCorrespondingFieldKeyUnique={handleCorrespondingFieldKeyUnique}
          handleFieldKeyUnique={handleFieldKeyUnique}
          onClose={handleFieldModalClose}
          onSubmit={handleFieldCreate}
          onUpdate={handleFieldUpdate}
        />
      )}
      {selectedType && selectedType !== "Reference" && (
        <FieldModal
          groups={groups}
          selectedType={selectedType}
          selectedSchemaType={selectedSchemaType}
          isMeta={isMeta}
          open={fieldModalShown}
          fieldLoading={selectedField ? fieldUpdateLoading : fieldCreationLoading}
          selectedField={selectedField}
          handleFieldKeyUnique={handleFieldKeyUnique}
          onClose={handleFieldModalClose}
          onSubmit={selectedField ? handleFieldUpdate : handleFieldCreate}
          onAssetTableChange={handleAssetTableChange}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          assetList={assetList}
          fileList={fileList}
          loadingAssets={loading}
          uploading={uploading}
          uploadModalVisibility={uploadModalVisibility}
          uploadUrl={uploadUrl}
          uploadType={uploadType}
          onUploadModalCancel={handleUploadModalCancel}
          setUploadUrl={setUploadUrl}
          setUploadType={setUploadType}
          onAssetsCreate={handleAssetsCreate}
          onAssetCreateFromUrl={handleAssetCreateFromUrl}
          onAssetSearchTerm={handleSearchTerm}
          onAssetsGet={handleAssetsGet}
          onAssetsReload={handleAssetsReload}
          setFileList={setFileList}
          setUploadModalVisibility={setUploadModalVisibility}
          onGetAsset={handleGetAsset}
        />
      )}
    </>
  );
};

export default ProjectSchema;
