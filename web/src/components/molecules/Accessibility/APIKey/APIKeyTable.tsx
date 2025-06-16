import styled from "@emotion/styled";
import { useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import { useT } from "@reearth-cms/i18n";

import { APIKey, APIKeyModelType } from "../types";

import KeyCell from "./KeyCell";

type Props = {
  keys?: APIKey[];
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  onAPIKeyDelete: (id: string) => Promise<void>;
  onAPIKeyEdit: (keyId?: string) => void;
};

const APIKeyTable: React.FC<Props> = ({
  keys,
  hasUpdateRight,
  hasDeleteRight,
  onAPIKeyDelete,
  onAPIKeyEdit,
}) => {
  const t = useT();

  const handleDelete = useCallback(
    async (id: string) => {
      Modal.confirm({
        title: t("Are you sure you want to delete this API key?"),
        content: t("This action is not reversible."),
        icon: <Icon icon="exclamationCircle" />,
        okText: t("Delete"),
        cancelText: t("Cancel"),
        async onOk() {
          await onAPIKeyDelete(id);
        },
      });
    },
    [onAPIKeyDelete, t],
  );

  const dropdownRender = useCallback(
    (keyObj: APIKeyModelType) => {
      return (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                label: "Edit",
                onClick: () => onAPIKeyEdit(keyObj.id),
                icon: <Icon icon="edit" />,
                disabled: !hasUpdateRight,
              },
              {
                key: "delete",
                label: "Delete",
                icon: <Icon icon="trash" />,
                danger: true,
                onClick: () => handleDelete(keyObj.id),
                disabled: !hasDeleteRight,
              },
            ],
          }}
          placement="bottomLeft"
          arrow>
          <Button icon={<Icon icon="ellipsis" />} />
        </Dropdown>
      );
    },
    [handleDelete, hasDeleteRight, hasUpdateRight, onAPIKeyEdit],
  );

  const columns: TableColumnsType<APIKeyModelType> = useMemo(
    () => [
      {
        key: "name",
        title: t("Name"),
        dataIndex: "name",
        width: 220,
      },
      {
        key: "key",
        title: t("Key"),
        dataIndex: "key",
        render: key => <KeyCell apiKey={key} />,
      },
      {
        key: "edit-icon",
        title: "",
        render: dropdownRender,
        width: 48,
      },
    ],
    [dropdownRender, t],
  );

  const dataSource = useMemo(() => {
    const columns: APIKeyModelType[] = [];
    keys?.forEach(key => {
      columns.push({
        id: key.id,
        name: key.name,
        key: key.key,
      });
    });
    return columns;
  }, [keys]);

  return (
    <TableWrapper>
      <Table dataSource={dataSource} columns={columns} pagination={false} />
    </TableWrapper>
  );
};

export default APIKeyTable;

const TableWrapper = styled.div`
  margin: 24px 0;
`;
