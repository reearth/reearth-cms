import ContentDetailsMolecule from "@reearth-cms/components/molecules/Content/Details";
import useCommentHooks from "@reearth-cms/components/organisms/Common/CommentsPanel/hooks";
import useAssetHooks from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const ContentDetails: React.FC = () => {
  const t = useT();

  const {
    userId,
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
    assets,
    loading,
    totalCount,
    page,
    pageSize,
    handleAssetsCreate,
    handleAssetCreateFromUrl,
    handleAssetsGet,
    handleAssetsReload,
    handleSearchTerm: handleAssetSearchTerm,
    handleAssetTableChange,
    handleAssetGet,
  } = useAssetHooks(false);

  const { handleCommentCreate, handleCommentUpdate, handleCommentDelete, ...commentProps } =
    useCommentHooks({
      resourceType: "ITEM",
      refetchQueries: ["GetItem"],
    });

  return (
    <ContentDetailsMolecule
      userId={userId}
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
      assets={assets}
      onAssetTableChange={handleAssetTableChange}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      loadingAssets={loading}
      onGetVersionedItem={handleGetVersionedItem}
      onUnpublish={handleUnpublish}
      onPublish={handlePublish}
      onAssetsCreate={handleAssetsCreate}
      onAssetCreateFromUrl={handleAssetCreateFromUrl}
      onAssetsGet={handleAssetsGet}
      onAssetsReload={handleAssetsReload}
      onAssetSearchTerm={handleAssetSearchTerm}
      requestModalShown={requestModalShown}
      addItemToRequestModalShown={addItemToRequestModalShown}
      onRequestCreate={handleRequestCreate}
      onModalClose={handleModalClose}
      onModalOpen={handleModalOpen}
      onAddItemToRequestModalClose={handleAddItemToRequestModalClose}
      onAddItemToRequestModalOpen={handleAddItemToRequestModalOpen}
      workspaceUserMembers={workspaceUserMembers}
      onAssetGet={handleAssetGet}
      onGroupGet={handleGroupGet}
      onCheckItemReference={handleCheckItemReference}
      onNavigateToRequest={handleNavigateToRequest}
      commentCollapsed={collapsedCommentsPanel}
      onCollapseComment={collapseCommentsPanel}
      commentProps={{
        onCommentCreate: handleCommentCreate,
        onCommentUpdate: handleCommentUpdate,
        onCommentDelete: handleCommentDelete,
        ...commentProps,
      }}
    />
  );
};

export default ContentDetails;
