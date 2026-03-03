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
  isPublic?: boolean;
  models: Pick<Model, "id" | "key" | "name">[];
  publicModels?: string[];
};

const AccessAPITable: React.FC<Props> = ({
  apiUrl,
  hasPublishRight,
  isPublic,
  models,
  publicModels,
}) => {
  const t = useT();
  const publicModelsSet = useMemo(() => new Set(publicModels), [publicModels]);

  const columns: TableColumnsType<ModelDataType> = useMemo(() => {
    const cols: TableColumnsType<ModelDataType> = [];
    if (!isPublic) {
      cols.push({
        align: "center",
        dataIndex: "id",
        key: "enable",
        render: (id: [string, string] | string) => (
          <StyledFormItem name={id}>
            <Switch
              disabled={!hasPublishRight || (Array.isArray(id) && publicModelsSet.has(id[1]))}
            />
          </StyledFormItem>
        ),
        title: t("Enable"),
        width: 90,
      });
    }
    cols.push(
      {
        dataIndex: "name",
        key: "name",
        title: t("Model"),
        width: 220,
      },
      {
        dataIndex: "endpoint",
        key: "endpoint",
        render: url => (
          <StyledAnchor href={url} rel="noreferrer" target="_blank">
            {url}
          </StyledAnchor>
        ),
        title: t("End point"),
      },
    );
    return cols;
  }, [hasPublishRight, isPublic, publicModelsSet, t]);

  const dataSource = useMemo<ModelDataType[]>(() => {
    const modelRows = models.map(model => ({
      endpoint: `${apiUrl}${model.key}`,
      id: ["models", model.id],
      key: model.key,
      name: model.name,
    }));
    const assetRow: ModelDataType = {
      endpoint: `${apiUrl}assets`,
      id: "assetPublic",
      key: "assets",
      name: t("Assets"),
    };
    return [...modelRows, assetRow];
  }, [models, apiUrl, t]);

  return (
    <TableWrapper>
      <Table columns={columns} dataSource={dataSource} pagination={false} />
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
