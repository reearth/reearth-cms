import type { ProTableProps } from "@ant-design/pro-table";
import styled from "@emotion/styled";
import ProTable from "@reearth-cms/components/atoms/ProTable";
import { Asset } from "@reearth-cms/components/organisms/AssetList/asset.type";
import { ConfigProvider } from "antd";
import { Locale } from "antd/lib/locale-provider";

type AssetListTableProps = {
  providerLocale: Locale;
} & ProTableProps<Asset, any>;

const AssetListTable: React.FC<AssetListTableProps> = ({
  dataSource,
  columns,
  providerLocale,
  search,
  rowKey,
  options,
  toolbar,
  rowSelection,
}) => {
  return (
    <AssetListTableWrapper>
      <ConfigProvider locale={providerLocale}>
        <ProTable
          dataSource={dataSource}
          columns={columns}
          search={search}
          rowKey={rowKey}
          options={options}
          toolbar={toolbar}
          rowSelection={rowSelection}
        />
      </ConfigProvider>
    </AssetListTableWrapper>
  );
};

const AssetListTableWrapper = styled("div")`
  padding: 16px 24px;
`;

export default AssetListTable;
