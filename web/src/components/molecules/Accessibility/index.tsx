import styled from "@emotion/styled";
import { Switch } from "antd";
import { useCallback, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import Select from "@reearth-cms/components/atoms/Select";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import { useT } from "@reearth-cms/i18n";

export type PublicScope = "private" | "limited" | "public";

export type Model = {
  id: string;
  name: string;
  public: boolean;
};

export type ModelDataType = {
  name: string;
  public: JSX.Element;
};

export type Props = {
  projectScope: PublicScope;
  models?: Model[];
  onAccessibilityUpdate?: (scope: PublicScope, modelsToUpdate?: Model[]) => void;
};

const Accessibility: React.FC<Props> = ({ projectScope, models, onAccessibilityUpdate }) => {
  const t = useT();
  const [scope, changeScope] = useState<PublicScope>(projectScope);

  const columns: TableColumnsType<ModelDataType> = [
    {
      title: t("Model"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("Switch"),
      dataIndex: "public",
      key: "public",
      align: "right",
      width: 72,
    },
  ];

  const dataSource: ModelDataType[] | undefined = useMemo(
    () =>
      models?.map(m => {
        return {
          name: m.name,
          public: <Switch checked={m.public} />,
        };
      }),
    [models],
  );

  const publicScopeList = [
    { id: 1, name: t("Private"), value: "private" },
    // {
    //   id: 2,
    //   name: t("API Key Only"),
    //   value: "limited",
    // },
    { id: 3, name: t("Public"), value: "public" },
  ];

  const handleAccessibilityUpdate = useCallback(() => {
    onAccessibilityUpdate?.(scope);
  }, [scope, onAccessibilityUpdate]);

  return (
    <InnerContent title={t("Accessibility")}>
      <>
        <div>
          <p>Public Scope</p>
          <Select
            defaultValue={projectScope}
            value={scope}
            onChange={changeScope}
            style={{ minWidth: "130px" }}>
            {publicScopeList.map(type => (
              <Select.Option key={type.id} value={type.value}>
                {type.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        <TableWrapper>
          <Table dataSource={dataSource} columns={columns} pagination={false} />
        </TableWrapper>
        <Button type="primary" onClick={handleAccessibilityUpdate}>
          {t("Save changes")}
        </Button>
      </>
    </InnerContent>
  );
};

export default Accessibility;

const TableWrapper = styled.div`
  width: 304px;
  margin: 24px 0;
`;
