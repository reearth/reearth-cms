import AssetListBody from "@reearth-cms/components/molecules/Asset/AssetList";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";

import useHooks from "./hooks";

const AssetList: React.FC = () => {
  const {
    assetList,
    selection,
    fileList,
    uploading,
    uploadModalVisibility,
    loading,
    deleteLoading,
    uploadUrl,
    uploadType,
    selectedAsset,
    collapsed,
    totalCount,
    page,
    pageSize,
    sort,
    searchTerm,
    columns,
    hasCreateRight,
    hasDeleteRight,
    handleColumnsChange,
    handleToggleCommentMenu,
    handleAssetItemSelect,
    handleAssetSelect,
    handleUploadModalCancel,
    setUploadUrl,
    setUploadType,
    handleSelect,
    setFileList,
    setUploadModalVisibility,
    handleAssetsCreate,
    handleAssetCreateFromUrl,
    handleAssetDelete,
    handleSearchTerm,
    handleAssetsReload,
    handleNavigateToAsset,
    handleAssetTableChange,
  } = useHooks(true);

  return (
    <AssetListBody
      commentsPanel={
        <CommentsPanel
          resourceId={selectedAsset?.id}
          resourceType={"ASSET"}
          collapsed={collapsed}
          onCollapse={handleToggleCommentMenu}
          comments={selectedAsset?.comments}
          threadId={selectedAsset?.threadId}
          refetchQueries={["GetAssetsItems"]}
        />
      }
      assetList={assetList}
      onAssetTableChange={handleAssetTableChange}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      sort={sort}
      searchTerm={searchTerm}
      columns={columns}
      onColumnsChange={handleColumnsChange}
      fileList={fileList}
      selection={selection}
      uploading={uploading}
      uploadModalVisibility={uploadModalVisibility}
      loading={loading}
      deleteLoading={deleteLoading}
      uploadUrl={uploadUrl}
      uploadType={uploadType}
      hasCreateRight={hasCreateRight}
      hasDeleteRight={hasDeleteRight}
      onAssetItemSelect={handleAssetItemSelect}
      onAssetSelect={handleAssetSelect}
      onUploadModalCancel={handleUploadModalCancel}
      setUploadUrl={setUploadUrl}
      setUploadType={setUploadType}
      selectedAsset={selectedAsset}
      onAssetsCreate={handleAssetsCreate}
      onAssetCreateFromUrl={handleAssetCreateFromUrl}
      onAssetDelete={handleAssetDelete}
      onAssetsReload={handleAssetsReload}
      onSearchTerm={handleSearchTerm}
      onEdit={handleNavigateToAsset}
      onSelect={handleSelect}
      setFileList={setFileList}
      setUploadModalVisibility={setUploadModalVisibility}
    />
  );
};

export default AssetList;
