import styled from "@emotion/styled";
import Table from "@reearth-cms/components/atoms/Table";
import { Asset } from "@reearth-cms/components/organisms/AssetList/asset.type";
import type { ColumnsType } from "antd/lib/table";
import { GetComponentProps } from "rc-table/lib/interface";

type AssetListBodyProps = {
  fileList: Asset[];
  columns: ColumnsType<Asset>;
  onRow: GetComponentProps<Asset>;
};

const AssetListBody: React.FC<AssetListBodyProps> = ({
  fileList,
  columns,
  onRow,
}) => {
  return (
    <AssetListBodyWrapper>
      <Table dataSource={fileList} columns={columns} onRow={onRow} />
    </AssetListBodyWrapper>
  );
};

const AssetListBodyWrapper = styled("div")`
  padding: 16px 24px;
`;

export default AssetListBody;
