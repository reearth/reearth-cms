import styled from "@emotion/styled";

import ProTable, { ProTableProps } from "@reearth-cms/components/atoms/ProTable";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";

const AssetListTable: React.FC<ProTableProps<Asset, any>> = ({
  dataSource,
  columns,
  search,
  rowKey,
  options,
  pagination,
  toolbar,
  rowSelection,
}) => {
  return (
    <AssetListTableWrapper>
      <ProTable
        dataSource={dataSource}
        columns={columns}
        search={search}
        rowKey={rowKey}
        options={options}
        pagination={pagination}
        toolbar={toolbar}
        rowSelection={rowSelection}
      />
    </AssetListTableWrapper>
  );
};

const AssetListTableWrapper = styled.div`
  padding: 16px 24px;
`;

export default AssetListTable;
