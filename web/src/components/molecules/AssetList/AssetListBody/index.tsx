import type { ProTableProps } from "@ant-design/pro-table";
import styled from "@emotion/styled";
import ProTable from "@reearth-cms/components/atoms/ProTable";
import { Asset } from "@reearth-cms/components/organisms/AssetList/asset.type";
import { ConfigProvider } from "antd";
import { Locale } from "antd/lib/locale-provider";

interface AssetListBodyProps extends ProTableProps<Asset, any> {
  providerLocale: Locale;
}

const AssetListBody: React.FC<AssetListBodyProps> = ({
  dataSource,
  columns,
  onRow,
  providerLocale,
  search,
  rowKey,
  options,
  toolbar,
}) => {
  return (
    <AssetListBodyWrapper>
      <ConfigProvider locale={providerLocale}>
        <ProTable
          dataSource={dataSource}
          columns={columns}
          onRow={onRow}
          search={search}
          rowKey={rowKey}
          options={options}
          toolbar={toolbar}
        />
      </ConfigProvider>
    </AssetListBodyWrapper>
  );
};

const AssetListBodyWrapper = styled("div")`
  padding: 16px 24px;
`;

export default AssetListBody;
