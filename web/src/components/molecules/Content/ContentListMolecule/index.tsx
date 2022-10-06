import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Content from "@reearth-cms/components/atoms/Content";
import Icon from "@reearth-cms/components/atoms/Icon";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import ContentTable from "@reearth-cms/components/molecules/Content/ContentTable";
import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";
import { Model } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  model?: Model;
  contentTableFields?: ContentTableField[];
  contentTableColumns?: ProColumns<ContentTableField>[];
  modelsMenu: React.ReactNode;
  onItemAdd: () => void;
};

const ContentListMolecule: React.FC<Props> = ({
  model,
  contentTableFields,
  contentTableColumns,
  modelsMenu: ModelsMenu,
  onItemAdd,
}) => {
  const t = useT();

  return (
    <PaddedContent>
      <LeftPaneWrapper>{ModelsMenu}</LeftPaneWrapper>
      <ContentChild>
        <PageHeader
          title={model?.name}
          extra={
            <Button
              type="primary"
              onClick={onItemAdd}
              icon={<Icon icon="plus" />}
              disabled={!model}>
              {t("New Item")}
            </Button>
          }
        />
        <StyledContentTable
          contentTableFields={contentTableFields}
          contentTableColumns={contentTableColumns}
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

const StyledContentTable = styled(ContentTable)`
  flex: 1;
  background-color: #fff;
  padding: 24px;
`;

const ContentChild = styled.div`
  flex: 1;
  background-color: #fff;
  padding: 24px;
`;

export default ContentListMolecule;
