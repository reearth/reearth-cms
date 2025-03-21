import ContentListMolecule from "@reearth-cms/components/molecules/Content/List";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";
import ViewsMenu from "@reearth-cms/components/organisms/Project/Content/ViewsMenu";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const ContentList: React.FC = () => {
  const t = useT();

  const {
    currentModel,
    contentTableFields,
    contentTableColumns,
    collapsedModelMenu,
    collapsedCommentsPanel,
    selectedItem,
    selectedItems,
    loading,
    deleteLoading,
    publishLoading,
    unpublishLoading,
    totalCount,
    views,
    currentView,
    searchTerm,
    page,
    pageSize,
    requests,
    addItemToRequestModalShown,
    hasCreateRight,
    hasDeleteRight,
    hasPublishRight,
    hasRequestUpdateRight,
    showPublishAction,
    setCurrentView,
    handleRequestTableChange,
    requestModalLoading,
    requestModalTotalCount,
    requestModalPage,
    requestModalPageSize,
    handleBulkAddItemToRequest: handleAddItemToRequest,
    handlePublish,
    handleUnpublish,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handleSearchTerm,
    handleFilterChange,
    handleSelect,
    handleItemSelect,
    collapseCommentsPanel,
    collapseModelMenu,
    handleModelSelect,
    handleViewChange,
    handleViewSelect,
    handleNavigateToItemForm,
    handleNavigateToItemEditForm,
    handleItemsReload,
    handleItemDelete,
    handleContentTableChange,
    handleRequestSearchTerm,
    handleRequestTableReload,
  } = useHooks();

  return (
    <ContentListMolecule
      commentsPanel={
        <CommentsPanel
          resourceId={selectedItem?.id}
          resourceType={"ITEM"}
          collapsed={collapsedCommentsPanel}
          onCollapse={collapseCommentsPanel}
          comments={selectedItem?.comments}
          threadId={selectedItem?.threadId}
          refetchQueries={["SearchItem"]}
        />
      }
      modelsMenu={
        <ModelsMenu
          title={t("Content")}
          collapsed={collapsedModelMenu}
          onModelSelect={handleModelSelect}
          selectedSchemaType="model"
          titleIcon={"table"}
        />
      }
      viewsMenu={
        <ViewsMenu
          views={views}
          currentView={currentView}
          onViewSelect={handleViewSelect}
          onViewChange={handleViewChange}
        />
      }
      onContentTableChange={handleContentTableChange}
      onSearchTerm={handleSearchTerm}
      onFilterChange={handleFilterChange}
      selectedItem={selectedItem}
      onItemSelect={handleItemSelect}
      collapsed={collapsedModelMenu}
      loading={loading}
      deleteLoading={deleteLoading}
      publishLoading={publishLoading}
      unpublishLoading={unpublishLoading}
      currentView={currentView}
      setCurrentView={setCurrentView}
      totalCount={totalCount}
      searchTerm={searchTerm}
      page={page}
      pageSize={pageSize}
      model={currentModel}
      contentTableFields={contentTableFields}
      contentTableColumns={contentTableColumns}
      selectedItems={selectedItems}
      requests={requests}
      onRequestTableChange={handleRequestTableChange}
      requestModalLoading={requestModalLoading}
      requestModalTotalCount={requestModalTotalCount}
      requestModalPage={requestModalPage}
      requestModalPageSize={requestModalPageSize}
      onSelect={handleSelect}
      onCollapse={collapseModelMenu}
      onItemsReload={handleItemsReload}
      onItemEdit={handleNavigateToItemEditForm}
      onPublish={handlePublish}
      onUnpublish={handleUnpublish}
      onItemDelete={handleItemDelete}
      onItemAdd={handleNavigateToItemForm}
      onAddItemToRequestModalClose={handleAddItemToRequestModalClose}
      onAddItemToRequestModalOpen={handleAddItemToRequestModalOpen}
      onAddItemToRequest={handleAddItemToRequest}
      addItemToRequestModalShown={addItemToRequestModalShown}
      onRequestSearchTerm={handleRequestSearchTerm}
      onRequestTableReload={handleRequestTableReload}
      hasCreateRight={hasCreateRight}
      hasDeleteRight={hasDeleteRight}
      hasPublishRight={hasPublishRight}
      hasRequestUpdateRight={hasRequestUpdateRight}
      showPublishAction={showPublishAction}
    />
  );
};

export default ContentList;
