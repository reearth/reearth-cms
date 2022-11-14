import ContentDetailsMolecule from "@reearth-cms/components/molecules/Content/Details";
import useAssetHooks from "@reearth-cms/components/organisms/Asset/AssetList/hooks";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const ContentDetails: React.FC = () => {
  const t = useT();

  const {
    itemId,
    currentModel,
    initialFormValues,
    itemCreationLoading,
    itemUpdatingLoading,
    handleItemCreate,
    handleItemUpdate,
    handleNavigateToModel,
  } = useHooks();

  const {
    assetList,
    fileList,
    loading,
    uploading,
    uploadModalVisibility,
    setFileList,
    setUploading,
    setUploadModalVisibility,
    handleAssetCreate,
    handleAssetsReload,
    handleSearchTerm,
  } = useAssetHooks();

  return (
    <ContentDetailsMolecule
      itemId={itemId}
      model={currentModel}
      initialFormValues={initialFormValues}
      loading={itemCreationLoading || itemUpdatingLoading}
      onItemCreate={handleItemCreate}
      onItemUpdate={handleItemUpdate}
      onBack={handleNavigateToModel}
      modelsMenu={<ModelsMenu title={t("Content")} onModelSelect={handleNavigateToModel} />}
      assetList={assetList}
      fileList={fileList}
      loadingAssets={loading}
      uploading={uploading}
      uploadModalVisibility={uploadModalVisibility}
      createAssets={handleAssetCreate}
      onAssetsReload={handleAssetsReload}
      onAssetSearchTerm={handleSearchTerm}
      setFileList={setFileList}
      setUploading={setUploading}
      setUploadModalVisibility={setUploadModalVisibility}
    />
  );
};

export default ContentDetails;
