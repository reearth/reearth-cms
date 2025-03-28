import ContentDetailsMolecule from "@reearth-cms/components/molecules/Content/Details";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";
import useAssetHooks from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const ContentDetails: React.FC = () => {
  const t = useT();

  const {
    loadingReference,
    linkedItemsModalList,
    showPublishAction,
    requests,
    itemId,
    itemLoading,
    currentModel,
    title,
    currentItem,
    initialFormValues,
    initialMetaFormValues,
    versions,
    itemCreationLoading,
    itemUpdatingLoading,
    requestCreationLoading,
    collapsedModelMenu,
    collapsedCommentsPanel,
    requestModalShown,
    addItemToRequestModalShown,
    workspaceUserMembers,
    linkItemModalTitle,
    linkItemModalTotalCount,
    linkItemModalPage,
    linkItemModalPageSize,
    handleReferenceModelUpdate,
    handleSearchTerm,
    handleLinkItemTableReload,
    handleLinkItemTableChange,
    handleRequestTableChange,
    handleRequestTableReload,
    handleRequestSearchTerm,
    publishLoading,
    requestModalLoading,
    requestModalTotalCount,
    requestModalPage,
    requestModalPageSize,
    handleGetVersionedItem,
    handlePublish,
    handleUnpublish,
    handleAddItemToRequest,
    collapseCommentsPanel,
    collapseModelMenu,
    handleItemCreate,
    handleItemUpdate,
    handleMetaItemUpdate,
    handleNavigateToModel,
    handleNavigateToRequest,
    handleBack,
    handleRequestCreate,
    handleModalClose,
    handleModalOpen,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handleGroupGet,
    handleCheckItemReference,
    hasRequestCreateRight,
    hasRequestUpdateRight,
    hasPublishRight,
    hasItemUpdateRight,
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
    handleAssetsGet,
    handleAssetsReload,
    handleSearchTerm: handleAssetSearchTerm,
    totalCount,
    page,
    pageSize,
    handleAssetTableChange,
    handleGetAsset,
  } = useAssetHooks(false);

  return (
    <ContentDetailsMolecule
      hasRequestCreateRight={hasRequestCreateRight}
      hasRequestUpdateRight={hasRequestUpdateRight}
      hasPublishRight={hasPublishRight}
      hasItemUpdateRight={hasItemUpdateRight}
      linkItemModalTitle={linkItemModalTitle}
      linkItemModalTotalCount={linkItemModalTotalCount}
      linkItemModalPage={linkItemModalPage}
      linkItemModalPageSize={linkItemModalPageSize}
      onSearchTerm={handleSearchTerm}
      onLinkItemTableReload={handleLinkItemTableReload}
      onLinkItemTableChange={handleLinkItemTableChange}
      onReferenceModelUpdate={handleReferenceModelUpdate}
      loadingReference={loadingReference}
      linkedItemsModalList={linkedItemsModalList}
      showPublishAction={showPublishAction}
      requests={requests}
      requestCreationLoading={requestCreationLoading}
      onRequestTableChange={handleRequestTableChange}
      onRequestSearchTerm={handleRequestSearchTerm}
      onRequestTableReload={handleRequestTableReload}
      publishLoading={publishLoading}
      requestModalLoading={requestModalLoading}
      requestModalTotalCount={requestModalTotalCount}
      requestModalPage={requestModalPage}
      requestModalPageSize={requestModalPageSize}
      collapsed={collapsedModelMenu}
      onCollapse={collapseModelMenu}
      commentsPanel={
        currentItem ? (
          <CommentsPanel
            resourceId={currentItem.id}
            resourceType={"ITEM"}
            comments={currentItem.comments}
            threadId={currentItem.threadId}
            collapsed={collapsedCommentsPanel}
            onCollapse={collapseCommentsPanel}
            refetchQueries={["GetItem"]}
          />
        ) : undefined
      }
      title={title}
      item={currentItem}
      itemId={itemId}
      itemLoading={itemLoading}
      model={currentModel}
      initialFormValues={initialFormValues}
      initialMetaFormValues={initialMetaFormValues}
      versions={versions}
      loading={itemCreationLoading || itemUpdatingLoading}
      onItemCreate={handleItemCreate}
      onItemUpdate={handleItemUpdate}
      onMetaItemUpdate={handleMetaItemUpdate}
      onBack={handleBack}
      modelsMenu={
        <ModelsMenu
          collapsed={collapsedModelMenu}
          title={t("Content")}
          onModelSelect={handleNavigateToModel}
          selectedSchemaType="model"
          titleIcon={"table"}
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
      onGetVersionedItem={handleGetVersionedItem}
      onUnpublish={handleUnpublish}
      onPublish={handlePublish}
      onUploadModalCancel={handleUploadModalCancel}
      setUploadUrl={setUploadUrl}
      setUploadType={setUploadType}
      onAssetsCreate={handleAssetsCreate}
      onAssetCreateFromUrl={handleAssetCreateFromUrl}
      onAssetsGet={handleAssetsGet}
      onAssetsReload={handleAssetsReload}
      onAssetSearchTerm={handleAssetSearchTerm}
      setFileList={setFileList}
      setUploadModalVisibility={setUploadModalVisibility}
      requestModalShown={requestModalShown}
      addItemToRequestModalShown={addItemToRequestModalShown}
      onRequestCreate={handleRequestCreate}
      onModalClose={handleModalClose}
      onModalOpen={handleModalOpen}
      onAddItemToRequestModalClose={handleAddItemToRequestModalClose}
      onAddItemToRequestModalOpen={handleAddItemToRequestModalOpen}
      workspaceUserMembers={workspaceUserMembers}
      onGetAsset={handleGetAsset}
      onGroupGet={handleGroupGet}
      onCheckItemReference={handleCheckItemReference}
      onNavigateToRequest={handleNavigateToRequest}
    />
  );
};

export default ContentDetails;
