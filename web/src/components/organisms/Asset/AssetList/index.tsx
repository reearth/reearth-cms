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
    uploadType,
    handleUploadModalCancel,
    setUploadUrl,
    setUploadType,
    setSelection,
    setFileList,
    setUploadModalVisibility,
    handleAssetsCreate,
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
      uploadType={uploadType}
      onUploadModalCancel={handleUploadModalCancel}
      setUploadUrl={setUploadUrl}
      setUploadType={setUploadType}
      onAssetsCreate={handleAssetsCreate}
      onAssetCreateFromUrl={handleAssetCreateFromUrl}
      onAssetDelete={handleAssetDelete}
      onAssetsReload={handleAssetsReload}
      onSearchTerm={handleSearchTerm}
      onEdit={handleNavigateToAsset}
      setSelection={setSelection}
      setFileList={setFileList}
      setUploadModalVisibility={setUploadModalVisibility}
    />
  );
};

export default AssetList;
