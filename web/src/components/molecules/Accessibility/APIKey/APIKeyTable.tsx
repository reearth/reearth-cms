import styled from "@emotion/styled";
import { useMemo } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import { useT } from "@reearth-cms/i18n";

import { APIKeyType } from "../types";

import KeyCell from "./KeyCell";

type Props = {
  keys: any[];
};

const APIKeyTable: React.FC<Props> = ({ keys }) => {
  const t = useT();

  const handleEdit = (key: string) => {
    // Handle edit action here
    console.log(`Edit key: ${key}`);
  };

  const columns: TableColumnsType<APIKeyType> = useMemo(
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
        render: key => <Icon icon="ellipsis" onClick={() => handleEdit(key)} />,
        width: 48,
      },
    ],
    [t],
  );

  const dataSource = useMemo(() => {
    const columns: APIKeyType[] = [];
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
