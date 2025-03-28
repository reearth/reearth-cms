import styled from "@emotion/styled";
import { Key, useMemo, useCallback, useState } from "react";

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
  userId: string;
  assets: Asset[];
  loading: boolean;
  deleteLoading: boolean;
  selectedAssetId: string;
  totalCount: number;
  page: number;
  pageSize: number;
  sort?: SortType;
  searchTerm: string;
  columns: Record<string, ColumnsState>;
  hasDeleteRight: boolean | null;
  onColumnsChange: (cols: Record<string, ColumnsState>) => void;
  onAssetItemSelect: (item: AssetItem) => void;
  onAssetSelect: (assetId: string) => void;
  onNavigateToAsset: (assetId: string) => void;
  onSearchTerm: (term: string) => void;
  onAssetsReload: () => void;
  onAssetDelete: (assetIds: string[]) => Promise<void>;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
};

const AssetListTable: React.FC<Props> = ({
  userId,
  assets,
  loading,
  deleteLoading,
  selectedAssetId,
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
  onNavigateToAsset,
  onSearchTerm,
  onAssetsReload,
  onAssetDelete,
  onAssetTableChange,
}) => {
  const t = useT();
  const [selection, setSelection] = useState<Key[]>([]);
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(false);

  const sortOrderGet = useCallback(
    (key: AssetSortType) =>
      sort?.type === key ? (sort.direction === "ASC" ? "ascend" : "descend") : null,
    [sort?.direction, sort?.type],
  );

  const columns: StretchColumn<Asset>[] = useMemo(
    () => [
      {
        hideInSetting: true,
        render: (_, asset) => (
          <Button
            color="primary"
            variant="link"
            icon={<Icon icon="edit" />}
            onClick={() => onNavigateToAsset(asset.id)}
          />
        ),
        key: "EDIT_ICON",
        align: "center",
        width: 48,
        minWidth: 48,
      },
      {
        title: () => <Icon icon="message" />,
        dataIndex: "comments",
        hideInSetting: true,
        render: (_, asset) => (
          <CommentsButton type="link" onClick={() => onAssetSelect(asset.id)}>
            <CustomTag
              value={asset.comments.length || 0}
              color={asset.id === selectedAssetId ? "#87e8de" : undefined}
            />
          </CommentsButton>
        ),
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
        width: 145,
        minWidth: 145,
      },
      {
        title: t("Status"),
        dataIndex: "archiveExtractionStatus",
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
        width: 240,
        minWidth: 240,
        ellipsis: true,
      },
      {
        title: t("Linked to"),
        dataIndex: "items",
        render: (_, asset) => {
          if (asset.items.length === 1) {
            return (
              <StyledButton type="link" onClick={() => onAssetItemSelect(asset.items[0])}>
                {asset.items[0].itemId}
              </StyledButton>
            );
          } else if (asset.items.length > 1) {
            return (
              <Popover
                placement="bottom"
                title={t("Linked to")}
                content={asset.items.map(item => (
                  <div key={item.itemId}>
                    <Button type="link" onClick={() => onAssetItemSelect(item)}>
                      {item.itemId}
                    </Button>
                  </div>
                ))}>
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
    [onAssetItemSelect, onAssetSelect, onNavigateToAsset, selectedAssetId, sortOrderGet, t],
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
      selectedRowKeys: selection,
      onChange: (selectedRowKeys, selectedRows) => {
        setSelection(selectedRowKeys);
        if (hasDeleteRight === null) {
          setIsDeleteDisabled(selectedRows.some(row => row.createdBy.id !== userId));
        } else {
          setIsDeleteDisabled(!hasDeleteRight);
        }
      },
    }),
    [hasDeleteRight, selection, userId],
  );

  const toolbar: ListToolBarProps = useMemo(
    () => ({
      search: (
        <Search
          allowClear
          placeholder={t("input search text")}
          onSearch={onSearchTerm}
          defaultValue={searchTerm}
        />
      ),
    }),
    [onSearchTerm, searchTerm, t],
  );

  const handleDelete = useCallback(
    async (ids: string[]) => {
      await onAssetDelete(ids);
      setSelection([]);
    },
    [onAssetDelete],
  );

  const alertOptions = useCallback(
    (props: { selectedRows: Asset[]; selectedRowKeys: Key[] }) => {
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
            onClick={() => handleDelete(props.selectedRowKeys.map(key => key.toString()))}
            danger
            loading={deleteLoading}
            disabled={isDeleteDisabled}>
            {t("Delete")}
          </Button>
        </Space>
      );
    },
    [deleteLoading, handleDelete, isDeleteDisabled, t],
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
      rowKey="id"
      dataSource={assets}
      columns={columns}
      columnsState={{
        value: columnsState,
        onChange: onColumnsChange,
      }}
      tableAlertOptionRender={alertOptions}
      search={false}
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
