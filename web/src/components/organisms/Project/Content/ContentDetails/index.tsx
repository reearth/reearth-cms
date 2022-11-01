import ContentDetailsMolecule from "@reearth-cms/components/molecules/Content/Details";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const ContentDetails: React.FC = () => {
  const {
    itemId,
    currentModel,
    initialFormValues,
    itemCreationLoading,
    itemUpdatingLoading,
    handleItemCreate,
    handleItemUpdate,
    handleNavigateToModel,
  } = useHooks();
  const t = useT();

  return (
    <ContentDetailsMolecule
      itemId={itemId}
      model={currentModel}
      initialFormValues={initialFormValues}
      loading={itemCreationLoading || itemUpdatingLoading}
      onItemCreate={handleItemCreate}
      onItemUpdate={handleItemUpdate}
      onBack={handleNavigateToModel}
      modelsMenu={<ModelsMenu title={t("Content")} onModelSelect={handleNavigateToModel} />}
    />
  );
};

export default ContentDetails;
