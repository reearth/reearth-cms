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
    isModel,
    models,
    groups,
    group,
    isMeta,
    setIsMeta,
    fieldModalShown,
    selectedField,
    currentModel,
    selectedType,
    collapsed,
    fieldCreationLoading,
    fieldUpdateLoading,
    setCollapsed,
    selectedSchemaType,
    handleModelSelect,
    handleGroupSelect,
    handleFieldCreationModalOpen,
    handleFieldUpdateModalOpen,
    handleFieldModalClose,
    handleFieldCreate,
    handleFieldKeyUnique,
    handleFieldUpdate,
    handleFieldOrder,
    handleFieldDelete,
    groupModalShown,
    groupDeletionModalShown,
    handleGroupModalOpen,
    handleGroupModalClose,
    handleGroupDeletionModalOpen,
    handleGroupDeletionModalClose,
    handleGroupDelete,
    handleGroupCreate,
    handleGroupUpdate,
    handleGroupKeyCheck,
    modelModalShown,
    modelDeletionModalShown,
    handleModelModalOpen,
    handleModelDeletionModalOpen,
    handleModelModalClose,
    handleModelDeletionModalClose,
    handleModelDelete,
    handleModelUpdate,
    handleModelKeyCheck,
  } = useHooks();

  return (
    <>
      <SchemaMolecule
        collapsed={collapsed}
        selectedSchemaType={selectedSchemaType}
        model={currentModel}
        group={group}
        onModelModalOpen={handleModelModalOpen}
        onModelDeletionModalOpen={handleModelDeletionModalOpen}
        onGroupModalOpen={handleGroupModalOpen}
        onGroupDeletionModalOpen={handleGroupDeletionModalOpen}
        modelsMenu={
          <ModelsMenu
            title={t("Schema")}
            collapsed={collapsed}
            groupId={group?.id}
            selectedSchemaType={selectedSchemaType}
            onModelSelect={handleModelSelect}
            onGroupSelect={handleGroupSelect}
            displayGroups
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
        data={isModel ? currentModel : group}
        open={isModel ? modelModalShown : groupModalShown}
        onKeyCheck={isModel ? handleModelKeyCheck : handleGroupKeyCheck}
        onClose={isModel ? handleModelModalClose : handleGroupModalClose}
        onCreate={isModel ? undefined : handleGroupCreate}
        onUpdate={isModel ? handleModelUpdate : handleGroupUpdate}
        isModel={isModel}
      />
      <DeletionModal
        open={isModel ? modelDeletionModalShown : groupDeletionModalShown}
        data={isModel ? currentModel : group}
        onDelete={isModel ? handleModelDelete : handleGroupDelete}
        onClose={isModel ? handleModelDeletionModalClose : handleGroupDeletionModalClose}
        isModel={isModel}
      />
      {selectedType && selectedType === "Reference" && (
        <FieldCreationModalWithSteps
          models={models}
          selectedType={selectedType}
          selectedField={selectedField}
          open={fieldModalShown}
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
