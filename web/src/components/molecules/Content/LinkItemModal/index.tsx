import styled from "@emotion/styled";
import { useState, useEffect, ChangeEvent } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import ProTable, {
  ProColumns,
  TablePaginationConfig,
  ListToolBarProps,
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
  linkItemModalTitle?: string;
  linkItemModalTotalCount?: number;
  linkItemModalPage?: number;
  linkItemModalPageSize?: number;
  onSearchTerm: (term?: string) => void;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
  onLinkItemModalCancel: () => void;
};

const LinkItemModal: React.FC<Props> = ({
  visible,
  correspondingFieldId,
  linkedItemsModalList,
  linkedItem,
  linkItemModalTitle,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  onSearchTerm,
  onLinkItemTableChange,
  onLinkItemModalCancel,
  onChange,
}) => {
  const [hoveredAssetId, setHoveredItemId] = useState<string>();
  const t = useT();
  const { confirm } = Modal;
  const { handleCheckItemReference } = useHooks();
  const [value, setValue] = useState("");

  const pagination: TablePaginationConfig = {
    showSizeChanger: true,
    current: linkItemModalPage,
    total: linkItemModalTotalCount,
    pageSize: linkItemModalPageSize,
  };

  const columns: ProColumns<FormItem>[] = [
    {
      title: "",
      width: 40,
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
      ellipsis: true,
    },
    {
      title: t("Title"),
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: t("Created By"),
      dataIndex: "createdBy",
      key: "createdBy",
      ellipsis: true,
    },
    {
      title: t("Created At"),
      dataIndex: "createdAt",
      key: "createdAt",
      ellipsis: true,
      render: (_text, record) => dateTimeFormat(record.createdAt),
    },
  ];

  useEffect(() => {
    if (!visible) {
      setValue("");
    }
  }, [visible]);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const toolbar: ListToolBarProps = {
    search: (
      <Input.Search
        allowClear
        placeholder={t("input search text")}
        onSearch={(value: string) => {
          if (value) {
            onSearchTerm(value);
          } else {
            onSearchTerm();
          }
        }}
        value={value}
        onChange={handleInput}
      />
    ),
  };

  return (
    <Modal
      open={visible}
      title={linkItemModalTitle}
      centered
      width="70vw"
      footer={null}
      onCancel={onLinkItemModalCancel}
      bodyStyle={{
        minHeight: "50vh",
        position: "relative",
        padding: "12px 12px 0",
      }}>
      <StyledProTable
        dataSource={linkedItemsModalList}
        columns={columns}
        search={false}
        rowKey="id"
        options={false}
        toolbar={toolbar}
        pagination={pagination}
        onChange={pagination => {
          onLinkItemTableChange(pagination.current ?? 1, pagination.pageSize ?? 10);
        }}
        scroll={{ x: "max-content", y: 330 }}
      />
    </Modal>
  );
};

export default LinkItemModal;

const StyledProTable = styled(ProTable)`
  .ant-pro-card-body {
    padding: 0;
    .ant-pro-table-list-toolbar {
      padding-left: 12px;
    }
  }
`;
