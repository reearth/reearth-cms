import SchemaMolecule from "@reearth-cms/components/molecules/Schema";
import DeletionModal from "@reearth-cms/components/molecules/Schema/DeletionModal";
import FieldModal from "@reearth-cms/components/molecules/Schema/FieldModal";
import FieldCreationModalWithSteps from "@reearth-cms/components/molecules/Schema/FieldModal/FieldCreationModalWithSteps";
import GroupFormModal from "@reearth-cms/components/molecules/Schema/GroupFormModal";
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
    isMeta,
    setIsMeta,
    fieldModalShown,
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
    handleFieldCreationModalOpen,
    handleFieldUpdateModalOpen,
    handleFieldModalClose,
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
        model={currentModel}
        open={modelUpdateModalShown}
        onModelKeyCheck={handleModelKeyCheck}
        onClose={handleModelUpdateModalClose}
        onUpdate={handleModelUpdate}
      />
      <DeletionModal
        open={modelDeletionModalShown}
        data={currentModel && { id: currentModel.id, name: currentModel.name }}
        onDelete={handleModelDelete}
        onClose={handleModelDeletionModalClose}
      />
      <DeletionModal
        open={groupDeletionModalShown}
        data={group && { id: group.id, name: group.name }}
        onDelete={handleGroupDelete}
        onClose={handleGroupDeletionModalClose}
        isGroup
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
          onAssetsReload={handleAssetsReload}
          setFileList={setFileList}
          setUploadModalVisibility={setUploadModalVisibility}
        />
      )}
    </>
  );
};

export default ProjectSchema;
