import styled from "@emotion/styled";
import { useState, useRef } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import ProTable, {
  ProColumns,
  ListToolBarProps,
  OptionConfig,
  TablePaginationConfig,
} from "@reearth-cms/components/atoms/ProTable";
import { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import UploadAsset from "@reearth-cms/components/molecules/Asset/UploadAsset";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Asset/AssetList/hooks";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat, bytesFormat } from "@reearth-cms/utils/format";

type Props = {
  // modal props
  visible: boolean;
  onLinkAssetModalCancel: () => void;
  // table props
  linkedAsset?: Asset;
  assetList: Asset[];
  fileList: UploadFile<File>[];
  loading: boolean;
  uploading: boolean;
  uploadProps: UploadProps;
  uploadModalVisibility: boolean;
  uploadUrl: { url: string; autoUnzip: boolean };
  uploadType: UploadType;
  totalCount: number;
  page: number;
  pageSize: number;
  onAssetTableChange: (
    page: number,
    pageSize: number,
    sorter?: { type?: AssetSortType; direction?: SortDirection },
  ) => void;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  onChange?: (value: string) => void;
  onAssetsReload: () => void;
  onSearchTerm: (term?: string) => void;
  displayUploadModal: () => void;
  onUploadModalCancel: () => void;
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
  onAssetTableChange,
  setUploadUrl,
  setUploadType,
  onChange,
  onAssetsReload,
  onSearchTerm,
  displayUploadModal,
  onUploadModalCancel,
  onUploadAndLink,
}) => {
  const t = useT();
  const [hoveredAssetId, setHoveredAssetId] = useState<string>();
  const resetFlag = useRef(false);

  const options: OptionConfig = {
    search: true,
    reload: onAssetsReload,
  };

  const handleToolbarEvents: ListToolBarProps | undefined = {
    search: (
      <Input.Search
        placeholder={t("Please enter")}
        onSearch={(value: string) => {
          if (value) {
            onSearchTerm(value);
          } else {
            onSearchTerm();
          }
        }}
        key={+resetFlag.current}
      />
    ),
  };

  const pagination: TablePaginationConfig = {
    showSizeChanger: true,
    current: page,
    total: totalCount,
    pageSize: pageSize,
  };

  const columns: ProColumns<Asset>[] = [
    {
      title: "",
      render: (_, asset) => {
        const link =
          (asset.id === linkedAsset?.id && hoveredAssetId !== asset.id) ||
          (asset.id !== linkedAsset?.id && hoveredAssetId === asset.id);
        return (
          <Button
            type="link"
            onMouseEnter={() => setHoveredAssetId(asset.id)}
            onMouseLeave={() => setHoveredAssetId(undefined)}
            icon={<Icon icon={link ? "linkSolid" : "unlinkSolid"} size={16} />}
            onClick={() => {
              onChange?.(link ? asset.id : "");
              onLinkAssetModalCancel();
            }}
          />
        );
      },
    },
    {
      title: t("File"),
      dataIndex: "fileName",
      key: "fileName",
    },
    {
      title: t("Size"),
      dataIndex: "size",
      key: "size",
      render: (_text, record) => bytesFormat(record.size),
      width: 130,
    },
    {
      title: t("Preview Type"),
      dataIndex: "previewType",
      key: "previewType",
      width: 130,
    },
    {
      title: t("Created At"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_text, record) => dateTimeFormat(record.createdAt),
    },
    {
      title: t("Created By"),
      dataIndex: "createdBy",
      key: "createdBy",
      width: 130,
    },
  ];

  return (
    <Modal
      title={t("Link Asset")}
      centered
      open={visible}
      onCancel={onLinkAssetModalCancel}
      afterClose={() => {
        onSearchTerm();
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
          setUploadUrl={setUploadUrl}
          setUploadType={setUploadType}
          displayUploadModal={displayUploadModal}
          onUploadModalCancel={onUploadModalCancel}
          onUpload={onUploadAndLink}
          onUploadModalClose={onLinkAssetModalCancel}
        />,
      ]}
      width="70vw"
      bodyStyle={{
        minHeight: "50vh",
        position: "relative",
        padding: "12px",
      }}>
      <StyledProTable
        dataSource={assetList}
        columns={columns}
        search={false}
        rowKey="id"
        options={options}
        pagination={pagination}
        toolbar={handleToolbarEvents}
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
        scroll={{ x: "max-content", y: 330 }}
      />
    </Modal>
  );
};

export default LinkAssetModal;

const StyledProTable = styled(ProTable)`
  .ant-pro-card-body {
    padding: 0;
    .ant-pro-table-list-toolbar {
      padding-left: 12px;
    }
  }
`;
