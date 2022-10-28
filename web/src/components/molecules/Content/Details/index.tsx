import ContentForm from "@reearth-cms/components/molecules/Content/Form";
import { ItemField } from "@reearth-cms/components/molecules/Content/types";
import ContentWrapper from "@reearth-cms/components/molecules/Content/Wrapper";
import { Model } from "@reearth-cms/components/molecules/Schema/types";

export type Props = {
  model?: Model;
  modelsMenu: React.ReactNode;
  onItemCreate: (data: { schemaId: string; fields: ItemField[] }) => Promise<void>;
  onItemUpdate: (data: { itemId: string; fields: ItemField[] }) => Promise<void>;
  initialFormValues: { [key: string]: any };
  onBack: (modelId?: string) => void;
  itemId?: string;
  loading: boolean;
};

const ContentDetailsMolecule: React.FC<Props> = ({
  model,
  modelsMenu: ModelsMenu,
  onItemCreate,
  onItemUpdate,
  initialFormValues,
  onBack,
  itemId,
  loading,
}) => {
  return (
    <ContentWrapper modelsMenu={ModelsMenu}>
      <ContentForm
        loading={loading}
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
