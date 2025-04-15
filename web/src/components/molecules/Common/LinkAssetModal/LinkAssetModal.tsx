import styled from "@emotion/styled";
import { useRef, useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import {
  StretchColumn,
  ListToolBarProps,
  OptionConfig,
} from "@reearth-cms/components/atoms/ProTable";
import Search from "@reearth-cms/components/atoms/Search";
import Space from "@reearth-cms/components/atoms/Space";
import { SorterResult, TablePaginationConfig } from "@reearth-cms/components/atoms/Table";
import { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import UploadAsset from "@reearth-cms/components/molecules/Asset/UploadAsset";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { ItemAsset } from "@reearth-cms/components/molecules/Content/types";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat, bytesFormat } from "@reearth-cms/utils/format";

type Props = {
  visible: boolean;
  onLinkAssetModalCancel: () => void;
  linkedAsset?: ItemAsset;
  assetList?: Asset[];
  fileList?: UploadFile<File>[];
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
  onChange?: (value: string) => void;
  onSelect: (selectedAsset: ItemAsset) => void;
  onAssetsReload?: () => void;
  onSearchTerm?: (term?: string) => void;
  displayUploadModal: () => void;
  onUploadModalCancel?: () => void;
  onUploadAndLink: () => void;
};

const LinkAssetModal: React.FC<Props> = ({
  visible,
  onLinkAssetModalCancel,
  linkedAsset,
  assetList,
  fileList,
  loading,
  uploading,
  uploadProps,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  totalCount,
  page,
  pageSize,
  hasCreateRight,
  onAssetTableChange,
  setUploadUrl,
  setUploadType,
  onChange,
  onSelect,
  onAssetsReload,
  onSearchTerm,
  displayUploadModal,
  onUploadModalCancel,
  onUploadAndLink,
}) => {
  const t = useT();
  const resetFlag = useRef(false);

  const options: OptionConfig = useMemo(
    () => ({
      search: true,
      reload: onAssetsReload,
    }),
    [onAssetsReload],
  );

  const toolbar: ListToolBarProps = {
    search: (
      <Search
        allowClear
        placeholder={t("input search text")}
        onSearch={(value: string) => {
          onSearchTerm?.(value);
        }}
        key={+resetFlag.current}
      />
    ),
  };

  const pagination = useMemo(
    () => ({
      showSizeChanger: true,
      current: page,
      total: totalCount,
      pageSize: pageSize,
    }),
    [page, pageSize, totalCount],
  );

  const onLinkClick = useCallback(
    (isLink: boolean, asset: Asset) => {
      onChange?.(isLink ? asset.id : "");
      onLinkAssetModalCancel();
      if (isLink) onSelect({ id: asset.id, fileName: asset.fileName });
    },
    [onChange, onLinkAssetModalCancel, onSelect],
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
              onClick={() => onLinkClick(isLink, asset)}
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
        render: (_text, record) => bytesFormat(record.size),
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
        render: (_text, record) => dateTimeFormat(record.createdAt),
      },
      {
        title: t("Created By"),
        dataIndex: ["createdBy", "name"],
        key: "createdBy",
        ellipsis: true,
        width: 100,
        minWidth: 100,
        render: (_, item) => (
          <Space>
            <UserAvatar username={item.createdBy.name} size="small" />
            {item.createdBy.name}
          </Space>
        ),
      },
    ],
    [linkedAsset?.id, onLinkClick, t],
  );

  const handleChange = useCallback(
    (
      pagination: TablePaginationConfig,
      sorter: SorterResult<unknown> | SorterResult<unknown>[],
    ) => {
      const page = pagination.current ?? 1;
      const pageSize = pagination.pageSize ?? 10;
      let sort: SortType | undefined;
      if (!Array.isArray(sorter)) {
        if (
          sorter.columnKey === "DATE" ||
          sorter.columnKey === "NAME" ||
          sorter.columnKey === "SIZE"
        ) {
          const direction = sorter.order === "ascend" ? "ASC" : "DESC";
          const type = sorter.columnKey;
          sort = { direction, type };
        }
      }
      onAssetTableChange?.(page, pageSize, sort);
    },
    [onAssetTableChange],
  );

  return (
    <StyledModal
      title={t("Link Asset")}
      centered
      open={visible}
      onCancel={onLinkAssetModalCancel}
      afterClose={() => {
        onSearchTerm?.();
        resetFlag.current = !resetFlag.current;
      }}
      footer={[
        <UploadAsset
          key={1}
          alsoLink
          fileList={fileList}
          uploading={uploading}
          uploadProps={uploadProps}
          uploadModalVisibility={uploadModalVisibility}
          uploadUrl={uploadUrl}
          uploadType={uploadType}
          hasCreateRight={hasCreateRight}
          setUploadUrl={setUploadUrl}
          setUploadType={setUploadType}
          displayUploadModal={displayUploadModal}
          onUploadModalCancel={onUploadModalCancel}
          onUpload={onUploadAndLink}
          onUploadModalClose={onLinkAssetModalCancel}
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
        options={options}
        pagination={pagination}
        toolbar={toolbar}
        loading={loading}
        onChange={(pagination, _, sorter) => {
          handleChange(pagination, sorter);
        }}
        heightOffset={0}
      />
    </StyledModal>
  );
};

export default LinkAssetModal;

const StyledModal = styled(Modal)`
  .ant-pro-card-body {
    padding: 0;
    .ant-pro-table-list-toolbar {
      padding-left: 12px;
    }
  }
`;
