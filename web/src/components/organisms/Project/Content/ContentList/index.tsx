import ContentImportModal from "@reearth-cms/components/molecules/Content/ContentImportModal";
import ContentListMolecule from "@reearth-cms/components/molecules/Content/List";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";
import ViewsMenu from "@reearth-cms/components/organisms/Project/Content/ViewsMenu";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const ContentList: React.FC = () => {
  const t = useT();

  const {
    addItemToRequestModalShown,
    alertList,
    collapseCommentsPanel,
    collapsedCommentsPanel,
    collapsedModelMenu,
    collapseModelMenu,
    contentTableColumns,
    contentTableFields,
    currentModel,
    currentProjectId,
    currentView,
    currentWorkspaceId,
    dataChecking,
    deleteLoading,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handleBulkAddItemToRequest: handleAddItemToRequest,
    handleContentTableChange,
    handleEnqueueJob,
    handleFilterChange,
    handleImportContentModalClose,
    handleImportContentModalOpen,
    handleItemDelete,
    handleItemSelect,
    handleItemsReload,
    handleModelSelect,
    handleNavigateToItemEditForm,
    handleNavigateToItemForm,
    handlePublish,
    handleRequestSearchTerm,
    handleRequestTableChange,
    handleRequestTableReload,
    handleSearchTerm,
    handleSelect,
    handleUnpublish,
    handleViewChange,
    handleViewSelect,
    hasCreateRight,
    hasDeleteRight,
    hasModelFields,
    hasPublishRight,
    hasRequestUpdateRight,
    isImportContentModalOpen,
    loading,
    modelFields,
    modelId,
    page,
    pageSize,
    publishLoading,
    requestModalLoading,
    requestModalPage,
    requestModalPageSize,
    requestModalTotalCount,
    requests,
    searchTerm,
    selectedItem,
    selectedItems,
    setAlertList,
    setCurrentView,
    setDataChecking,
    setValidateImportResult,
    showPublishAction,
    totalCount,
    unpublishLoading,
    validateImportResult,
    views,
  } = useHooks();

  return (
    <>
      <ContentListMolecule
        addItemToRequestModalShown={addItemToRequestModalShown}
        collapsed={collapsedModelMenu}
        commentsPanel={
          <CommentsPanel
            collapsed={collapsedCommentsPanel}
            comments={selectedItem?.comments}
            onCollapse={collapseCommentsPanel}
            refetchQueries={["SearchItem"]}
            resourceId={selectedItem?.id}
            resourceType={"ITEM"}
            threadId={selectedItem?.threadId}
          />
        }
        contentTableColumns={contentTableColumns}
        contentTableFields={contentTableFields}
        currentView={currentView}
        deleteLoading={deleteLoading}
        hasCreateRight={hasCreateRight}
        hasDeleteRight={hasDeleteRight}
        hasModelFields={hasModelFields}
        hasPublishRight={hasPublishRight}
        hasRequestUpdateRight={hasRequestUpdateRight}
        loading={loading}
        model={currentModel}
        modelFields={modelFields}
        modelsMenu={
          <ModelsMenu
            collapsed={collapsedModelMenu}
            onModelSelect={handleModelSelect}
            selectedSchemaType="model"
            title={t("Content")}
            titleIcon={"table"}
          />
        }
        onAddItemToRequest={handleAddItemToRequest}
        onAddItemToRequestModalClose={handleAddItemToRequestModalClose}
        onAddItemToRequestModalOpen={handleAddItemToRequestModalOpen}
        onCollapse={collapseModelMenu}
        onContentTableChange={handleContentTableChange}
        onFilterChange={handleFilterChange}
        onImportModalOpen={handleImportContentModalOpen}
        onItemAdd={handleNavigateToItemForm}
        onItemDelete={handleItemDelete}
        onItemEdit={handleNavigateToItemEditForm}
        onItemSelect={handleItemSelect}
        onItemsReload={handleItemsReload}
        onPublish={handlePublish}
        onRequestSearchTerm={handleRequestSearchTerm}
        onRequestTableChange={handleRequestTableChange}
        onRequestTableReload={handleRequestTableReload}
        onSearchTerm={handleSearchTerm}
        onSelect={handleSelect}
        onUnpublish={handleUnpublish}
        page={page}
        pageSize={pageSize}
        publishLoading={publishLoading}
        requestModalLoading={requestModalLoading}
        requestModalPage={requestModalPage}
        requestModalPageSize={requestModalPageSize}
        requestModalTotalCount={requestModalTotalCount}
        requests={requests}
        searchTerm={searchTerm}
        selectedItem={selectedItem}
        selectedItems={selectedItems}
        setCurrentView={setCurrentView}
        showPublishAction={showPublishAction}
        totalCount={totalCount}
        unpublishLoading={unpublishLoading}
        viewsMenu={
          <ViewsMenu
            currentView={currentView}
            onViewChange={handleViewChange}
            onViewSelect={handleViewSelect}
            views={views}
          />
        }
      />
      <ContentImportModal
        alertList={alertList}
        dataChecking={dataChecking}
        isOpen={isImportContentModalOpen}
        modelFields={modelFields}
        modelId={modelId}
        onClose={handleImportContentModalClose}
        onEnqueueJob={handleEnqueueJob}
        onSetDataChecking={setDataChecking}
        projectId={currentProjectId}
        setAlertList={setAlertList}
        setValidateImportResult={setValidateImportResult}
        validateImportResult={validateImportResult}
        workspaceId={currentWorkspaceId}
      />
    </>
  );
};

export default ContentList;
