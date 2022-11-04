import { useParams } from "react-router-dom";

import SchemaMolecule from "@reearth-cms/components/molecules/Schema";
import FieldCreationModal from "@reearth-cms/components/molecules/Schema/FieldModal/FieldCreationModal";
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

  const { projectId } = useParams();
  const {
    assetList,
    handleSearchTerm,
    handleAssetsReload,
    loading,
    createAssets,
    fileList,
    setFileList,
    setUploading,
    setUploadModalVisibility,
    uploading,
    uploadModalVisibility,
  } = useAssetHooks(projectId);

  const {
    fieldCreationModalShown,
    fieldUpdateModalShown,
    selectedField,
    currentModel,
    selectedType,
    collapsed,
    collapse,
    handleModelSelect,
    handleFieldCreationModalClose,
    handleFieldCreationModalOpen,
    handleFieldUpdateModalOpen,
    handleFieldUpdateModalClose,
    handleFieldCreate,
    handleFieldKeyUnique,
    handleFieldUpdate,
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
        onFieldDelete={handleFieldDelete}
      />
      {selectedType && (
        <FieldCreationModal
          selectedType={selectedType}
          open={fieldCreationModalShown}
          handleFieldKeyUnique={handleFieldKeyUnique}
          onClose={handleFieldCreationModalClose}
          onSubmit={handleFieldCreate}
          assetList={assetList}
          onAssetSearchTerm={handleSearchTerm}
          onAssetsReload={handleAssetsReload}
          loadingAssets={loading}
          createAssets={createAssets}
          fileList={fileList}
          setFileList={setFileList}
          setUploading={setUploading}
          setUploadModalVisibility={setUploadModalVisibility}
          uploading={uploading}
          uploadModalVisibility={uploadModalVisibility}
        />
      )}
      {selectedType && (
        <FieldUpdateModal
          selectedType={selectedType}
          open={fieldUpdateModalShown}
          selectedField={selectedField}
          handleFieldKeyUnique={handleFieldKeyUnique}
          onClose={handleFieldUpdateModalClose}
          onSubmit={handleFieldUpdate}
          assetList={assetList}
          onAssetSearchTerm={handleSearchTerm}
          onAssetsReload={handleAssetsReload}
          loadingAssets={loading}
          createAssets={createAssets}
          fileList={fileList}
          setFileList={setFileList}
          setUploading={setUploading}
          setUploadModalVisibility={setUploadModalVisibility}
          uploading={uploading}
          uploadModalVisibility={uploadModalVisibility}
        />
      )}
    </>
  );
};

export default ProjectSchema;
