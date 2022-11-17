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
    uploadUrl,
    setUploadUrl,
    setSelection,
    setFileList,
    setUploading,
    setUploadModalVisibility,
    handleAssetCreate,
    handleAssetCreateFromUrl,
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
      uploadUrl={uploadUrl}
      setUploadUrl={setUploadUrl}
      onAssetCreate={handleAssetCreate}
      onAssetCreateFromUrl={handleAssetCreateFromUrl}
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
