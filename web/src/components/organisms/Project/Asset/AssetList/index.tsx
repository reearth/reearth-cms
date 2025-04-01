import AssetListWrapper from "@reearth-cms/components/molecules/Asset/AssetList";
import useCommentHooks from "@reearth-cms/components/organisms/Common/CommentsPanel/hooks";

import useHooks from "./hooks";

const AssetList: React.FC = () => {
  const {
    userId,
    hasCreateRight,
    hasDeleteRight,
    assets,
    loading,
    deleteLoading,
    handleAssetsCreate,
    handleAssetCreateFromUrl,
    handleSearchTerm,
    handleAssetsReload,
    handleAssetDelete,
    handleNavigateToAsset,
    handleAssetItemSelect,
    totalCount,
    page,
    pageSize,
    sort,
    searchTerm,
    columns,
    handleColumnsChange,
    handleAssetTableChange,
  } = useHooks(true);

  const { handleCommentCreate, handleCommentUpdate, handleCommentDelete, ...commentProps } =
    useCommentHooks({
      resourceType: "ASSET",
      refetchQueries: ["GetAssetsItems"],
    });

  return (
    <AssetListWrapper
      userId={userId}
      assets={assets}
      loading={loading}
      deleteLoading={deleteLoading}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      sort={sort}
      searchTerm={searchTerm}
      columns={columns}
      hasCreateRight={hasCreateRight}
      hasDeleteRight={hasDeleteRight}
      onColumnsChange={handleColumnsChange}
      onAssetItemSelect={handleAssetItemSelect}
      onAssetsCreate={handleAssetsCreate}
      onAssetCreateFromUrl={handleAssetCreateFromUrl}
      onAssetDelete={handleAssetDelete}
      onSearchTerm={handleSearchTerm}
      onNavigateToAsset={handleNavigateToAsset}
      onAssetsReload={handleAssetsReload}
      onAssetTableChange={handleAssetTableChange}
      commentProps={{
        onCommentCreate: handleCommentCreate,
        onCommentUpdate: handleCommentUpdate,
        onCommentDelete: handleCommentDelete,
        ...commentProps,
      }}
    />
  );
};

export default AssetList;
