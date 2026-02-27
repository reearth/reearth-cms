import styled from "@emotion/styled";
import { useCallback, useMemo, useRef } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import {
  ListToolBarProps,
  OptionConfig,
  StretchColumn,
} from "@reearth-cms/components/atoms/ProTable";
import Search from "@reearth-cms/components/atoms/Search";
import { SorterResult, TablePaginationConfig } from "@reearth-cms/components/atoms/Table";
import { UploadFile, UploadProps } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import UploadAsset from "@reearth-cms/components/molecules/Asset/UploadAsset";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { ItemAsset } from "@reearth-cms/components/molecules/Content/types";
import { useT } from "@reearth-cms/i18n";
import { bytesFormat, dateTimeFormat } from "@reearth-cms/utils/format";

type Props = {
  assetList?: Asset[];
  displayUploadModal: () => void;
  fileList?: UploadFile<File>[];
  hasCreateRight: boolean;
  linkedAsset?: ItemAsset;
  loading?: boolean;
  onAssetsReload?: () => void;
  onAssetTableChange?: (page: number, pageSize: number, sorter?: SortType) => void;
  onChange?: (value: string) => void;
  onLinkAssetModalCancel: () => void;
  onSearchTerm?: (term?: string) => void;
  onSelect: (selectedAsset: ItemAsset) => void;
  onUploadAndLink: () => void;
  onUploadModalCancel?: () => void;
  page?: number;
  pageSize?: number;
  setUploadType?: (type: UploadType) => void;
  setUploadUrl: (uploadUrl: { autoUnzip: boolean; url: string; }) => void;
  totalCount?: number;
  uploading?: boolean;
  uploadModalVisibility?: boolean;
  uploadProps: UploadProps;
  uploadType?: UploadType;
  uploadUrl: { autoUnzip: boolean; url: string; };
  visible: boolean;
};

const LinkAssetModal: React.FC<Props> = ({
  assetList,
  displayUploadModal,
  fileList,
  hasCreateRight,
  linkedAsset,
  loading,
  onAssetsReload,
  onAssetTableChange,
  onChange,
  onLinkAssetModalCancel,
  onSearchTerm,
  onSelect,
  onUploadAndLink,
  onUploadModalCancel,
  page,
  pageSize,
  setUploadType,
  setUploadUrl,
  totalCount,
  uploading,
  uploadModalVisibility,
  uploadProps,
  uploadType,
  uploadUrl,
  visible,
}) => {
  const t = useT();
  const resetFlag = useRef(false);

  const options: OptionConfig = useMemo(
    () => ({
      reload: onAssetsReload,
      search: true,
    }),
    [onAssetsReload],
  );

  const toolbar: ListToolBarProps = {
    search: (
      <Search
        allowClear
        key={+resetFlag.current}
        onSearch={(value: string) => {
          onSearchTerm?.(value);
        }}
        placeholder={t("input search text")}
      />
    ),
  };

  const pagination = useMemo(
    () => ({
      current: page,
      pageSize: pageSize,
      showSizeChanger: true,
      total: totalCount,
    }),
    [page, pageSize, totalCount],
  );

  const onLinkClick = useCallback(
    (isLink: boolean, asset: Asset) => {
      onChange?.(isLink ? asset.id : "");
      onLinkAssetModalCancel();
      if (isLink) onSelect({ fileName: asset.fileName, id: asset.id });
    },
    [onChange, onLinkAssetModalCancel, onSelect],
  );

  const columns: StretchColumn<Asset>[] = useMemo(
    () => [
      {
        align: "center",
        fixed: "left",
        hideInSetting: true,
        minWidth: 48,
        render: (_, asset) => {
          const isLink = asset.id !== linkedAsset?.id;
          return (
            <Button
              icon={<Icon icon={isLink ? "linkSolid" : "unlinkSolid"} size={16} />}
              onClick={() => onLinkClick(isLink, asset)}
              type="link"
            />
          );
        },
        title: "",
        width: 48,
      },
      {
        dataIndex: "fileName",
        ellipsis: true,
        key: "fileName",
        minWidth: 170,
        title: t("File"),
        width: 170,
      },
      {
        dataIndex: "size",
        ellipsis: true,
        key: "size",
        minWidth: 130,
        render: (_text, record) => bytesFormat(record.size),
        title: t("Size"),
        width: 130,
      },
      {
        dataIndex: "previewType",
        ellipsis: true,
        key: "previewType",
        minWidth: 130,
        title: t("Preview Type"),
        width: 130,
      },
      {
        dataIndex: "createdAt",
        ellipsis: true,
        key: "createdAt",
        minWidth: 130,
        render: (_text, record) => dateTimeFormat(record.createdAt),
        title: t("Created At"),
        width: 130,
      },
      {
        dataIndex: ["createdBy", "name"],
        ellipsis: true,
        key: "createdBy",
        minWidth: 100,
        render: (_, item) => item.createdBy.name,
        title: t("Created By"),
        width: 100,
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
      afterClose={() => {
        onSearchTerm?.();
        resetFlag.current = !resetFlag.current;
      }}
      centered
      footer={[
        <UploadAsset
          alsoLink
          displayUploadModal={displayUploadModal}
          fileList={fileList}
          hasCreateRight={hasCreateRight}
          key={1}
          onUpload={onUploadAndLink}
          onUploadModalCancel={onUploadModalCancel}
          onUploadModalClose={onLinkAssetModalCancel}
          setUploadType={setUploadType}
          setUploadUrl={setUploadUrl}
          uploading={uploading}
          uploadModalVisibility={uploadModalVisibility}
          uploadProps={uploadProps}
          uploadType={uploadType}
          uploadUrl={uploadUrl}
        />,
      ]}
      onCancel={onLinkAssetModalCancel}
      open={visible}
      styles={{
        body: {
          height: "70vh",
        },
      }}
      title={t("Link Asset")}
      width="70vw">
      <ResizableProTable
        columns={columns}
        dataSource={assetList}
        heightOffset={0}
        loading={loading}
        onChange={(pagination, _, sorter) => {
          handleChange(pagination, sorter);
        }}
        options={options}
        pagination={pagination}
        search={false}
        toolbar={toolbar}
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
