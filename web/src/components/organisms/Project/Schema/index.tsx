import SchemaMolecule from "@reearth-cms/components/molecules/Schema";
import FieldCreationModal from "@reearth-cms/components/molecules/Schema/FieldModal/FieldCreationModal";
import FieldCreationModalWithSteps from "@reearth-cms/components/molecules/Schema/FieldModal/FieldCreationModalWithSteps";
import FieldUpdateModal from "@reearth-cms/components/molecules/Schema/FieldModal/FieldUpdateModal";
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
    isMeta,
    fieldCreationModalShown,
    fieldUpdateModalShown,
    selectedField,
    currentModel,
    selectedType,
    collapsed,
    fieldCreationLoading,
    fieldUpdateLoading,
    collapse,
    handleModelSelect,
    handleFieldCreationModalClose,
    handleFieldCreationModalOpen,
    handleFieldUpdateModalOpen,
    handleFieldUpdateModalClose,
    handleFieldCreate,
    handleFieldKeyUnique,
    handleFieldUpdate,
    handleFieldOrder,
    handleFieldDelete,
  } = useHooks();

  return (
    <>
      <SchemaMolecule
        collapsed={collapsed}
        model={currentModel}
        modelsMenu={
          <ModelsMenu title={t("Schema")} collapsed={collapsed} onModelSelect={handleModelSelect} />
        }
        onCollapse={collapse}
        onFieldUpdateModalOpen={handleFieldUpdateModalOpen}
        onFieldCreationModalOpen={handleFieldCreationModalOpen}
        onFieldReorder={handleFieldOrder}
        onFieldDelete={handleFieldDelete}
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
        <FieldCreationModal
          selectedType={selectedType}
          isMeta={isMeta}
          open={fieldCreationModalShown}
          fieldCreationLoading={fieldCreationLoading}
          handleFieldKeyUnique={handleFieldKeyUnique}
          onClose={handleFieldCreationModalClose}
          onSubmit={handleFieldCreate}
          assetList={assetList}
          onAssetTableChange={handleAssetTableChange}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
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
      {selectedType && selectedType !== "Reference" && (
        <FieldUpdateModal
          fieldUpdateLoading={fieldUpdateLoading}
          selectedType={selectedType}
          open={fieldUpdateModalShown}
          selectedField={selectedField}
          handleFieldKeyUnique={handleFieldKeyUnique}
          onClose={handleFieldUpdateModalClose}
          onSubmit={handleFieldUpdate}
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
