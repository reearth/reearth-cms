import AssetListBody from "@reearth-cms/components/molecules/Asset/AssetList";

import useHooks from "./hooks";

const AssetList: React.FC = () => {
  const {
    assetList,
    assetsPerPage,
    selection,
    fileList,
    uploading,
    uploadModalVisibility,
    loading,
    setSelection,
    setFileList,
    setUploading,
    setUploadModalVisibility,
    handleAssetCreate,
    handleAssetDelete,
    handleSearchTerm,
    handleAssetsReload,
    handleNavigateToAsset,
  } = useHooks();

  return (
    <AssetListBody
      assetList={assetList}
      assetsPerPage={assetsPerPage}
      fileList={fileList}
      selection={selection}
      uploading={uploading}
      uploadModalVisibility={uploadModalVisibility}
      loading={loading}
      onAssetCreate={handleAssetCreate}
      onAssetDelete={handleAssetDelete}
      onAssetsReload={handleAssetsReload}
      onSearchTerm={handleSearchTerm}
      onEdit={handleNavigateToAsset}
      setSelection={setSelection}
      setFileList={setFileList}
      setUploading={setUploading}
      setUploadModalVisibility={setUploadModalVisibility}
    />
  );
};

export default AssetList;
