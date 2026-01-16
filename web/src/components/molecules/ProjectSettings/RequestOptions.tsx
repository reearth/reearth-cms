import styled from "@emotion/styled";
import { useCallback, useEffect, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Switch from "@reearth-cms/components/atoms/Switch";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import { Role } from "@reearth-cms/components/molecules/Member/types";
import { useT } from "@reearth-cms/i18n";

type RequestOptionsData = {
  role: string;
  needRequest: Role;
};

type Props = {
  initialRequestRoles: Role[];
  hasUpdateRight: boolean;
  onProjectRequestRolesUpdate: (role: Role[]) => Promise<void>;
};

const RequestOptions: React.FC<Props> = ({
  initialRequestRoles,
  hasUpdateRight,
  onProjectRequestRolesUpdate,
}) => {
  const t = useT();
  const [requestRoles, setRequestRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    setRequestRoles(initialRequestRoles);
  }, [initialRequestRoles]);

  const handleChange = useCallback(
    (isChecked: boolean, role: Role) => {
      const newRequestRoles = isChecked
        ? [...requestRoles, role]
        : requestRoles.filter(p => p !== role);
      setRequestRoles(newRequestRoles);
      setIsDisabled(
        newRequestRoles.length === initialRequestRoles.length &&
          newRequestRoles.every(r => initialRequestRoles.includes(r)),
      );
    },
    [initialRequestRoles, requestRoles],
  );

  const columns: TableColumnsType<RequestOptionsData> = useMemo(
    () => [
      {
        title: t("Role"),
        dataIndex: "role",
      },
      {
        title: t("Need request"),
        dataIndex: "needRequest",
        align: "right",
        render: role => (
          <Switch
            checked={requestRoles.includes(role)}
            onChange={(value: boolean) => {
              handleChange(value, role);
            }}
            disabled={!hasUpdateRight || role === "READER"}
          />
        ),
      },
    ],
    [handleChange, hasUpdateRight, requestRoles, t],
  );

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
    setIsDisabled(true);
    try {
      await onProjectRequestRolesUpdate(requestRoles);
    } catch (_) {
      setIsDisabled(false);
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

export default RequestOptions;

const SeondaryText = styled.div`
  color: #00000073;
`;

const TableWrapper = styled.div`
  margin: 24px 0;
  max-width: 400px;
`;
