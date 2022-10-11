import ContentForm from "@reearth-cms/components/molecules/Content/Form";
import { ItemField } from "@reearth-cms/components/molecules/Content/types";
import ContentWrapper from "@reearth-cms/components/molecules/Content/Wrapper";
import { Model } from "@reearth-cms/components/molecules/Schema/types";

export type Props = {
  model?: Model;
  modelsMenu: React.ReactNode;
  onItemCreate: (data: { schemaID: string; fields: ItemField[] }) => Promise<void>;
  onItemUpdate: (data: { itemID: string; fields: ItemField[] }) => Promise<void>;
  initialFormValues: { [key: string]: any };
  onBack: () => void;
  itemId?: string;
};

const ContentDetailsMolecule: React.FC<Props> = ({
  model,
  modelsMenu: ModelsMenu,
  onItemCreate,
  onItemUpdate,
  initialFormValues,
  onBack,
  itemId,
}) => {
  return (
    <ContentWrapper modelsMenu={ModelsMenu}>
      <ContentForm
        onBack={onBack}
        itemId={itemId}
        onItemCreate={onItemCreate}
        onItemUpdate={onItemUpdate}
        model={model}
        initialFormValues={initialFormValues}
      />
    </ContentWrapper>
  );
};

export default ContentDetailsMolecule;
