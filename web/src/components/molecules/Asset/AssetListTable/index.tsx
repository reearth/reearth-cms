import styled from "@emotion/styled";
import { Key, useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import CustomTag from "@reearth-cms/components/atoms/CustomTag";
import DownloadButton from "@reearth-cms/components/atoms/DownloadButton";
import Icon from "@reearth-cms/components/atoms/Icon";
import Popover from "@reearth-cms/components/atoms/Popover";
import {
  ColumnsState,
  ListToolBarProps,
  OptionConfig,
  StretchColumn,
  TableRowSelection,
} from "@reearth-cms/components/atoms/ProTable";
import Search from "@reearth-cms/components/atoms/Search";
import Space from "@reearth-cms/components/atoms/Space";
import { SorterResult, TablePaginationConfig } from "@reearth-cms/components/atoms/Table";
import ArchiveExtractionStatus from "@reearth-cms/components/molecules/Asset/AssetListTable/ArchiveExtractionStatus";
import {
  Asset,
  AssetItem,
  AssetSortType,
  SortType,
} from "@reearth-cms/components/molecules/Asset/types";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { useT } from "@reearth-cms/i18n";
import { FileUtils } from "@reearth-cms/utils/file";
import { bytesFormat, dateTimeFormat } from "@reearth-cms/utils/format";

import { compressedFileFormats } from "../../Common/Asset";

type Props = {
  assetList: Asset[];
  columns: Record<string, ColumnsState>;
  deleteLoading: boolean;
  hasDeleteRight: boolean;
  loading: boolean;
  onAssetDelete: (assetIds: string[]) => Promise<void>;
  onAssetDownload: (selected: Asset[]) => Promise<void>;
  onAssetItemSelect: (item: AssetItem) => void;
  onAssetSelect: (assetId: string) => void;
  onAssetsReload: () => void;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
  onColumnsChange: (cols: Record<string, ColumnsState>) => void;
  onEdit: (assetId: string) => void;
  onSearchTerm: (term?: string) => void;
  onSelect: (selectedRowKeys: Key[], selectedRows: Asset[]) => void;
  page: number;
  pageSize: number;
  searchTerm: string;
  selectedAsset?: Asset;
  selection: {
    selectedRowKeys: Key[];
  };
  sort?: SortType;
  totalCount: number;
};

const AssetListTable: React.FC<Props> = ({
  assetList,
  columns: columnsState,
  deleteLoading,
  hasDeleteRight,
  loading,
  onAssetDelete,
  onAssetDownload,
  onAssetItemSelect,
  onAssetSelect,
  onAssetsReload,
  onAssetTableChange,
  onColumnsChange,
  onEdit,
  onSearchTerm,
  onSelect,
  page,
  pageSize,
  searchTerm,
  selectedAsset,
  selection,
  sort,
  totalCount,
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
        align: "center",
        hideInSetting: true,
        key: "EDIT_ICON",
        minWidth: 48,
        render: (_, asset) => (
          <Icon color={"#1890ff"} icon="edit" onClick={() => onEdit(asset.id)} />
        ),
        title: "",
        width: 48,
      },
      {
        align: "center",
        dataIndex: "commentsCount",
        hideInSetting: true,
        key: "commentsCount",
        minWidth: 48,
        render: (_, asset) => {
          return (
            <CommentsButton onClick={() => onAssetSelect(asset.id)} type="link">
              <CustomTag
                color={asset.id === selectedAsset?.id ? "#87e8de" : undefined}
                value={asset.comments?.length || 0}
              />
            </CommentsButton>
          );
        },
        title: () => <Icon icon="message" />,
        width: 48,
      },
      {
        dataIndex: "fileName",
        ellipsis: true,
        key: "NAME",
        minWidth: 340,
        sorter: true,
        sortOrder: sortOrderGet("NAME"),
        title: t("File"),
        width: 340,
      },
      {
        dataIndex: "size",
        key: "SIZE",
        minWidth: 100,
        render: (_text, record) => bytesFormat(record.size),
        sorter: true,
        sortOrder: sortOrderGet("SIZE"),
        title: t("Size"),
        width: 100,
      },
      {
        dataIndex: "previewType",
        key: "previewType",
        minWidth: 145,
        title: t("Preview Type"),
        width: 145,
      },
      {
        dataIndex: "archiveExtractionStatus",
        key: "archiveExtractionStatus",
        minWidth: 130,
        render: (_, asset) => {
          const assetExtension = FileUtils.getExtension(asset.fileName);
          return (
            compressedFileFormats.includes(assetExtension) && (
              <ArchiveExtractionStatus archiveExtractionStatus={asset.archiveExtractionStatus} />
            )
          );
        },
        title: t("Status"),
        width: 130,
      },
      {
        dataIndex: "createdAt",
        key: "DATE",
        minWidth: 150,
        render: (_text, record) => dateTimeFormat(record.createdAt),
        sorter: true,
        sortOrder: sortOrderGet("DATE"),
        title: t("Created At"),
        width: 150,
      },
      {
        dataIndex: "createdBy",
        ellipsis: true,
        key: "createdBy",
        minWidth: 105,
        render: (_, item) => <span>{item.createdBy.name}</span>,
        title: t("Created By"),
        width: 105,
      },
      {
        dataIndex: "id",
        ellipsis: true,
        key: "id",
        minWidth: 240,
        title: t("ID"),
        width: 240,
      },
      {
        key: "linkedTo",
        minWidth: 230,
        render: (_, asset) => {
          if (asset.items.length === 1) {
            return (
              <StyledButton onClick={() => onAssetItemSelect(asset?.items[0])} type="link">
                {asset?.items[0].itemId}
              </StyledButton>
            );
          }
          if (asset.items.length > 1) {
            const content = (
              <>
                {asset.items.map(item => (
                  <div key={item.itemId}>
                    <Button onClick={() => onAssetItemSelect(item)} type="link">
                      {item.itemId}
                    </Button>
                  </div>
                ))}
              </>
            );
            return (
              <Popover content={content} placement="bottom" title={t("Linked to")}>
                <MoreItemsButton type="default">
                  <Icon icon="linked" /> x{asset.items.length}
                </MoreItemsButton>
              </Popover>
            );
          }
        },
        title: t("Linked to"),
        width: 230,
      },
    ],
    [onAssetItemSelect, onAssetSelect, onEdit, selectedAsset?.id, sortOrderGet, t],
  );

  const options: OptionConfig = useMemo(
    () => ({
      fullScreen: true,
      reload: onAssetsReload,
      search: true,
    }),
    [onAssetsReload],
  );

  const pagination = useMemo(
    () => ({
      current: page,
      pageSize: pageSize,
      showSizeChanger: true,
      total: totalCount,
    }),
    [page, pageSize, totalCount],
  );

  const rowSelection: TableRowSelection = useMemo(
    () => ({
      onChange: onSelect,
      selectedRowKeys: selection.selectedRowKeys,
    }),
    [onSelect, selection.selectedRowKeys],
  );

  const toolbar: ListToolBarProps = useMemo(
    () => ({
      search: (
        <Search
          allowClear
          defaultValue={searchTerm}
          onSearch={(value: string) => {
            onSearchTerm(value);
          }}
          placeholder={t("input search text")}
        />
      ),
    }),
    [onSearchTerm, searchTerm, t],
  );

  const alertOptions = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any) => {
      const selected = props.selectedRows as Asset[];
      const disabled = !selected || selected.length <= 0;
      return (
        <Space size={4}>
          <DownloadButton
            disabled={disabled}
            displayDefaultIcon
            onDownload={() => onAssetDownload(selected)}
            size="small"
            type="link"
          />
          <Button
            danger
            disabled={!hasDeleteRight}
            icon={<Icon icon="delete" />}
            loading={deleteLoading}
            onClick={() => onAssetDelete(props.selectedRowKeys)}
            size="small"
            type="link">
            {t("Delete")}
          </Button>
        </Space>
      );
    },
    [deleteLoading, hasDeleteRight, onAssetDelete, onAssetDownload, t],
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
        sort = { direction: sorter.order === "ascend" ? "ASC" : "DESC", type: sorter.columnKey };
      }
      onAssetTableChange(page, pageSize, sort);
    },
    [onAssetTableChange],
  );

  return (
    <ResizableProTable
      columns={columns}
      columnsState={{
        defaultValue: {},
        onChange: onColumnsChange,
        value: columnsState,
      }}
      dataSource={assetList}
      heightOffset={73}
      loading={loading}
      onChange={(pagination, _, sorter) => {
        handleChange(pagination, sorter);
      }}
      options={options}
      pagination={pagination}
      rowKey="id"
      rowSelection={rowSelection}
      search={false}
      tableAlertOptionRender={alertOptions}
      toolbar={toolbar}
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
