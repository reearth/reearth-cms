import styled from "@emotion/styled";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import Input from "@reearth-cms/components/atoms/Input";
import Select from "@reearth-cms/components/atoms/Select";
import Switch from "@reearth-cms/components/atoms/Switch";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import { useT } from "@reearth-cms/i18n";

export type PublicScope = "private" | "public"; // Add "limited" when functionality becomes available

export type Model = {
  id: string;
  name?: string;
  public: boolean;
};

export type ModelDataType = {
  name: string;
  public: JSX.Element;
};

export type Props = {
  projectScope?: PublicScope;
  alias?: string;
  models?: Model[];
  onPublicUpdate?: (alias?: string, scope?: PublicScope, modelsToUpdate?: Model[]) => void;
};

const Public: React.FC<Props> = ({ projectScope, models: rawModels, alias, onPublicUpdate }) => {
  const t = useT();
  const [scope, changeScope] = useState(projectScope);
  const [aliasState, setAlias] = useState(alias);
  const [updatedModels, setUpdatedModels] = useState<Model[]>([]);
  const [models, setModels] = useState<Model[] | undefined>(rawModels);

  useEffect(() => {
    changeScope(projectScope);
  }, [projectScope]);

  useEffect(() => {
    setModels(rawModels);
  }, [rawModels]);

  useEffect(() => {
    setAlias(alias);
  }, [alias]);

  const saveDisabled = useMemo(
    () => updatedModels.length === 0 && projectScope === scope && alias === aliasState,
    [updatedModels.length, projectScope, scope, alias, aliasState],
  );

  const handlerAliasChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAlias(e.currentTarget.value);
  }, []);

  const handlePublicUpdate = useCallback(() => {
    if (!scope && updatedModels.length === 0) return;
    onPublicUpdate?.(aliasState, scope, updatedModels);
    setUpdatedModels([]);
  }, [scope, aliasState, updatedModels, onPublicUpdate]);

  const handleUpdatedModels = useCallback(
    (model: Model) => {
      if (updatedModels.find(um => um.id === model.id)) {
        setUpdatedModels(ums => ums.filter(um => um.id !== model.id));
      } else {
        setUpdatedModels(ums => [...ums, model]);
      }
      setModels(ms => ms?.map(m => (m.id === model.id ? { ...m, public: model.public } : m)));
    },
    [updatedModels],
  );

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
          name: m.name ?? "",
          public: (
            <Switch
              checked={m.public}
              onChange={(publicState: boolean) =>
                handleUpdatedModels({ id: m.id, public: publicState })
              }
            />
          ),
        };
      }),
    [models, handleUpdatedModels],
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

  return (
    <InnerContent title={t("Public")} flexChildren>
      <>
        <div>
          <p>{t("Public Scope")}</p>
          <Select value={scope} onChange={changeScope} style={{ minWidth: "130px" }}>
            <Subtext>
              {t(
                "Choose the scope of your project. This affects all the models shown below that are switched on.",
              )}
            </Subtext>
            {publicScopeList.map(type => (
              <Select.Option key={type.id} value={type.value}>
                {type.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        <p>{t("Project Alias")}</p>
        <Input value={aliasState} onChange={handlerAliasChange} />
        <Subtext>
          {t(
            "Choose the scope of your project. This affects all the models shown below that are switched on.",
          )}
        </Subtext>
        <TableWrapper>
          <Table dataSource={dataSource} columns={columns} pagination={false} />
        </TableWrapper>
        <Button type="primary" disabled={saveDisabled} onClick={handlePublicUpdate}>
          {t("Save changes")}
        </Button>
      </>
    </InnerContent>
  );
};

export default Public;

const TableWrapper = styled.div`
  width: 304px;
  margin: 24px 0;
`;

const Subtext = styled.p`
  margin-top: 3px;
  color: rgba(0, 0, 0, 0.45);
  padding: 0;
`;
