import ContentDetailsMolecule from "@reearth-cms/components/molecules/Content/Details";
import useAssetHooks from "@reearth-cms/components/organisms/Asset/AssetList/hooks";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const ContentDetails: React.FC = () => {
  const t = useT();

  const {
    requests,
    itemId,
    currentModel,
    currentItem,
    initialFormValues,
    itemCreationLoading,
    itemUpdatingLoading,
    collapsedModelMenu,
    collapsedCommentsPanel,
    requestModalShown,
    addItemToRequestModalShown,
    workspaceUserMembers,
    handleAddItemToRequest,
    collapseCommentsPanel,
    collapseModelMenu,
    handleItemCreate,
    handleItemUpdate,
    handleNavigateToModel,
    handleRequestCreate,
    handleModalClose,
    handleModalOpen,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
  } = useHooks();

  const {
    assetList,
    fileList,
    loading,
    uploading,
    uploadModalVisibility,
    uploadUrl,
    uploadType,
    handleUploadModalCancel,
    setUploadUrl,
    setUploadType,
    setFileList,
    setUploadModalVisibility,
    handleAssetsCreate,
    handleAssetCreateFromUrl,
    handleAssetsReload,
    handleSearchTerm,
    handleNavigateToAsset,
    totalCount,
    page,
    pageSize,
    handleAssetTableChange,
  } = useAssetHooks();

  return (
    <ContentDetailsMolecule
      requests={requests}
      collapsed={collapsedModelMenu}
      onCollapse={collapseModelMenu}
      commentsPanel={
        currentItem ? (
          <CommentsPanel
            comments={currentItem.comments}
            threadId={currentItem.threadId}
            collapsed={collapsedCommentsPanel}
            onCollapse={collapseCommentsPanel}
          />
        ) : undefined
      }
      itemId={itemId}
      model={currentModel}
      initialFormValues={initialFormValues}
      loading={itemCreationLoading || itemUpdatingLoading}
      onItemCreate={handleItemCreate}
      onItemUpdate={handleItemUpdate}
      onBack={handleNavigateToModel}
      modelsMenu={
        <ModelsMenu
          collapsed={collapsedModelMenu}
          title={t("Content")}
          onModelSelect={handleNavigateToModel}
        />
      }
      onChange={handleAddItemToRequest}
      assetList={assetList}
      onAssetTableChange={handleAssetTableChange}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      fileList={fileList}
      loadingAssets={loading}
      uploading={uploading}
      uploadModalVisibility={uploadModalVisibility}
      uploadUrl={uploadUrl}
      uploadType={uploadType}
      onUploadModalCancel={handleUploadModalCancel}
      setUploadUrl={setUploadUrl}
      setUploadType={setUploadType}
      onAssetsCreate={handleAssetsCreate}
      onAssetCreateFromUrl={handleAssetCreateFromUrl}
      onAssetsReload={handleAssetsReload}
      onAssetSearchTerm={handleSearchTerm}
      setFileList={setFileList}
      setUploadModalVisibility={setUploadModalVisibility}
      onNavigateToAsset={handleNavigateToAsset}
      requestModalShown={requestModalShown}
      addItemToRequestModalShown={addItemToRequestModalShown}
      onRequestCreate={handleRequestCreate}
      onModalClose={handleModalClose}
      onModalOpen={handleModalOpen}
      onAddItemToRequestModalClose={handleAddItemToRequestModalClose}
      onAddItemToRequestModalOpen={handleAddItemToRequestModalOpen}
      workspaceUserMembers={workspaceUserMembers}
    />
  );
};

export default ContentDetails;
