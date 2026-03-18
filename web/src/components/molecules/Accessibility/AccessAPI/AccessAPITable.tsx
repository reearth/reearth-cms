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

  const columns = useMemo<TableColumnsType<ModelDataType>>(() => {
    const cols: TableColumnsType<ModelDataType> = [];
    if (!isPublic) {
      cols.push({
        key: "enable",
        title: t("Enable"),
        dataIndex: "id",
        align: "center",
        width: 90,
        render: (id: [string, string] | string) => (
          <StyledFormItem name={id}>
            <Switch
              disabled={!hasPublishRight || (Array.isArray(id) && publicModelsSet.has(id[1]))}
            />
          </StyledFormItem>
        ),
      });
    }
    cols.push(
      {
        key: "name",
        title: t("Model"),
        dataIndex: "name",
        width: 220,
      },
      {
        key: "endpoint",
        title: t("End point"),
        dataIndex: "endpoint",
        render: url => (
          <StyledAnchor target="_blank" href={url} rel="noreferrer">
            {url}
          </StyledAnchor>
        ),
      },
    );
    return cols;
  }, [hasPublishRight, isPublic, publicModelsSet, t]);

  const dataSource = useMemo<ModelDataType[]>(() => {
    const modelRows = models.map(model => ({
      key: model.key,
      name: model.name,
      id: ["models", model.id],
      endpoint: `${apiUrl}${model.key}`,
    }));
    const assetRow: ModelDataType = {
      key: "assets",
      name: t("Assets"),
      id: "assetPublic",
      endpoint: `${apiUrl}assets`,
    };
    return [...modelRows, assetRow];
  }, [models, apiUrl, t]);

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
