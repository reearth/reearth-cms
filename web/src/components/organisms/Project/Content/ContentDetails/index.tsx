import ContentDetailsMolecule from "@reearth-cms/components/molecules/Content/Details";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";
import useAssetHooks from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const ContentDetails: React.FC = () => {
  const t = useT();

  const {
    addItemToRequestModalShown,
    collapseCommentsPanel,
    collapsedCommentsPanel,
    collapsedModelMenu,
    collapseModelMenu,
    currentItem,
    currentModel,
    handleAddItemToRequest,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handleBack,
    handleCheckItemReference,
    handleGetVersionedItem,
    handleGroupGet,
    handleItemCreate,
    handleItemUpdate,
    handleLinkItemTableChange,
    handleLinkItemTableReload,
    handleMetaItemUpdate,
    handleModalClose,
    handleModalOpen,
    handleNavigateToModel,
    handleNavigateToRequest,
    handlePublish,
    handleReferenceModelUpdate,
    handleRequestCreate,
    handleRequestSearchTerm,
    handleRequestTableChange,
    handleRequestTableReload,
    handleSearchTerm,
    handleUnpublish,
    hasItemUpdateRight,
    hasPublishRight,
    hasRequestCreateRight,
    hasRequestUpdateRight,
    initialFormValues,
    initialMetaFormValues,
    itemCreationLoading,
    itemId,
    itemLoading,
    itemUpdatingLoading,
    linkedItemsModalList,
    linkItemModalPage,
    linkItemModalPageSize,
    linkItemModalTitle,
    linkItemModalTotalCount,
    loadingReference,
    publishLoading,
    requestCreationLoading,
    requestModalLoading,
    requestModalPage,
    requestModalPageSize,
    requestModalShown,
    requestModalTotalCount,
    requests,
    showPublishAction,
    title,
    versions,
    workspaceUserMembers,
  } = useHooks();

  const {
    assetList,
    fileList,
    handleAssetCreateFromUrl,
    handleAssetsCreate,
    handleAssetsGet,
    handleAssetsReload,
    handleAssetTableChange,
    handleGetAsset,
    handleSearchTerm: handleAssetSearchTerm,
    handleUploadModalCancel,
    loading,
    page,
    pageSize,
    setFileList,
    setUploadModalVisibility,
    setUploadType,
    setUploadUrl,
    totalCount,
    uploading,
    uploadModalVisibility,
    uploadType,
    uploadUrl,
  } = useAssetHooks(false);

  return (
    <ContentDetailsMolecule
      addItemToRequestModalShown={addItemToRequestModalShown}
      assetList={assetList}
      collapsed={collapsedModelMenu}
      commentsPanel={
        currentItem ? (
          <CommentsPanel
            collapsed={collapsedCommentsPanel}
            comments={currentItem.comments}
            onCollapse={collapseCommentsPanel}
            refetchQueries={["GetItem"]}
            resourceId={currentItem.id}
            resourceType={"ITEM"}
            threadId={currentItem.threadId}
          />
        ) : undefined
      }
      fileList={fileList}
      hasItemUpdateRight={hasItemUpdateRight}
      hasPublishRight={hasPublishRight}
      hasRequestCreateRight={hasRequestCreateRight}
      hasRequestUpdateRight={hasRequestUpdateRight}
      initialFormValues={initialFormValues}
      initialMetaFormValues={initialMetaFormValues}
      item={currentItem}
      itemId={itemId}
      itemLoading={itemLoading}
      linkedItemsModalList={linkedItemsModalList}
      linkItemModalPage={linkItemModalPage}
      linkItemModalPageSize={linkItemModalPageSize}
      linkItemModalTitle={linkItemModalTitle}
      linkItemModalTotalCount={linkItemModalTotalCount}
      loading={itemCreationLoading || itemUpdatingLoading}
      loadingAssets={loading}
      loadingReference={loadingReference}
      model={currentModel}
      modelsMenu={
        <ModelsMenu
          collapsed={collapsedModelMenu}
          onModelSelect={handleNavigateToModel}
          selectedSchemaType="model"
          title={t("Content")}
          titleIcon={"table"}
        />
      }
      onAddItemToRequestModalClose={handleAddItemToRequestModalClose}
      onAddItemToRequestModalOpen={handleAddItemToRequestModalOpen}
      onAssetCreateFromUrl={handleAssetCreateFromUrl}
      onAssetsCreate={handleAssetsCreate}
      onAssetSearchTerm={handleAssetSearchTerm}
      onAssetsGet={handleAssetsGet}
      onAssetsReload={handleAssetsReload}
      onAssetTableChange={handleAssetTableChange}
      onBack={handleBack}
      onChange={handleAddItemToRequest}
      onCheckItemReference={handleCheckItemReference}
      onCollapse={collapseModelMenu}
      onGetAsset={handleGetAsset}
      onGetVersionedItem={handleGetVersionedItem}
      onGroupGet={handleGroupGet}
      onItemCreate={handleItemCreate}
      onItemUpdate={handleItemUpdate}
      onLinkItemTableChange={handleLinkItemTableChange}
      onLinkItemTableReload={handleLinkItemTableReload}
      onMetaItemUpdate={handleMetaItemUpdate}
      onModalClose={handleModalClose}
      onModalOpen={handleModalOpen}
      onNavigateToRequest={handleNavigateToRequest}
      onPublish={handlePublish}
      onReferenceModelUpdate={handleReferenceModelUpdate}
      onRequestCreate={handleRequestCreate}
      onRequestSearchTerm={handleRequestSearchTerm}
      onRequestTableChange={handleRequestTableChange}
      onRequestTableReload={handleRequestTableReload}
      onSearchTerm={handleSearchTerm}
      onUnpublish={handleUnpublish}
      onUploadModalCancel={handleUploadModalCancel}
      page={page}
      pageSize={pageSize}
      publishLoading={publishLoading}
      requestCreationLoading={requestCreationLoading}
      requestModalLoading={requestModalLoading}
      requestModalPage={requestModalPage}
      requestModalPageSize={requestModalPageSize}
      requestModalShown={requestModalShown}
      requestModalTotalCount={requestModalTotalCount}
      requests={requests}
      setFileList={setFileList}
      setUploadModalVisibility={setUploadModalVisibility}
      setUploadType={setUploadType}
      setUploadUrl={setUploadUrl}
      showPublishAction={showPublishAction}
      title={title}
      totalCount={totalCount}
      uploading={uploading}
      uploadModalVisibility={uploadModalVisibility}
      uploadType={uploadType}
      uploadUrl={uploadUrl}
      versions={versions}
      workspaceUserMembers={workspaceUserMembers}
    />
  );
};

export default ContentDetails;
