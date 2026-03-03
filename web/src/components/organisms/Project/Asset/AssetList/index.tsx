import AssetListBody from "@reearth-cms/components/molecules/Asset/AssetList";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";

import useHooks from "./hooks";

const AssetList: React.FC = () => {
  const {
    assetList,
    collapsed,
    columns,
    deleteLoading,
    fileList,
    handleAssetCreateFromUrl,
    handleAssetDelete,
    handleAssetItemSelect,
    handleAssetsCreate,
    handleAssetSelect,
    handleAssetsReload,
    handleAssetTableChange,
    handleColumnsChange,
    handleMultipleAssetDownload,
    handleNavigateToAsset,
    handleSearchTerm,
    handleSelect,
    handleToggleCommentMenu,
    handleUploadModalCancel,
    hasCreateRight,
    hasDeleteRight,
    loading,
    page,
    pageSize,
    searchTerm,
    selectedAsset,
    selection,
    setFileList,
    setUploadModalVisibility,
    setUploadType,
    setUploadUrl,
    sort,
    totalCount,
    uploading,
    uploadModalVisibility,
    uploadType,
    uploadUrl,
  } = useHooks(true);

  return (
    <AssetListBody
      assetList={assetList}
      columns={columns}
      commentsPanel={
        <CommentsPanel
          collapsed={collapsed}
          comments={selectedAsset?.comments}
          onCollapse={handleToggleCommentMenu}
          refetchQueries={["GetAssetsItems"]}
          resourceId={selectedAsset?.id}
          resourceType={"ASSET"}
          threadId={selectedAsset?.threadId}
        />
      }
      deleteLoading={deleteLoading}
      fileList={fileList}
      hasCreateRight={hasCreateRight}
      hasDeleteRight={hasDeleteRight}
      loading={loading}
      onAssetCreateFromUrl={handleAssetCreateFromUrl}
      onAssetDelete={handleAssetDelete}
      onAssetDownload={handleMultipleAssetDownload}
      onAssetItemSelect={handleAssetItemSelect}
      onAssetsCreate={handleAssetsCreate}
      onAssetSelect={handleAssetSelect}
      onAssetsReload={handleAssetsReload}
      onAssetTableChange={handleAssetTableChange}
      onColumnsChange={handleColumnsChange}
      onEdit={handleNavigateToAsset}
      onSearchTerm={handleSearchTerm}
      onSelect={handleSelect}
      onUploadModalCancel={handleUploadModalCancel}
      page={page}
      pageSize={pageSize}
      searchTerm={searchTerm}
      selectedAsset={selectedAsset}
      selection={selection}
      setFileList={setFileList}
      setUploadModalVisibility={setUploadModalVisibility}
      setUploadType={setUploadType}
      setUploadUrl={setUploadUrl}
      sort={sort}
      totalCount={totalCount}
      uploading={uploading}
      uploadModalVisibility={uploadModalVisibility}
      uploadType={uploadType}
      uploadUrl={uploadUrl}
    />
  );
};

export default AssetList;
