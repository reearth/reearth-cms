import type { ProColumns } from "@ant-design/pro-table";
import { SearchConfig } from "@ant-design/pro-table/lib/components/Form/FormRender";
import { OptionConfig } from "@ant-design/pro-table/lib/components/ToolBar";
import styled from "@emotion/styled";
import ProTable from "@reearth-cms/components/atoms/ProTable";
import { Asset } from "@reearth-cms/components/organisms/AssetList/asset.type";
import { ConfigProvider } from "antd";
import { Locale } from "antd/lib/locale-provider";
import { GetComponentProps, GetRowKey } from "rc-table/lib/interface";

type AssetListBodyProps = {
  dataSource: Asset[];
  columns: ProColumns<Asset>[];
  onRow: GetComponentProps<Asset>;
  locale: Locale;
  search?: false | SearchConfig | undefined;
  rowKey?: string | GetRowKey<Asset> | undefined;
  options?: false | OptionConfig | undefined;
};

const AssetListBody: React.FC<AssetListBodyProps> = ({
  dataSource,
  columns,
  onRow,
  locale,
  search,
  rowKey,
  options,
}) => {
  return (
    <AssetListBodyWrapper>
      <ConfigProvider locale={locale}>
        <ProTable
          dataSource={dataSource}
          columns={columns}
          onRow={onRow}
          search={search}
          rowKey={rowKey}
          options={options}
        />
      </ConfigProvider>
    </AssetListBodyWrapper>
  );
};

const AssetListBodyWrapper = styled("div")`
  padding: 16px 24px;
`;

export default AssetListBody;
