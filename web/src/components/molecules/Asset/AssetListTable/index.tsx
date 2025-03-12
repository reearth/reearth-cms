import styled from "@emotion/styled";
import { Key, useMemo, useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import CustomTag from "@reearth-cms/components/atoms/CustomTag";
import DownloadButton from "@reearth-cms/components/atoms/DownloadButton";
import Icon from "@reearth-cms/components/atoms/Icon";
import Popover from "@reearth-cms/components/atoms/Popover";
import {
  ListToolBarProps,
  StretchColumn,
  OptionConfig,
  TableRowSelection,
  ColumnsState,
} from "@reearth-cms/components/atoms/ProTable";
import Search from "@reearth-cms/components/atoms/Search";
import Space from "@reearth-cms/components/atoms/Space";
import { SorterResult, TablePaginationConfig } from "@reearth-cms/components/atoms/Table";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import ArchiveExtractionStatus from "@reearth-cms/components/molecules/Asset/AssetListTable/ArchiveExtractionStatus";
import {
  Asset,
  AssetItem,
  AssetSortType,
  SortType,
} from "@reearth-cms/components/molecules/Asset/types";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { useT } from "@reearth-cms/i18n";
import { getExtension } from "@reearth-cms/utils/file";
import { dateTimeFormat, bytesFormat } from "@reearth-cms/utils/format";

import { compressedFileFormats } from "../../Common/Asset";

type Props = {
  assetList: Asset[];
  selection: {
    selectedRowKeys: Key[];
  };
  loading: boolean;
  deleteLoading: boolean;
  selectedAsset?: Asset;
  totalCount: number;
  page: number;
  pageSize: number;
  sort?: SortType;
  searchTerm: string;
  columns: Record<string, ColumnsState>;
  hasDeleteRight: boolean;
  onColumnsChange: (cols: Record<string, ColumnsState>) => void;
  onAssetItemSelect: (item: AssetItem) => void;
  onAssetSelect: (assetId: string) => void;
  onEdit: (assetId: string) => void;
  onSearchTerm: (term?: string) => void;
  onSelect: (selectedRowKeys: Key[], selectedRows: Asset[]) => void;
  onAssetsReload: () => void;
  onAssetDelete: (assetIds: string[]) => Promise<void>;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
};

const AssetListTable: React.FC<Props> = ({
  assetList,
  selection,
  loading,
  deleteLoading,
  selectedAsset,
  totalCount,
  page,
  pageSize,
  sort,
  searchTerm,
  columns: columnsState,
  hasDeleteRight,
  onColumnsChange,
  onAssetItemSelect,
  onAssetSelect,
  onEdit,
  onSearchTerm,
  onSelect,
  onAssetsReload,
  onAssetDelete,
  onAssetTableChange,
}) => {
  const t = useT();

  const sortOrderGet = useCallback(
    (key: AssetSortType) =>
      sort?.type === key ? (sort.direction === "ASC" ? "ascend" : "descend") : null,
    [sort?.direction, sort?.type],
  );

  const columns: StretchColumn<Asset>[] = useMemo(
    () => [
      {
        title: "",
        hideInSetting: true,
        render: (_, asset) => (
          <Icon icon="edit" color={"#1890ff"} onClick={() => onEdit(asset.id)} />
        ),
        key: "EDIT_ICON",
        align: "center",
        width: 48,
        minWidth: 48,
      },
      {
        title: () => <Icon icon="message" />,
        dataIndex: "commentsCount",
        key: "commentsCount",
        hideInSetting: true,
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
        width: 48,
        minWidth: 48,
      },
      {
        title: t("File"),
        dataIndex: "fileName",
        key: "NAME",
        sorter: true,
        sortOrder: sortOrderGet("NAME"),
        width: 340,
        minWidth: 340,
        ellipsis: true,
      },
      {
        title: t("Size"),
        dataIndex: "size",
        key: "SIZE",
        sorter: true,
        sortOrder: sortOrderGet("SIZE"),
        render: (_text, record) => bytesFormat(record.size),
        width: 100,
        minWidth: 100,
      },
      {
        title: t("Preview Type"),
        dataIndex: "previewType",
        key: "previewType",
        width: 145,
        minWidth: 145,
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
        width: 130,
        minWidth: 130,
      },
      {
        title: t("Created At"),
        dataIndex: "createdAt",
        key: "DATE",
        sorter: true,
        sortOrder: sortOrderGet("DATE"),
        render: (_text, record) => dateTimeFormat(record.createdAt),
        width: 150,
        minWidth: 150,
      },
      {
        title: t("Created By"),
        dataIndex: "createdBy",
        key: "createdBy",
        render: (_, item) => (
          <Space>
            <UserAvatar username={item.createdBy.name} size={"small"} />
            {item.createdBy.name}
          </Space>
        ),
        width: 105,
        minWidth: 105,
        ellipsis: true,
      },
      {
        title: t("ID"),
        dataIndex: "id",
        key: "id",
        width: 240,
        minWidth: 240,
        ellipsis: true,
      },
      {
        title: t("Linked to"),
        key: "linkedTo",
        render: (_, asset) => {
          if (asset.items.length === 1) {
            return (
              <StyledButton type="link" onClick={() => onAssetItemSelect(asset?.items[0])}>
                {asset?.items[0].itemId}
              </StyledButton>
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
        width: 230,
        minWidth: 230,
      },
    ],
    [onAssetItemSelect, onAssetSelect, onEdit, selectedAsset?.id, sortOrderGet, t],
  );

  const options: OptionConfig = useMemo(
    () => ({
      search: true,
      fullScreen: true,
      reload: onAssetsReload,
    }),
    [onAssetsReload],
  );

  const pagination = useMemo(
    () => ({
      showSizeChanger: true,
      current: page,
      total: totalCount,
      pageSize: pageSize,
    }),
    [page, pageSize, totalCount],
  );

  const rowSelection: TableRowSelection = useMemo(
    () => ({
      selectedRowKeys: selection.selectedRowKeys,
      onChange: onSelect,
    }),
    [onSelect, selection.selectedRowKeys],
  );

  const toolbar: ListToolBarProps = useMemo(
    () => ({
      search: (
        <Search
          allowClear
          placeholder={t("input search text")}
          onSearch={(value: string) => {
            onSearchTerm(value);
          }}
          defaultValue={searchTerm}
        />
      ),
    }),
    [onSearchTerm, searchTerm, t],
  );

  const alertOptions = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any) => {
      return (
        <Space size={4}>
          <DownloadButton
            displayDefaultIcon
            size="small"
            type="link"
            selected={props.selectedRows}
          />
          <Button
            type="link"
            size="small"
            icon={<Icon icon="delete" />}
            onClick={() => onAssetDelete(props.selectedRowKeys)}
            danger
            loading={deleteLoading}
            disabled={!hasDeleteRight}>
            {t("Delete")}
          </Button>
        </Space>
      );
    },
    [deleteLoading, hasDeleteRight, onAssetDelete, t],
  );

  const handleChange = useCallback(
    (
      pagination: TablePaginationConfig,
      sorter: SorterResult<unknown> | SorterResult<unknown>[],
    ) => {
      const page = pagination.current ?? 1;
      const pageSize = pagination.pageSize ?? 10;
      let sort: SortType | undefined;
      if (
        !Array.isArray(sorter) &&
        (sorter.columnKey === "DATE" ||
          sorter.columnKey === "NAME" ||
          sorter.columnKey === "SIZE") &&
        sorter.order
      ) {
        sort = { type: sorter.columnKey, direction: sorter.order === "ascend" ? "ASC" : "DESC" };
      }
      onAssetTableChange(page, pageSize, sort);
    },
    [onAssetTableChange],
  );

  return (
    <ResizableProTable
      dataSource={assetList}
      columns={columns}
      columnsState={{
        defaultValue: {},
        value: columnsState,
        onChange: onColumnsChange,
      }}
      tableAlertOptionRender={alertOptions}
      search={false}
      rowKey="id"
      options={options}
      pagination={pagination}
      toolbar={toolbar}
      rowSelection={rowSelection}
      loading={loading}
      onChange={(pagination, _, sorter) => {
        handleChange(pagination, sorter);
      }}
      heightOffset={73}
    />
  );
};

export default AssetListTable;

const CommentsButton = styled(Button)`
  padding: 0;
`;

const MoreItemsButton = styled(Button)`
  padding: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1890ff;
`;

const StyledButton = styled(Button)`
  padding: 0;
`;
