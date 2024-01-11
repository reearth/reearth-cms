import styled from "@emotion/styled";
import { Key, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import CustomTag from "@reearth-cms/components/atoms/CustomTag";
import DownloadButton from "@reearth-cms/components/atoms/DownloadButton";
import Icon from "@reearth-cms/components/atoms/Icon";
import Popover from "@reearth-cms/components/atoms/Popover";
import ProTable, {
  ListToolBarProps,
  ProColumns,
  OptionConfig,
  TableRowSelection,
  TablePaginationConfig,
} from "@reearth-cms/components/atoms/ProTable";
import Space from "@reearth-cms/components/atoms/Space";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { Asset, AssetItem } from "@reearth-cms/components/molecules/Asset/asset.type";
import ArchiveExtractionStatus from "@reearth-cms/components/molecules/Asset/AssetListTable/ArchiveExtractionStatus";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Asset/AssetList/hooks";
import { useT } from "@reearth-cms/i18n";
import { getExtension } from "@reearth-cms/utils/file";
import { dateTimeFormat, bytesFormat } from "@reearth-cms/utils/format";

import { compressedFileFormats } from "../../Common/Asset";

export type AssetListTableProps = {
  assetList: Asset[];
  loading: boolean;
  selectedAsset: Asset | undefined;
  totalCount: number;
  searchTerm: string;
  page: number;
  pageSize: number;
  onAssetItemSelect: (item: AssetItem) => void;
  onAssetSelect: (assetId: string) => void;
  onEdit: (asset: Asset) => void;
  onSearchTerm: (term?: string) => void;
  selection: {
    selectedRowKeys: Key[];
  };
  setSelection: (input: { selectedRowKeys: Key[] }) => void;
  onAssetsReload: () => void;
  onAssetDelete: (assetIds: string[]) => Promise<void>;
  onAssetTableChange: (
    page: number,
    pageSize: number,
    sorter?: { type?: AssetSortType; direction?: SortDirection },
  ) => void;
};

const AssetListTable: React.FC<AssetListTableProps> = ({
  assetList,
  selection,
  loading,
  selectedAsset,
  totalCount,
  searchTerm,
  page,
  pageSize,
  onAssetItemSelect,
  onAssetSelect,
  // onEdit,
  onSearchTerm,
  setSelection,
  onAssetsReload,
  onAssetDelete,
  onAssetTableChange,
}) => {
  const t = useT();

  const columns: ProColumns<Asset>[] = [
    {
      title: "",
      render: (_, asset) => (
        <Link to={asset.id}>
          <Icon icon="edit" />
        </Link>
      ),
      align: "center",
      width: 32,
    },
    {
      title: () => <Icon icon="message" />,
      dataIndex: "commentsCount",
      key: "commentsCount",
      render: (_, asset) => {
        return (
          <CommentsButton type="link" onClick={() => onAssetSelect(asset.id)}>
            <CustomTag
              value={asset.comments?.length || 0}
              color={asset.id === selectedAsset?.id ? "#87e8de" : undefined}
            />
          </CommentsButton>
        );
      },
      align: "center",
      width: 32,
    },
    {
      title: t("File"),
      dataIndex: "fileName",
      key: "NAME",
      sorter: true,
      width: 340,
      ellipsis: true,
    },
    {
      title: t("Size"),
      dataIndex: "size",
      key: "SIZE",
      sorter: true,
      render: (_text, record) => bytesFormat(record.size),
      width: 100,
    },
    {
      title: t("Preview Type"),
      dataIndex: "previewType",
      key: "previewType",
      width: 120,
    },
    {
      title: t("Status"),
      dataIndex: "archiveExtractionStatus",
      key: "archiveExtractionStatus",
      render: (_, asset) => {
        const assetExtension = getExtension(asset.fileName);
        return (
          compressedFileFormats.includes(assetExtension) && (
            <ArchiveExtractionStatus archiveExtractionStatus={asset.archiveExtractionStatus} />
          )
        );
      },
      width: 75,
    },
    {
      title: t("Created At"),
      dataIndex: "createdAt",
      key: "DATE",
      sorter: true,
      render: (_text, record) => dateTimeFormat(record.createdAt),
      width: 150,
    },
    {
      title: t("Created By"),
      dataIndex: "createdBy",
      key: "createdBy",
      render: (_, item) => (
        <Space>
          <UserAvatar username={item.createdBy} size={"small"} />
          {item.createdBy}
        </Space>
      ),
      width: 105,
      ellipsis: true,
    },
    {
      title: t("ID"),
      dataIndex: "id",
      key: "id",
      width: 240,
      ellipsis: true,
    },
    {
      title: t("Linked to"),
      key: "linkedTo",
      render: (_, asset) => {
        if (asset.items.length === 1) {
          return (
            <Button type="link" onClick={() => onAssetItemSelect(asset?.items[0])}>
              {asset?.items[0].itemId}
            </Button>
          );
        }
        if (asset.items.length > 1) {
          const content = (
            <>
              {asset.items.map(item => (
                <div key={item.itemId}>
                  <Button type="link" onClick={() => onAssetItemSelect(item)}>
                    {item.itemId}
                  </Button>
                </div>
              ))}
            </>
          );
          return (
            <Popover placement="bottom" title={t("Linked to")} content={content}>
              <MoreItemsButton type="default">
                <Icon icon="linked" /> x{asset.items.length}
              </MoreItemsButton>
            </Popover>
          );
        }
      },
      width: 95,
    },
  ];

  const options: OptionConfig = {
    search: true,
    reload: onAssetsReload,
  };

  const pagination: TablePaginationConfig = {
    showSizeChanger: true,
    current: page,
    total: totalCount,
    pageSize: pageSize,
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
      defaultValue: searchTerm,
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

  const [isRowSelected, setIsRowSelected] = useState(false);
  useEffect(() => {
    if (selection.selectedRowKeys.length) {
      setIsRowSelected(true);
    } else {
      setIsRowSelected(false);
    }
  }, [selection.selectedRowKeys.length]);

  return (
    <StyledProTable
      dataSource={assetList}
      columns={columns}
      tableAlertOptionRender={AlertOptions}
      search={false}
      rowKey="id"
      options={options}
      pagination={pagination}
      toolbar={handleToolbarEvents}
      rowSelection={rowSelection}
      isRowSelected={isRowSelected}
      loading={loading}
      onChange={(pagination, _, sorter: any) => {
        onAssetTableChange(
          pagination.current ?? 1,
          pagination.pageSize ?? 10,
          sorter?.order
            ? { type: sorter.columnKey, direction: sorter.order === "ascend" ? "ASC" : "DESC" }
            : undefined,
        );
      }}
      scroll={{ x: "", y: "" }}
    />
  );
};

export default AssetListTable;

const CommentsButton = styled(Button)`
  padding: 0;
`;

const DeselectButton = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DeleteButton = styled.a`
  color: #ff7875;
`;

const MoreItemsButton = styled(Button)`
  padding: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1890ff;
`;

const StyledProTable = styled(ProTable)<{ isRowSelected: boolean }>`
  height: calc(100% - 72px);
  .ant-pro-card-body {
    padding-bottom: 0;
  }
  .ant-pro-card,
  .ant-pro-card-body,
  .ant-spin-nested-loading,
  .ant-spin-container,
  .ant-table-container {
    height: 100%;
  }
  .ant-table-wrapper {
    height: ${({ isRowSelected }) => `calc(100% - ${isRowSelected ? 128 : 64}px)`};
  }
  .ant-table {
    height: calc(100% - 64px);
  }
  .ant-table-small,
  .ant-table-middle {
    height: calc(100% - 56px);
  }
  .ant-table-body {
    overflow: auto !important;
    height: calc(100% - 47px);
  }
`;
