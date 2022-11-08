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
import UploadAsset from "@reearth-cms/components/molecules/Asset/UploadAsset";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat, bytesFormat } from "@reearth-cms/utils/format";

type Props = {
  // modal props
  visible: boolean;
  onCancel: () => void;
  // table props
  assetList: Asset[];
  fileList: UploadFile<File>[];
  loading: boolean;
  uploading: boolean;
  uploadProps: UploadProps;
  uploadModalVisibility: boolean;
  onLink: (asset: Asset) => void;
  onAssetsReload: () => void;
  onSearchTerm: (term?: string) => void;
  displayUploadModal: () => void;
  hideUploadModal: () => void;
  handleUpload: () => void;
};

const LinkAssetModal: React.FC<Props> = ({
  visible,
  onCancel,
  assetList,
  fileList,
  loading,
  uploading,
  uploadProps,
  uploadModalVisibility,
  onLink,
  onAssetsReload,
  onSearchTerm,
  displayUploadModal,
  hideUploadModal,
  handleUpload,
}) => {
  const t = useT();

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
      render: (_, asset) => (
        <Button
          type="link"
          icon={<Icon icon="link" />}
          onClick={() => {
            onLink(asset);
            onCancel();
          }}
        />
      ),
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
      onCancel={onCancel}
      footer={[
        <UploadAsset
          key={1}
          alsoLink
          fileList={fileList}
          uploading={uploading}
          uploadProps={uploadProps}
          uploadModalVisibility={uploadModalVisibility}
          displayUploadModal={displayUploadModal}
          hideUploadModal={hideUploadModal}
          handleUpload={handleUpload}
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
