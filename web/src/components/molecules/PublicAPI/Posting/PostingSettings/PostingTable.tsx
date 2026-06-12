import styled from "@emotion/styled";
import { useMemo } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Switch from "@reearth-cms/components/atoms/Switch";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { useT } from "@reearth-cms/i18n";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import { ModelDataType } from "../../types";

type Props = {
  apiUrl: string;
  hasPublishRight: boolean;
  models: Pick<Model, "id" | "name" | "key">[];
  isPublic?: boolean;
  publicModels?: string[];
  disabled?: boolean;
};

const PostingTable: React.FC<Props> = ({
  apiUrl,
  models,
  isPublic,
  publicModels,
  hasPublishRight,
  disabled,
}) => {
  const t = useT();
  const publicModelsSet = useMemo(() => new Set(publicModels), [publicModels]);

  const columns: TableColumnsType<ModelDataType> = useMemo(() => {
    const cols: TableColumnsType<ModelDataType> = [];
    if (!isPublic) {
      cols.push({
        key: "enable",
        title: t("POST API Enable"),
        dataIndex: "id",
        align: "left",
        width: 150,
        render: (id: [string, string] | string) => (
          <StyledFormItem name={id}>
            <Switch
              disabled={
                disabled || !hasPublishRight || (Array.isArray(id) && publicModelsSet.has(id[1]))
              }
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
  }, [disabled, hasPublishRight, isPublic, publicModelsSet, t]);

  // TODO(public-api): asset posting UX pending team-lead confirmation; assets are
  // intentionally excluded from the Posting table for now.
  const dataSource = useMemo<ModelDataType[]>(
    () =>
      models.map(model => ({
        key: model.key,
        name: model.name,
        id: ["models", model.id],
        endpoint: `${apiUrl}${model.key}`,
      })),
    [models, apiUrl],
  );

  return (
    <TableWrapper isDisabled={disabled}>
      <Table dataSource={dataSource} columns={columns} pagination={false} />
    </TableWrapper>
  );
};

export default PostingTable;

const TableWrapper = styled.div<{ isDisabled?: boolean }>`
  margin: ${AntdToken.SPACING.LG}px 0;
  opacity: ${({ isDisabled }) => (isDisabled ? 0.6 : 1)};
  pointer-events: ${({ isDisabled }) => (isDisabled ? "none" : "auto")};
`;

const StyledAnchor = styled.a`
  text-decoration: underline;
  color: ${AntdColor.NEUTRAL.TEXT};
`;

const StyledFormItem = styled(Form.Item)`
  margin: 0;
`;
