import styled from "@emotion/styled";
import { useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import { useModal } from "@reearth-cms/components/atoms/Modal";
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
  const { confirm } = useModal();

  const confirmDelete = useCallback(
    async (id: string) => {
      confirm({
        title: t("Are you sure you want to delete this API key?"),
        content: t("This action is not reversible."),
        okText: t("Delete"),
        async onOk() {
          await onAPIKeyDelete(id);
        },
      });
    },
    [confirm, onAPIKeyDelete, t],
  );

  const renderActions = useCallback(
    (keyObj: APIKeyModelType) => (
      <Dropdown
        menu={{
          items: [
            {
              key: "edit",
              label: t("Edit"),
              onClick: () => onAPIKeyEdit(keyObj.id),
              icon: <Icon icon="edit" />,
              disabled: !hasUpdateRight,
            },
            {
              key: "delete",
              label: t("Delete"),
              onClick: () => confirmDelete(keyObj.id),
              icon: <Icon icon="trash" />,
              danger: true,
              disabled: !hasDeleteRight,
            },
          ],
        }}
        placement="bottomLeft"
        arrow>
        <Button icon={<Icon icon="ellipsis" />} />
      </Dropdown>
    ),
    [confirmDelete, hasUpdateRight, hasDeleteRight, onAPIKeyEdit, t],
  );

  const columns = useMemo<TableColumnsType<APIKeyModelType>>(
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
        key: "actions",
        title: "",
        render: renderActions,
        width: 48,
      },
    ],
    [renderActions, t],
  );

  const dataSource = useMemo(
    () =>
      keys?.map(key => ({
        id: key.id,
        name: key.name,
        key: key.key,
      })) ?? [],
    [keys],
  );

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
