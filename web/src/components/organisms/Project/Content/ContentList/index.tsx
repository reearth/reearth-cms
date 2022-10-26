import ContentListMolecule from "@reearth-cms/components/molecules/Content/List";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const ContentList: React.FC = () => {
  const t = useT();

  const {
    currentModel,
    contentTableFields,
    contentTableColumns,
    handleModelSelect,
    handleNavigateToItemForm,
    handleNavigateToItemEditForm,
    handleItemsReload,
    itemsDataLoading,
  } = useHooks();

  return (
    <ContentListMolecule
      itemsDataLoading={itemsDataLoading}
      onItemsReload={handleItemsReload}
      onItemEdit={handleNavigateToItemEditForm}
      onItemAdd={handleNavigateToItemForm}
      model={currentModel}
      contentTableFields={contentTableFields}
      contentTableColumns={contentTableColumns}
      modelsMenu={<ModelsMenu title={t("Content")} onModelSelect={handleModelSelect} />}
    />
  );
};

export default ContentList;
