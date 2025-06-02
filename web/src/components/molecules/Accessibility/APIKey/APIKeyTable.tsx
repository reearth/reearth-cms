import styled from "@emotion/styled";
import { useMemo } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import { useT } from "@reearth-cms/i18n";

import { APIKey, APIKeyModelType } from "../types";

import KeyCell from "./KeyCell";

type Props = {
  keys: APIKey[];
  onAPIKeyEdit: (keyId: string) => void;
};

const APIKeyTable: React.FC<Props> = ({ keys, onAPIKeyEdit }) => {
  const t = useT();

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
        render: key => <Icon icon="ellipsis" onClick={() => onAPIKeyEdit(key)} />,
        width: 48,
      },
    ],
    [onAPIKeyEdit, t],
  );

  const dataSource = useMemo(() => {
    const columns: APIKeyModelType[] = [];
    keys.forEach(key => {
      columns.push({
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
