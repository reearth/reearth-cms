import styled from "@emotion/styled";
import { Key } from "react";

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
import Space from "@reearth-cms/components/atoms/Space";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import ArchiveExtractionStatus from "@reearth-cms/components/molecules/Asset/AssetListTable/ArchiveExtractionStatus";
import { useT } from "@reearth-cms/i18n";
import { getExtension } from "@reearth-cms/utils/file";
import { dateTimeFormat, bytesFormat } from "@reearth-cms/utils/format";
import { dateSortCallback, numberSortCallback, stringSortCallback } from "@reearth-cms/utils/sort";

export type AssetListTableProps = {
  assetList: Asset[];
  assetsPerPage: number | undefined;
  loading: boolean;
  selectedAsset: Asset | undefined;
  onAssetSelect: (assetId: string) => void;
  onEdit: (asset: Asset) => void;
  onSearchTerm: (term?: string) => void;
  selection: {
    selectedRowKeys: Key[];
  };
  setSelection: (input: { selectedRowKeys: Key[] }) => void;
  onAssetsReload: () => void;
  onAssetDelete: (assetIds: string[]) => Promise<void>;
};

const AssetListTable: React.FC<AssetListTableProps> = ({
  assetList,
  assetsPerPage,
  selection,
  loading,
  selectedAsset,
  onAssetSelect,
  onEdit,
  onSearchTerm,
  setSelection,
  onAssetsReload,
  onAssetDelete,
}) => {
  const t = useT();

  const columns: ProColumns<Asset>[] = [
    {
      title: "",
      render: (_, asset) => (
        <Button type="link" icon={<Icon icon="edit" />} onClick={() => onEdit(asset)} />
      ),
    },
    {
      title: () => <Icon icon="message" />,
      dataIndex: "commentsCount",
      key: "commentsCount",
      render: (_, asset) => {
        return (
          <Button type="link" onClick={() => onAssetSelect(asset.id)}>
            <CustomTag
              value={asset.comments?.length || 0}
              color={asset.id === selectedAsset?.id ? "#87e8de" : undefined}
            />
          </Button>
        );
      },
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
      title: t("Status"),
      dataIndex: "archiveExtractionStatus",
      key: "archiveExtractionStatus",
      render: (_, asset) =>
        getExtension(asset.fileName) === "zip" && (
          <ArchiveExtractionStatus archiveExtractionStatus={asset.archiveExtractionStatus} />
        ),
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
  ];

  const options: OptionConfig = {
    search: true,
    reload: onAssetsReload,
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
          onSearchTerm(value);
        } else {
          onSearchTerm();
        }
      },
    },
  };

  const AlertOptions = (props: any) => {
    return (
      <Space size={16}>
        <DeselectButton onClick={props.onCleanSelected}>
          <Icon icon="clear" /> {t("Deselect")}
        </DeselectButton>
        <DownloadButton displayDefaultIcon type="link" selected={props.selectedRows} />
        <DeleteButton onClick={() => onAssetDelete?.(props.selectedRowKeys)}>
          <Icon icon="delete" /> {t("Delete")}
        </DeleteButton>
      </Space>
    );
  };

  return (
    <ProTable
      dataSource={assetList}
      columns={columns}
      tableAlertOptionRender={AlertOptions}
      search={false}
      rowKey="id"
      options={options}
      pagination={pagination}
      toolbar={handleToolbarEvents}
      rowSelection={rowSelection}
      tableStyle={{ overflowX: "scroll" }}
      loading={loading}
    />
  );
};

export default AssetListTable;

const DeselectButton = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DeleteButton = styled.a`
  color: #ff7875;
`;
