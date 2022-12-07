import ContentListMolecule from "@reearth-cms/components/molecules/Content/List";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";
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
    handleItemSelect,
    collapseCommentsPanel,
    collapseModelMenu,
    handleModelSelect,
    handleNavigateToItemForm,
    handleNavigateToItemEditForm,
    handleItemsReload,
    itemsDataLoading,
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
      selectedItem={selectedItem}
      onItemSelect={handleItemSelect}
      collapsed={collapsedModelMenu}
      itemsDataLoading={itemsDataLoading}
      model={currentModel}
      contentTableFields={contentTableFields}
      contentTableColumns={contentTableColumns}
      modelsMenu={
        <ModelsMenu
          title={t("Content")}
          collapsed={collapsedModelMenu}
          onModelSelect={handleModelSelect}
        />
      }
      onCollapse={collapseModelMenu}
      onItemsReload={handleItemsReload}
      onItemEdit={handleNavigateToItemEditForm}
      onItemAdd={handleNavigateToItemForm}
    />
  );
};

export default ContentList;
