import styled from "@emotion/styled";

import PageHeader, { Props as PageHeaderProps } from "@reearth-cms/components/atoms/PageHeader";
import AssetListTable, {
  AssetListTableProps,
} from "@reearth-cms/components/molecules/Asset/AssetList/AssetListTable";

type Props = {
  pageHeader: PageHeaderProps;
  tableProps: AssetListTableProps;
};
const AssetListBody: React.FC<Props> = ({ pageHeader, tableProps }) => {
  return (
    <Wrapper>
      <PageHeader {...pageHeader} />
      <AssetListTable {...tableProps} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: white;
  height: 100%;
`;

export default AssetListBody;
