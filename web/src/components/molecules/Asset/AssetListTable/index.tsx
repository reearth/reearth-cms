import styled from "@emotion/styled";
import { Dispatch, SetStateAction } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import CustomTag from "@reearth-cms/components/atoms/CustomTag";
import DownloadButton from "@reearth-cms/components/atoms/DownloadButton";
import Icon from "@reearth-cms/components/atoms/Icon";
import ProTable, {
  ListToolBarProps,
  ProColumns,
  OptionConfig,
  TableRowSelection,
  TablePaginationConfig,
} from "@reearth-cms/components/atoms/ProTable";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat, bytesFormat } from "@reearth-cms/utils/format";
import { dateSortCallback, numberSortCallback, stringSortCallback } from "@reearth-cms/utils/sort";

export type AssetListTableProps = {
  assetList: Asset[];
  assetsPerPage: number | undefined;
  handleEdit: (asset: Asset) => void;
  handleSearchTerm: (term?: string) => void;
  selection: {
    selectedRowKeys: never[];
  };
  setSelection: Dispatch<
    SetStateAction<{
      selectedRowKeys: never[];
    }>
  >;
};

const AssetListTable: React.FC<AssetListTableProps> = ({
  assetList,
  assetsPerPage,
  handleEdit,
  handleSearchTerm,
  selection,
  setSelection,
}) => {
  const t = useT();
  const columns: ProColumns<Asset>[] = [
    {
      title: "",
      render: (_, asset) => (
        <Button type="link" icon={<Icon icon="edit" />} onClick={() => handleEdit(asset)} />
      ),
    },
    {
      title: () => <Icon icon="message" />,
      dataIndex: "commentsCount",
      key: "commentsCount",
      render: (_, _asset) => <CustomTag value={0} />,
    },
    {
      title: t("File"),
      dataIndex: "fileName",
      key: "fileName",
      sorter: (a, b) => stringSortCallback(a.fileName, b.fileName),
    },
    {
      title: t("Size"),
      dataIndex: "size",
      key: "size",
      sorter: (a, b) => numberSortCallback(a.size, b.size),
      render: (_text, record) => bytesFormat(record.size),
    },
    {
      title: t("Preview Type"),
      dataIndex: "previewType",
      key: "previewType",
    },
    {
      title: t("Created At"),
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => dateSortCallback(a.createdAt, b.createdAt),
      render: (_text, record) => dateTimeFormat(record.createdAt),
    },
    {
      title: t("Created By"),
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: t("ID"),
      dataIndex: "id",
      key: "id",
    },
    {
      title: t("Action"),
      render: (_, asset) => (
        <DownloadButton
          type="link"
          filename={asset.fileName}
          url={asset?.url}
          displayDefaultIcon={false}
        />
      ),
    },
  ];

  const options: OptionConfig = {
    search: true,
    reload: false,
  };

  const pagination: TablePaginationConfig = {
    pageSize: assetsPerPage,
    onChange: _page => console.log("implement me"),
    showSizeChanger: false,
  };

  const rowSelection: TableRowSelection = {
    selectedRowKeys: selection.selectedRowKeys,
    onChange: (selectedRowKeys: any) => {
      setSelection({
        ...selection,
        selectedRowKeys: selectedRowKeys,
      });
    },
  };

  const handleToolbarEvents: ListToolBarProps | undefined = {
    search: {
      onSearch: (value: string) => {
        if (value) {
          handleSearchTerm(value);
        } else {
          handleSearchTerm();
        }
      },
    },
  };

  return (
    <AssetListTableWrapper>
      <ProTable
        dataSource={assetList}
        columns={columns}
        search={false}
        rowKey="id"
        options={options}
        pagination={pagination}
        toolbar={handleToolbarEvents}
        rowSelection={rowSelection}
        tableStyle={{ overflowX: "scroll" }}
      />
    </AssetListTableWrapper>
  );
};

const AssetListTableWrapper = styled.div`
  padding: 16px 24px;
`;

export default AssetListTable;
