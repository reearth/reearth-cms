import { useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import ProTable, { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import { linkedItemsModalField } from "../types";

type Props = {
  onChange?: (value: string) => void;
  linkedItemsModalList?: linkedItemsModalField[];
  visible?: boolean;
  linkedItem?: string;
  onLinkItemModalCancel: () => void;
};

const LinkItemModal: React.FC<Props> = ({
  visible,
  linkedItemsModalList,
  linkedItem,
  onLinkItemModalCancel,
  onChange,
}) => {
  const [hoveredAssetId, setHoveredItemId] = useState<string>();
  const t = useT();

  const submit = () => {};

  const columns: ProColumns<linkedItemsModalField>[] = [
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
            onClick={() => {
              onChange?.(link ? item.id : "");
              onLinkItemModalCancel();
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
      onOk={submit}
      width="70vw"
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
        tableStyle={{ overflowX: "scroll" }}
      />
    </Modal>
  );
};

export default LinkItemModal;
