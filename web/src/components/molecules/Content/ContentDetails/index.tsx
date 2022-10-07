import styled from "@emotion/styled";

import Content from "@reearth-cms/components/atoms/Content";
import ContentForm from "@reearth-cms/components/molecules/Content/ContentForm";
import { ItemField } from "@reearth-cms/components/molecules/Content/types";
import { Model } from "@reearth-cms/components/molecules/Schema/types";

export type Props = {
  model?: Model;
  modelsMenu: React.ReactNode;
  onItemCreate: (data: { schemaID: string; fields: ItemField[] }) => Promise<void>;
  onItemUpdate: (data: { itemID: string; fields: ItemField[] }) => Promise<void>;
  initialFormValues: { [key: string]: any };
  defaultFormValues: { [key: string]: any };
  onBack: () => void;
  itemId?: string;
};

const ContentDetailsMolecule: React.FC<Props> = ({
  model,
  modelsMenu: ModelsMenu,
  onItemCreate,
  onItemUpdate,
  initialFormValues,
  defaultFormValues,
  onBack,
  itemId,
}) => {
  return (
    <PaddedContent>
      <LeftPaneWrapper>{ModelsMenu}</LeftPaneWrapper>
      <ContentChild>
        <ContentForm
          onBack={onBack}
          itemId={itemId}
          onItemCreate={onItemCreate}
          onItemUpdate={onItemUpdate}
          model={model}
          defaultFormValues={defaultFormValues}
          initialFormValues={initialFormValues}
        />
      </ContentChild>
    </PaddedContent>
  );
};

const LeftPaneWrapper = styled.div`
  width: 200px;
`;

const PaddedContent = styled(Content)`
  margin: 16px;
  background-color: #fff;
  display: flex;
  min-height: 100%;
`;

const ContentChild = styled.div`
  flex: 1;
  background-color: #fff;
  padding: 24px;
`;

export default ContentDetailsMolecule;
