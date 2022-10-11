import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import ContentTable from "@reearth-cms/components/molecules/Content/Table";
import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";
import ContentWrapper from "@reearth-cms/components/molecules/Content/Wrapper";
import { Model } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  model?: Model;
  contentTableFields?: ContentTableField[];
  contentTableColumns?: ProColumns<ContentTableField>[];
  modelsMenu: React.ReactNode;
  onItemAdd: () => void;
  onItemEdit: (itemId: string) => void;
};

const ContentListMolecule: React.FC<Props> = ({
  model,
  contentTableFields,
  contentTableColumns,
  modelsMenu: ModelsMenu,
  onItemAdd,
  onItemEdit,
}) => {
  const t = useT();

  return (
    <ContentWrapper modelsMenu={ModelsMenu}>
      <PageHeader
        title={model?.name}
        extra={
          <Button type="primary" onClick={onItemAdd} icon={<Icon icon="plus" />} disabled={!model}>
            {t("New Item")}
          </Button>
        }
      />
      <StyledContentTable
        onItemEdit={onItemEdit}
        contentTableFields={contentTableFields}
        contentTableColumns={contentTableColumns}
      />
    </ContentWrapper>
  );
};

const StyledContentTable = styled(ContentTable)`
  flex: 1;
  background-color: #fff;
  padding: 24px;
`;

export default ContentListMolecule;
