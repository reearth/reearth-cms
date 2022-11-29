import { useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
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
  uploadUrl: string;
  uploadType: UploadType;
  setUploadUrl: (url: string) => void;
  setUploadType: (type: UploadType) => void;
  onLink: (asset?: Asset) => void;
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
  setUploadUrl,
  setUploadType,
  onLink,
  onAssetsReload,
  onSearchTerm,
  displayUploadModal,
  onUploadModalCancel,
  onUploadAndLink,
}) => {
  const t = useT();
  const [hoveredAssetId, setHoveredAssetId] = useState<string>();

  const options: OptionConfig = {
    search: true,
    reload: onAssetsReload,
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

  const pagination: TablePaginationConfig = {
    pageSize: 5,
    showSizeChanger: false,
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
              onLink(link ? asset : undefined);
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
      render: (_text, record) => dateTimeFormat(record.createdAt),
    },
    {
      title: t("Created By"),
      dataIndex: "createdBy",
      key: "createdBy",
    },
  ];

  return (
    <Modal
      title={t("Link Asset")}
      centered
      visible={visible}
      onCancel={onLinkAssetModalCancel}
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
        paddingBottom: "80px",
      }}>
      <ProTable
        dataSource={assetList}
        columns={columns}
        search={false}
        rowKey="id"
        options={options}
        pagination={pagination}
        toolbar={handleToolbarEvents}
        tableStyle={{ overflowX: "scroll" }}
        loading={loading}
      />
    </Modal>
  );
};

export default LinkAssetModal;
