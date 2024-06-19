import styled from "@emotion/styled";
import { useCallback, useEffect, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Switch from "@reearth-cms/components/atoms/Switch";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import { useT } from "@reearth-cms/i18n";

import { Project, Role } from "../Workspace/types";

interface RequestOptionsData {
  id: string;
  role: string;
  needRequest: JSX.Element;
}

interface Props {
  project: Project;
  onProjectRequestRolesUpdate: (role?: Role[] | null) => Promise<void>;
}

const ProjectRequestOptions: React.FC<Props> = ({ project, onProjectRequestRolesUpdate }) => {
  const t = useT();
  const [requestRoles, setRequestRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setRequestRoles(project.requestRoles ?? []);
  }, [project.requestRoles]);

  const isDisabled = useMemo(
    () =>
      requestRoles.length === project.requestRoles?.length &&
      requestRoles.every(value => project.requestRoles?.includes(value)),
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
    },
  ];

  const dataSource: RequestOptionsData[] = useMemo(() => {
    const columns = [
      {
        id: "OWNER",
        key: "OWNER",
        role: "Owner",
        needRequest: (
          <Switch
            checked={requestRoles?.includes("OWNER")}
            onChange={(value: boolean) => {
              if (!Array.isArray(requestRoles)) {
                setRequestRoles([]);
              }
              if (value) {
                setRequestRoles(roles => [...(roles as Role[]), "OWNER"]);
              } else {
                setRequestRoles(requestRoles?.filter(role => role !== "OWNER"));
              }
            }}
          />
        ),
      },
      {
        id: "MAINTAINER",
        key: "MAINTAINER",
        role: "Maintainer",
        needRequest: (
          <Switch
            checked={requestRoles?.includes("MAINTAINER")}
            onChange={(value: boolean) => {
              if (!Array.isArray(requestRoles)) {
                setRequestRoles([]);
              }
              if (value) {
                setRequestRoles(roles => [...(roles as Role[]), "MAINTAINER"]);
              } else {
                setRequestRoles(requestRoles?.filter(role => role !== "MAINTAINER"));
              }
            }}
          />
        ),
      },
      {
        id: "WRITER",
        key: "WRITER",
        role: "Writer",
        needRequest: (
          <Switch
            checked={requestRoles?.includes("WRITER")}
            onChange={(value: boolean) => {
              if (!Array.isArray(requestRoles)) {
                setRequestRoles([]);
              }
              if (value) {
                setRequestRoles(roles => [...(roles as Role[]), "WRITER"]);
              } else {
                setRequestRoles(requestRoles?.filter(role => role !== "WRITER"));
              }
            }}
          />
        ),
      },
      {
        id: "READER",
        key: "READER",
        role: "Reader",
        needRequest: (
          <Switch
            checked={requestRoles?.includes("READER")}
            onChange={(value: boolean) => {
              if (!Array.isArray(requestRoles)) {
                setRequestRoles([]);
              }
              if (value) {
                setRequestRoles(roles => [...(roles as Role[]), "READER"]);
              } else {
                setRequestRoles(requestRoles?.filter(role => role !== "READER"));
              }
            }}
            disabled={true}
          />
        ),
      },
    ];

    return columns;
  }, [requestRoles]);

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
        {t("If this option is chosen, all new model within the project will default follow it")}
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
