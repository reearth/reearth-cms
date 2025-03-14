import styled from "@emotion/styled";
import { useCallback, useEffect, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Switch from "@reearth-cms/components/atoms/Switch";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import { Role } from "@reearth-cms/components/molecules/Member/types";
import { useT } from "@reearth-cms/i18n";

import { Project } from "../Workspace/types";

type RequestOptionsData = {
  role: string;
  needRequest: Role;
};

type Props = {
  project: Project;
  hasUpdateRight: boolean;
  onProjectRequestRolesUpdate: (role: Role[]) => Promise<void>;
};

const ProjectRequestOptions: React.FC<Props> = ({
  project,
  hasUpdateRight,
  onProjectRequestRolesUpdate,
}) => {
  const t = useT();
  const [requestRoles, setRequestRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setRequestRoles(project.requestRoles);
  }, [project.requestRoles]);

  const isDisabled = useMemo(
    () =>
      requestRoles.length === project.requestRoles.length &&
      requestRoles.every(value => project.requestRoles.includes(value)),
    [project.requestRoles, requestRoles],
  );

  const columns: TableColumnsType<RequestOptionsData> = [
    {
      title: t("Role"),
      dataIndex: "role",
      key: "role",
    },
    {
      title: t("Need request"),
      dataIndex: "needRequest",
      key: "needRequest",
      align: "right",
      render: role => (
        <Switch
          checked={requestRoles?.includes(role)}
          onChange={(value: boolean) => {
            if (value) {
              setRequestRoles(prev => [...prev, role]);
            } else {
              setRequestRoles(prev => prev?.filter(p => p !== role));
            }
          }}
          disabled={!hasUpdateRight || role === "READER"}
        />
      ),
    },
  ];

  const dataSource: RequestOptionsData[] = useMemo(
    () => [
      {
        role: t("Owner"),
        needRequest: "OWNER",
      },
      {
        role: t("Maintainer"),
        needRequest: "MAINTAINER",
      },
      {
        role: t("Writer"),
        needRequest: "WRITER",
      },
      {
        role: t("Reader"),
        needRequest: "READER",
      },
    ],
    [t],
  );

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      await onProjectRequestRolesUpdate(requestRoles);
    } finally {
      setIsLoading(false);
    }
  }, [onProjectRequestRolesUpdate, requestRoles]);

  return (
    <>
      <SeondaryText>
        {t("If this option is chosen, all new model within the project will default follow it.")}
      </SeondaryText>
      <TableWrapper>
        <Table dataSource={dataSource} columns={columns} pagination={false} />
      </TableWrapper>
      <Button type="primary" disabled={isDisabled} onClick={handleSave} loading={isLoading}>
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
