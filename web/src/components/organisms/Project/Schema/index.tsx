import SchemaMolecule from "@reearth-cms/components/molecules/Schema";
import FieldModal from "@reearth-cms/components/molecules/Schema/FieldModal";
import FieldCreationModalWithSteps from "@reearth-cms/components/molecules/Schema/FieldModal/FieldCreationModalWithSteps";
import GroupDeletionModal from "@reearth-cms/components/molecules/Schema/GroupDeletionModal";
import GroupFormModal from "@reearth-cms/components/molecules/Schema/GroupFormModal";
import ModelDeletionModal from "@reearth-cms/components/molecules/Schema/ModelDeletionModal";
import ModelFormModal from "@reearth-cms/components/molecules/Schema/ModelFormModal";
import useAssetHooks from "@reearth-cms/components/organisms/Asset/AssetList/hooks";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

export type FormValues = {
  name: string;
  description: string;
};

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
    handleAssetsReload,
    totalCount,
    page,
    pageSize,
    handleAssetTableChange,
  } = useAssetHooks();

  const {
    models,
    groups,
    group,
    model,
    isMeta,
    setIsMeta,
    fieldCreationModalShown,
    fieldUpdateModalShown,
    selectedField,
    currentModel,
    selectedType,
    collapsed,
    fieldCreationLoading,
    fieldUpdateLoading,
    collapse,
    selectedSchemaType,
    handleModelSelect,
    handleGroupSelect,
    handleFieldCreationModalClose,
    handleFieldCreationModalOpen,
    handleFieldUpdateModalOpen,
    handleFieldUpdateModalClose,
    handleFieldCreate,
    handleFieldKeyUnique,
    handleFieldUpdate,
    handleFieldOrder,
    handleFieldDelete,
    groupCreateModalShown,
    groupUpdateModalShown,
    isGroupKeyAvailable,
    groupDeletionModalShown,
    handleGroupUpdateModalOpen,
    handleGroupDeletionModalOpen,
    handleGroupCreateModalClose,
    handleGroupUpdateModalClose,
    handleGroupDeletionModalClose,
    handleGroupDelete,
    handleGroupCreate,
    handleGroupUpdate,
    handleGroupKeyCheck,
    modelUpdateModalShown,
    isModelKeyAvailable,
    modelDeletionModalShown,
    handleModelUpdateModalOpen,
    handleModelDeletionModalOpen,
    handleModelUpdateModalClose,
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
        onModelUpdateModalOpen={handleModelUpdateModalOpen}
        onModelDeletionModalOpen={handleModelDeletionModalOpen}
        onGroupUpdateModalOpen={handleGroupUpdateModalOpen}
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
        onCollapse={collapse}
        onFieldUpdateModalOpen={handleFieldUpdateModalOpen}
        onFieldCreationModalOpen={handleFieldCreationModalOpen}
        onFieldReorder={handleFieldOrder}
        onFieldDelete={handleFieldDelete}
      />
      <ModelFormModal
        isKeyAvailable={isModelKeyAvailable}
        model={model}
        open={modelUpdateModalShown}
        onModelKeyCheck={handleModelKeyCheck}
        onClose={handleModelUpdateModalClose}
        onUpdate={handleModelUpdate}
      />
      <ModelDeletionModal
        model={model}
        open={modelDeletionModalShown}
        onDelete={handleModelDelete}
        onClose={handleModelDeletionModalClose}
      />
      {/* create */}
      <GroupFormModal
        isKeyAvailable={isGroupKeyAvailable}
        group={group}
        open={groupCreateModalShown}
        onGroupKeyCheck={handleGroupKeyCheck}
        onClose={handleGroupCreateModalClose}
        onCreate={handleGroupCreate}
      />
      {/* update */}
      <GroupFormModal
        isKeyAvailable={isGroupKeyAvailable}
        group={group}
        open={groupUpdateModalShown}
        onGroupKeyCheck={handleGroupKeyCheck}
        onClose={handleGroupUpdateModalClose}
        onUpdate={handleGroupUpdate}
      />
      <GroupDeletionModal
        group={group}
        open={groupDeletionModalShown}
        onDelete={handleGroupDelete}
        onClose={handleGroupDeletionModalClose}
      />
      {selectedType && selectedType === "Reference" && (
        <FieldCreationModalWithSteps
          models={models}
          selectedType={selectedType}
          selectedField={selectedField}
          isUpdate={fieldUpdateModalShown}
          open={fieldCreationModalShown || fieldUpdateModalShown}
          handleFieldKeyUnique={handleFieldKeyUnique}
          onClose={handleFieldCreationModalClose}
          onSubmit={handleFieldCreate}
          onUpdate={handleFieldUpdate}
        />
      )}
      {selectedType && selectedType !== "Reference" && (
        <FieldModal
          groups={groups}
          selectedType={selectedType}
          isMeta={isMeta}
          open={selectedField ? fieldUpdateModalShown : fieldCreationModalShown}
          fieldLoading={selectedField ? fieldUpdateLoading : fieldCreationLoading}
          selectedField={selectedField}
          handleFieldKeyUnique={handleFieldKeyUnique}
          onClose={selectedField ? handleFieldUpdateModalClose : handleFieldCreationModalClose}
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
          onAssetsReload={handleAssetsReload}
          setFileList={setFileList}
          setUploadModalVisibility={setUploadModalVisibility}
        />
      )}
    </>
  );
};

export default ProjectSchema;
