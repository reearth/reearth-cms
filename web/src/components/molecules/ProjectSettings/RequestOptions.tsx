import styled from "@emotion/styled";
import { useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Switch from "@reearth-cms/components/atoms/Switch";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import { useT } from "@reearth-cms/i18n";

import { Project } from "../Workspace/types";

export type RequestOptionsData = {
  id: string;
  role: string;
  request: JSX.Element;
  needRequest: boolean;
  key?: string;
};

export type Props = {
  project?: Project;
  onProjectUpdate: (name?: string | undefined, description?: string | undefined) => Promise<void>;
};

const ProjectRequestOptions: React.FC<Props> = () => {
  const t = useT();

  const columns: TableColumnsType<RequestOptionsData> = [
    {
      title: t("Role"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("Need request"),
      dataIndex: "public",
      key: "public",
      align: "right",
    },
  ];

  const dataSource: RequestOptionsData[] | undefined = useMemo(() => {
    const columns = [
      {
        id: "assets",
        role: "admin",
        key: "admin",
        needRequest: false,
        request: <Switch />,
      },
    ];

    return columns;
  }, []);

  return (
    <>
      <SeondaryText>
        {t("If this option is chosen, all new model within the project will default follow it")}
      </SeondaryText>
      <TableWrapper>
        <Table dataSource={dataSource} columns={columns} pagination={false} />
      </TableWrapper>
      <Button type="primary" htmlType="submit">
        {t("Save changes")}
      </Button>
    </>
  );
};

export default ProjectRequestOptions;

const SeondaryText = styled.div`
  color: #00000073;
`;

const TableWrapper = styled.div`
  margin: 24px 0;
  max-width: 400px;
`;
