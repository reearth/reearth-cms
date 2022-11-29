import AssetListBody from "@reearth-cms/components/molecules/Asset/AssetList";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";

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
    selectedAsset,
    handleAssetSelect,
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
      commentsPanel={
        <CommentsPanel
          comments={assetList.find(asset => asset.id === selectedAsset?.id)?.comments}
          threadId={assetList.find(asset => asset.id === selectedAsset?.id)?.threadId}
        />
      }
      assetList={assetList}
      assetsPerPage={assetsPerPage}
      fileList={fileList}
      selection={selection}
      uploading={uploading}
      uploadModalVisibility={uploadModalVisibility}
      loading={loading}
      uploadUrl={uploadUrl}
      uploadType={uploadType}
      onAssetSelect={handleAssetSelect}
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
