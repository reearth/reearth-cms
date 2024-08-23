import ContentDetailsMolecule from "@reearth-cms/components/molecules/Content/Details";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";
import useAssetHooks from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import useSettingsHooks from "@reearth-cms/components/organisms/Settings/General/hooks";
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
    currentItem,
    initialFormValues,
    initialMetaFormValues,
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
    handlePublish,
    handleUnpublish,
    handleAddItemToRequest,
    collapseCommentsPanel,
    collapseModelMenu,
    handleItemCreate,
    handleItemUpdate,
    handleMetaItemUpdate,
    handleNavigateToModel,
    handleBack,
    handleRequestCreate,
    handleModalClose,
    handleModalOpen,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handleGroupGet,
    handleCheckItemReference,
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

  const { workspaceSettings, loading: settingsLoading } = useSettingsHooks();

  return (
    <ContentDetailsMolecule
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
            comments={currentItem.comments}
            threadId={currentItem.threadId}
            collapsed={collapsedCommentsPanel}
            onCollapse={collapseCommentsPanel}
            refetchQueries={["GetItem"]}
          />
        ) : undefined
      }
      item={currentItem}
      itemId={itemId}
      itemLoading={itemLoading}
      model={currentModel}
      initialFormValues={initialFormValues}
      initialMetaFormValues={initialMetaFormValues}
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
          displayGroups={false}
          selectedSchemaType="model"
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
      workspaceSettings={workspaceSettings}
      settingsLoading={settingsLoading}
    />
  );
};

export default ContentDetails;
