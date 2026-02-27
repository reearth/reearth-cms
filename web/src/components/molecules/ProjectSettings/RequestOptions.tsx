import styled from "@emotion/styled";
import { useCallback, useEffect, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Switch from "@reearth-cms/components/atoms/Switch";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import { Role } from "@reearth-cms/components/molecules/Member/types";
import { useT } from "@reearth-cms/i18n";

type RequestOptionsData = {
  needRequest: Role;
  role: string;
};

type Props = {
  hasUpdateRight: boolean;
  initialRequestRoles: Role[];
  onProjectRequestRolesUpdate: (role: Role[]) => Promise<void>;
};

const RequestOptions: React.FC<Props> = ({
  hasUpdateRight,
  initialRequestRoles,
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
        dataIndex: "role",
        title: t("Role"),
      },
      {
        align: "right",
        dataIndex: "needRequest",
        render: role => (
          <Switch
            checked={requestRoles.includes(role)}
            disabled={!hasUpdateRight || role === "READER"}
            onChange={(value: boolean) => {
              handleChange(value, role);
            }}
          />
        ),
        title: t("Need request"),
      },
    ],
    [handleChange, hasUpdateRight, requestRoles, t],
  );

  const dataSource: RequestOptionsData[] = useMemo(
    () => [
      {
        needRequest: "OWNER",
        role: t("Owner"),
      },
      {
        needRequest: "MAINTAINER",
        role: t("Maintainer"),
      },
      {
        needRequest: "WRITER",
        role: t("Writer"),
      },
      {
        needRequest: "READER",
        role: t("Reader"),
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
      <SecondaryText>
        {t("If this option is chosen, all new model within the project will default follow it.")}
      </SecondaryText>
      <TableWrapper>
        <Table columns={columns} dataSource={dataSource} pagination={false} />
      </TableWrapper>
      <StyledButton disabled={isDisabled} loading={isLoading} onClick={handleSave} type="primary">
        {t("Save changes")}
      </StyledButton>
    </>
  );
};

export default RequestOptions;

const SecondaryText = styled.div`
  color: #00000073;
`;

const TableWrapper = styled.div`
  margin: 24px 0;
  max-width: 400px;
`;

const StyledButton = styled(Button)`
  width: fit-content;
`;
