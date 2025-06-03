import styled from "@emotion/styled";
import { useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import { useT } from "@reearth-cms/i18n";

import { APIKey, APIKeyModelType } from "../types";

import KeyCell from "./KeyCell";

type Props = {
  keys: APIKey[];
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
                onClick: () => onAPIKeyDelete(keyObj.id),
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
    [hasDeleteRight, hasUpdateRight, onAPIKeyDelete, onAPIKeyEdit],
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
    keys.forEach(key => {
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
