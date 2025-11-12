import styled from "@emotion/styled";
import { useRef, useCallback, useMemo } from "react";

import { AlertProps } from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import {
  StretchColumn,
  ListToolBarProps,
  OptionConfig,
} from "@reearth-cms/components/atoms/ProTable";
import Search from "@reearth-cms/components/atoms/Search";
import { SorterResult, TablePaginationConfig } from "@reearth-cms/components/atoms/Table";
import { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import UploadAsset from "@reearth-cms/components/molecules/Asset/UploadAsset";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { ItemAsset } from "@reearth-cms/components/molecules/Content/types";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat, bytesFormat } from "@reearth-cms/utils/format";

type Props = {
  visible: boolean;
  onModalClose: () => void;
  linkedAsset?: ItemAsset;
  assetList?: Asset[];
  fileList?: UploadFile<File>[];
  alertList?: AlertProps[];
  loading?: boolean;
  uploading?: boolean;
  uploadProps: UploadProps;
  uploadModalVisibility?: boolean;
  uploadUrl: { url: string; autoUnzip: boolean };
  uploadType?: UploadType;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  hasCreateRight: boolean;
  onAssetTableChange?: (page: number, pageSize: number, sorter?: SortType) => void;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType?: (type: UploadType) => void;
  onAssetSelect: (id: string) => void;
  onAssetsReload?: () => void;
  onSearchTerm?: (term?: string) => void;
  onUploadModalOpen: () => void;
  onUploadModalCancel?: () => void;
  onUploadAndLink: () => void;
};

const SelectFileModal: React.FC<Props> = ({
  visible,
  onModalClose,
  linkedAsset,
  assetList,
  fileList,
  alertList,
  loading,
  uploadProps,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  totalCount,
  page,
  pageSize,
  uploading,
  hasCreateRight,
  onAssetTableChange,
  setUploadUrl,
  setUploadType,
  onAssetSelect,
  onAssetsReload,
  onSearchTerm,
  onUploadModalOpen,
  onUploadModalCancel,
  onUploadAndLink,
}) => {
  const t = useT();
  const resetFlag = useRef(false);

  const handleAssetLink = useCallback(
    (asset: Asset) => {
      const isLink = asset.id !== linkedAsset?.id;
      onModalClose();
      if (isLink) {
        onAssetSelect(asset.id);
      }
    },
    [linkedAsset?.id, onAssetSelect, onModalClose],
  );

  const handleModalAfterClose = useCallback(() => {
    onModalClose();
    resetFlag.current = !resetFlag.current;
  }, [onModalClose]);

  const handleTableChange = useCallback(
    (
      pagination: TablePaginationConfig,
      sorter: SorterResult<unknown> | SorterResult<unknown>[],
    ) => {
      const currentPage = pagination.current ?? 1;
      const currentPageSize = pagination.pageSize ?? 10;

      let sort: SortType | undefined;
      if (!Array.isArray(sorter) && sorter.columnKey) {
        const validSortColumns = ["DATE", "NAME", "SIZE"];
        if (validSortColumns.includes(sorter.columnKey as string)) {
          const direction = sorter.order === "ascend" ? "ASC" : "DESC";
          sort = {
            direction,
            type: sorter.columnKey as "DATE" | "NAME" | "SIZE",
          };
        }
      }

      onAssetTableChange?.(currentPage, currentPageSize, sort);
    },
    [onAssetTableChange],
  );

  const columns: StretchColumn<Asset>[] = useMemo(
    () => [
      {
        title: "",
        hideInSetting: true,
        fixed: "left",
        align: "center",
        width: 48,
        minWidth: 48,
        render: (_, asset) => {
          const isLink = asset.id !== linkedAsset?.id;
          return (
            <Button
              type="link"
              icon={<Icon icon={isLink ? "linkSolid" : "unlinkSolid"} size={16} />}
              onClick={() => handleAssetLink(asset)}
            />
          );
        },
      },
      {
        title: t("File"),
        dataIndex: "fileName",
        key: "fileName",
        ellipsis: true,
        width: 170,
        minWidth: 170,
      },
      {
        title: t("Size"),
        dataIndex: "size",
        key: "size",
        render: (_, record) => bytesFormat(record.size),
        ellipsis: true,
        width: 130,
        minWidth: 130,
      },
      {
        title: t("Preview Type"),
        dataIndex: "previewType",
        key: "previewType",
        ellipsis: true,
        width: 130,
        minWidth: 130,
      },
      {
        title: t("Created At"),
        dataIndex: "createdAt",
        key: "createdAt",
        ellipsis: true,
        width: 130,
        minWidth: 130,
        render: (_, record) => dateTimeFormat(record.createdAt),
      },
      {
        title: t("Created By"),
        dataIndex: ["createdBy", "name"],
        key: "createdBy",
        ellipsis: true,
        width: 100,
        minWidth: 100,
      },
    ],
    [linkedAsset?.id, handleAssetLink, t],
  );

  const toolbar: ListToolBarProps = {
    search: (
      <Search
        allowClear
        placeholder={t("input search text")}
        onSearch={(value: string) => onSearchTerm?.(value)}
        key={+resetFlag.current}
      />
    ),
  };

  const tableOptions: OptionConfig = useMemo(
    () => ({
      search: true,
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

  return (
    <StyledModal
      title={t("Select file")}
      centered
      open={visible}
      onCancel={onModalClose}
      afterClose={handleModalAfterClose}
      footer={[
        <UploadAsset
          key={1}
          alsoLink
          fileList={fileList}
          alertList={alertList}
          uploading={uploading}
          uploadProps={uploadProps}
          uploadModalVisibility={uploadModalVisibility}
          uploadUrl={uploadUrl}
          uploadType={uploadType}
          hasCreateRight={hasCreateRight}
          setUploadUrl={setUploadUrl}
          setUploadType={setUploadType}
          displayUploadModal={onUploadModalOpen}
          onUploadModalCancel={onUploadModalCancel}
          onUpload={onUploadAndLink}
          onUploadModalClose={onModalClose}
        />,
      ]}
      width="70vw"
      styles={{
        body: {
          height: "70vh",
        },
      }}>
      <ResizableProTable
        dataSource={assetList}
        columns={columns}
        search={false}
        options={tableOptions}
        pagination={pagination}
        toolbar={toolbar}
        loading={loading}
        onChange={handleTableChange}
        heightOffset={0}
      />
    </StyledModal>
  );
};

export default SelectFileModal;

const StyledModal = styled(Modal)`
  .ant-pro-card-body {
    padding: 0;
    .ant-pro-table-list-toolbar {
      padding-left: 12px;
    }
  }
`;
