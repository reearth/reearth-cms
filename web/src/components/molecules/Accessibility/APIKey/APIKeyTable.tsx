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
  hasDeleteRight: boolean;
  hasUpdateRight: boolean;
  keys?: APIKey[];
  onAPIKeyDelete: (id: string) => Promise<void>;
  onAPIKeyEdit: (keyId?: string) => void;
};

const APIKeyTable: React.FC<Props> = ({
  hasDeleteRight,
  hasUpdateRight,
  keys,
  onAPIKeyDelete,
  onAPIKeyEdit,
}) => {
  const t = useT();
  const { confirm } = useModal();

  const confirmDelete = useCallback(
    async (id: string) => {
      confirm({
        content: t("This action is not reversible."),
        okText: t("Delete"),
        async onOk() {
          await onAPIKeyDelete(id);
        },
        title: t("Are you sure you want to delete this API key?"),
      });
    },
    [confirm, onAPIKeyDelete, t],
  );

  const renderActions = useCallback(
    (keyObj: APIKeyModelType) => (
      <Dropdown
        arrow
        menu={{
          items: [
            {
              disabled: !hasUpdateRight,
              icon: <Icon icon="edit" />,
              key: "edit",
              label: t("Edit"),
              onClick: () => onAPIKeyEdit(keyObj.id),
            },
            {
              danger: true,
              disabled: !hasDeleteRight,
              icon: <Icon icon="trash" />,
              key: "delete",
              label: t("Delete"),
              onClick: () => confirmDelete(keyObj.id),
            },
          ],
        }}
        placement="bottomLeft">
        <Button icon={<Icon icon="ellipsis" />} />
      </Dropdown>
    ),
    [confirmDelete, hasUpdateRight, hasDeleteRight, onAPIKeyEdit, t],
  );

  const columns: TableColumnsType<APIKeyModelType> = useMemo(
    () => [
      {
        dataIndex: "name",
        key: "name",
        title: t("Name"),
        width: 220,
      },
      {
        dataIndex: "key",
        key: "key",
        render: key => <KeyCell apiKey={key} />,
        title: t("Key"),
      },
      {
        key: "actions",
        render: renderActions,
        title: "",
        width: 48,
      },
    ],
    [renderActions, t],
  );

  const dataSource = useMemo(
    () =>
      keys?.map(key => ({
        id: key.id,
        key: key.key,
        name: key.name,
      })) ?? [],
    [keys],
  );

  return (
    <TableWrapper>
      <Table columns={columns} dataSource={dataSource} pagination={false} />
    </TableWrapper>
  );
};

export default APIKeyTable;

const TableWrapper = styled.div`
  margin: 24px 0;
`;
