import styled from "@emotion/styled";
import { useMemo } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Switch from "@reearth-cms/components/atoms/Switch";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { useT } from "@reearth-cms/i18n";

import { ModelDataType } from "../types";

type Props = {
  apiUrl: string;
  hasPublishRight: boolean;
  models: Pick<Model, "id" | "name" | "key">[];
  isPublic?: boolean;
  publicModels?: string[];
};

const AccessAPITable: React.FC<Props> = ({
  apiUrl,
  models,
  isPublic,
  publicModels,
  hasPublishRight,
}) => {
  const t = useT();
  const publicModelsSet = useMemo(() => new Set(publicModels), [publicModels]);

  const columns: TableColumnsType<ModelDataType> = useMemo(() => {
    const res: TableColumnsType<ModelDataType> = [];
    if (!isPublic) {
      res.push({
        key: "id",
        title: t("Enable"),
        dataIndex: "id",
        align: "center",
        width: 90,
        render: id => (
          <StyledFormItem name={id}>
            <Switch disabled={!hasPublishRight || publicModelsSet.has(id[1])} />
          </StyledFormItem>
        ),
      });
    }
    res.push(
      {
        key: "name",
        title: t("Model"),
        dataIndex: "name",
        width: 220,
      },
      {
        title: t("End point"),
        dataIndex: "endpoint",
        key: "endpoint",
        render: url => (
          <StyledAnchor target="_blank" href={url} rel="noreferrer">
            {url}
          </StyledAnchor>
        ),
      },
    );
    return res;
  }, [hasPublishRight, isPublic, publicModelsSet, t]);

  const dataSource = useMemo(() => {
    const columns: ModelDataType[] = [];
    models.forEach(m => {
      columns.push({
        key: m.key,
        name: m.name,
        id: ["models", m.id],
        endpoint: apiUrl + m.key,
      });
    });
    columns.push({
      key: "assets",
      name: t("Assets"),
      id: "assetPublic",
      endpoint: apiUrl + "assets",
    });
    return columns;
  }, [models, t, apiUrl]);

  return (
    <TableWrapper>
      <Table dataSource={dataSource} columns={columns} pagination={false} />
    </TableWrapper>
  );
};

export default AccessAPITable;

const TableWrapper = styled.div`
  margin: 24px 0;
`;

const StyledAnchor = styled.a`
  text-decoration: underline;
  color: #000000d9;
`;

const StyledFormItem = styled(Form.Item)`
  margin: 0;
`;
