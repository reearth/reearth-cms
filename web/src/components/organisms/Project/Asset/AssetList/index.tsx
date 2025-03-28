import AssetListBody from "@reearth-cms/components/molecules/Asset/AssetList";

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

  return (
    <AssetListBody
      userId={userId}
      assets={assets}
      onAssetTableChange={handleAssetTableChange}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      sort={sort}
      searchTerm={searchTerm}
      columns={columns}
      onColumnsChange={handleColumnsChange}
      loading={loading}
      deleteLoading={deleteLoading}
      hasCreateRight={hasCreateRight}
      hasDeleteRight={hasDeleteRight}
      onAssetItemSelect={handleAssetItemSelect}
      onAssetsCreate={handleAssetsCreate}
      onAssetCreateFromUrl={handleAssetCreateFromUrl}
      onAssetDelete={handleAssetDelete}
      onAssetsReload={handleAssetsReload}
      onSearchTerm={handleSearchTerm}
      onNavigateToAsset={handleNavigateToAsset}
    />
  );
};

export default AssetList;
