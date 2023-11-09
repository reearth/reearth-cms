import Tag from "@reearth-cms/components/atoms/Tag";
import ContentListMolecule from "@reearth-cms/components/molecules/Content/List";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";
import ViewsMenu from "@reearth-cms/components/organisms/Project/Content/ViewsMenu";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

export const renderTags = (el: any, field: any) => {
  type Tag = { id: string; name: string; color: string };
  const tags: Tag[] | undefined = field.typeProperty?.tags;
  const value: string = el.props.children as string;
  const tagIds: Set<string> = new Set(value !== "-" ? value.split(", ") : []);
  const filteredTags: Tag[] = tags?.filter((tag: Tag) => tagIds.has(tag.id)) || [];
  return (
    <>
      {filteredTags.map(({ id, name, color }: Tag) => (
        <Tag key={id} color={color.toLowerCase()}>
          {name}
        </Tag>
      ))}
    </>
  );
};

const ContentList: React.FC = () => {
  const t = useT();

  const {
    currentModel,
    contentTableFields,
    contentTableColumns,
    collapsedModelMenu,
    collapsedCommentsPanel,
    selectedItem,
    selection,
    loading,
    totalCount,
    currentView,
    searchTerm,
    page,
    pageSize,
    requests,
    addItemToRequestModalShown,
    setCurrentView,
    handleRequestTableChange,
    requestModalLoading,
    requestModalTotalCount,
    requestModalPage,
    requestModalPageSize,
    handleBulkAddItemToRequest: handleAddItemToRequest,
    handleUnpublish,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handleSearchTerm,
    handleTableControl,
    setSelection,
    handleItemSelect,
    collapseCommentsPanel,
    collapseModelMenu,
    handleModelSelect,
    handleNavigateToItemForm,
    handleNavigateToItemEditForm,
    handleItemsReload,
    handleItemDelete,
    handleContentTableChange,
  } = useHooks();

  return (
    <ContentListMolecule
      commentsPanel={
        <CommentsPanel
          collapsed={collapsedCommentsPanel}
          onCollapse={collapseCommentsPanel}
          emptyText={
            selectedItem
              ? t("No comments.")
              : t("Please click the comment bubble in the table to check comments.")
          }
          comments={selectedItem?.comments}
          threadId={selectedItem?.threadId}
        />
      }
      modelsMenu={
        <ModelsMenu
          title={t("Content")}
          collapsed={collapsedModelMenu}
          onModelSelect={handleModelSelect}
        />
      }
      viewsMenu={<ViewsMenu currentView={currentView} setCurrentView={setCurrentView} />}
      onContentTableChange={handleContentTableChange}
      onSearchTerm={handleSearchTerm}
      onTableControl={handleTableControl}
      selectedItem={selectedItem}
      onItemSelect={handleItemSelect}
      collapsed={collapsedModelMenu}
      itemsDataLoading={loading}
      currentView={currentView}
      setCurrentView={setCurrentView}
      totalCount={totalCount}
      searchTerm={searchTerm}
      page={page}
      pageSize={pageSize}
      model={currentModel}
      contentTableFields={contentTableFields}
      contentTableColumns={contentTableColumns}
      selection={selection}
      requests={requests}
      onRequestTableChange={handleRequestTableChange}
      requestModalLoading={requestModalLoading}
      requestModalTotalCount={requestModalTotalCount}
      requestModalPage={requestModalPage}
      requestModalPageSize={requestModalPageSize}
      setSelection={setSelection}
      onCollapse={collapseModelMenu}
      onItemsReload={handleItemsReload}
      onItemEdit={handleNavigateToItemEditForm}
      onUnpublish={handleUnpublish}
      onItemDelete={handleItemDelete}
      onItemAdd={handleNavigateToItemForm}
      onAddItemToRequestModalClose={handleAddItemToRequestModalClose}
      onAddItemToRequestModalOpen={handleAddItemToRequestModalOpen}
      onAddItemToRequest={handleAddItemToRequest}
      addItemToRequestModalShown={addItemToRequestModalShown}
    />
  );
};

export default ContentList;
