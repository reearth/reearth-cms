import styled from "@emotion/styled";

import Content from "@reearth-cms/components/atoms/Content";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import ContentTable from "@reearth-cms/components/molecules/Content/ContentTable";
import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";

export type Props = {
  modelName?: string;
  contentTableFields?: ContentTableField[];
  contentTableColumns?: ProColumns<ContentTableField>[];
  modelsMenu: React.ReactNode;
};

const ContentListMolecule: React.FC<Props> = ({
  modelName,
  contentTableFields,
  contentTableColumns,
  modelsMenu: ModelsMenu,
}) => (
  <PaddedContent>
    <LeftPaneWrapper>{ModelsMenu}</LeftPaneWrapper>
    <ContentChild>
      <PageHeader title={modelName} />
      <StyledContentTable
        contentTableFields={contentTableFields}
        contentTableColumns={contentTableColumns}
      />
    </ContentChild>
  </PaddedContent>
);

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
