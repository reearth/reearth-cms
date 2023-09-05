import { useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import ProTable, {
  ProColumns,
  TablePaginationConfig,
} from "@reearth-cms/components/atoms/ProTable";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import { FormItem } from "../types";

import useHooks from "./hooks";

type Props = {
  onChange?: (value: string) => void;
  linkedItemsModalList?: FormItem[];
  visible?: boolean;
  linkedItem?: string;
  correspondingFieldId: string;
  linkItemModalTotalCount: number;
  linkItemModalPage: number;
  linkItemModalPageSize: number;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
  onLinkItemModalCancel: () => void;
};

const LinkItemModal: React.FC<Props> = ({
  visible,
  correspondingFieldId,
  linkedItemsModalList,
  linkedItem,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  onLinkItemTableChange,
  onLinkItemModalCancel,
  onChange,
}) => {
  const [hoveredAssetId, setHoveredItemId] = useState<string>();
  const t = useT();
  const { confirm } = Modal;
  const { handleCheckItemReference } = useHooks();

  const pagination: TablePaginationConfig = {
    showSizeChanger: true,
    current: linkItemModalPage,
    total: linkItemModalTotalCount,
    pageSize: linkItemModalPageSize,
  };

  const columns: ProColumns<FormItem>[] = [
    {
      title: "",
      render: (_, item) => {
        const link =
          (item.id === linkedItem && hoveredAssetId !== item.id) ||
          (item.id !== linkedItem && hoveredAssetId === item.id);
        return (
          <Button
            type="link"
            onMouseEnter={() => setHoveredItemId(item.id)}
            onMouseLeave={() => setHoveredItemId(undefined)}
            icon={<Icon icon={link ? "linkSolid" : "unlinkSolid"} size={16} />}
            onClick={async () => {
              if (!link) {
                onChange?.("");
                onLinkItemModalCancel();
                return;
              }

              const response = await handleCheckItemReference(item.id, correspondingFieldId);
              const isReferenced = response?.data?.isItemReferenced;

              if (isReferenced) {
                confirm({
                  title: t("This item has been referenced"),
                  content: t(
                    "Are you going to refer to it? The previous reference will be canceled automatically",
                  ),
                  icon: <Icon icon="exclamationCircle" />,
                  onOk() {
                    onChange?.(item.id);
                    onLinkItemModalCancel();
                  },
                });
              } else {
                onChange?.(item.id);
                onLinkItemModalCancel();
              }
            }}
          />
        );
      },
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: t("Created By"),
      dataIndex: "createdBy",
      key: "createdBy",
      render: (_text, record) => {
        return record?.author;
      },
    },
    {
      title: t("Created At"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_text, record) => dateTimeFormat(record.createdAt),
    },
  ];

  return (
    <Modal
      open={visible}
      title={t("Link item")}
      centered
      width="70vw"
      footer={null}
      onCancel={onLinkItemModalCancel}
      bodyStyle={{
        minHeight: "50vh",
        position: "relative",
        paddingBottom: "80px",
      }}>
      <ProTable
        dataSource={linkedItemsModalList}
        columns={columns}
        search={false}
        rowKey="id"
        options={false}
        pagination={pagination}
        tableStyle={{ overflowX: "scroll" }}
        onChange={pagination => {
          onLinkItemTableChange(pagination.current ?? 1, pagination.pageSize ?? 10);
        }}
      />
    </Modal>
  );
};

export default LinkItemModal;
