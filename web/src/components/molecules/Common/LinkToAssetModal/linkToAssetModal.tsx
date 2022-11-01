import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import ProTable, {
  ProColumns,
  ListToolBarProps,
  OptionConfig,
} from "@reearth-cms/components/atoms/ProTable";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat, bytesFormat } from "@reearth-cms/utils/format";

type Props = {
  // modal props
  visible: boolean;
  onCancel: () => void;
  // table props
  assetList: Asset[];
  onConnect: (asset: Asset) => void;
  onSearchTerm: (term?: string) => void;
  onAssetsReload: () => void;
  loading: boolean;
};

const LinkToAssetModal: React.FC<Props> = ({
  visible,
  onCancel,
  assetList,
  onConnect,
  onSearchTerm,
  onAssetsReload,
  loading,
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

  const columns: ProColumns<Asset>[] = [
    {
      title: "",
      render: (_, asset) => (
        <Button type="link" icon={<Icon icon="link" />} onClick={() => onConnect(asset)} />
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
      title={t("Link To Asset")}
      centered
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="upload" icon={<Icon icon="upload" />}>
          {t("Upload Asset")}
        </Button>,
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
        toolbar={handleToolbarEvents}
        tableStyle={{ overflowX: "scroll" }}
        loading={loading}
      />
    </Modal>
  );
};

export default LinkToAssetModal;
