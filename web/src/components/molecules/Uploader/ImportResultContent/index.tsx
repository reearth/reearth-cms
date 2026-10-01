import styled from "@emotion/styled";
import { Fragment, useMemo } from "react";

import Space from "@reearth-cms/components/atoms/Space";
import type { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import Table from "@reearth-cms/components/atoms/Table";
import Tag from "@reearth-cms/components/atoms/Tag";
import Typography from "@reearth-cms/components/atoms/Typography";
import type {
  ImportColumnResult,
  ImportJobResult,
} from "@reearth-cms/gql/__generated__/graphql.generated";
import { ImportColumnStatus } from "@reearth-cms/gql/__generated__/graphql.generated";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import { ImportResultUtils } from "../utils";

const EMPTY_VALUE = "—";

type SummaryEntry = {
  label: string;
  value: number;
};

type SummaryGroup = {
  label: string;
  entries: SummaryEntry[];
};

type Props = {
  importResult: ImportJobResult | null | undefined;
};

const ImportResultContent: React.FC<Props> = ({ importResult }) => {
  const t = useT();

  const summary = useMemo<SummaryGroup[]>(
    () =>
      importResult
        ? [
            {
              label: t("Rows"),
              entries: [
                { label: t("Total"), value: importResult.total },
                { label: t("Inserted"), value: importResult.inserted },
                { label: t("Updated"), value: importResult.updated },
                { label: t("Ignored"), value: importResult.ignored },
              ],
            },
            {
              label: t("Columns"),
              entries: [
                { label: t("Matched"), value: ImportResultUtils.matchedCount(importResult) },
                { label: t("Skipped"), value: ImportResultUtils.skippedCount(importResult) },
              ],
            },
          ]
        : [],
    [importResult, t],
  );

  const columns = useMemo<TableColumnsType<ImportColumnResult>>(
    () => [
      {
        title: t("CSV column"),
        dataIndex: "header",
        key: "header",
        width: 100,
      },
      {
        title: t("Schema field"),
        dataIndex: "schemaFieldKey",
        key: "schemaFieldKey",
        render: (schemaFieldKey: ImportColumnResult["schemaFieldKey"]) =>
          schemaFieldKey ?? EMPTY_VALUE,
        width: 135,
      },
      {
        title: t("Status"),
        dataIndex: "status",
        key: "status",
        render: (status: ImportColumnResult["status"]) =>
          status === ImportColumnStatus.Matched ? (
            <Tag color="success">{t("Matched")}</Tag>
          ) : (
            <Tag color="warning">{t("Skipped")}</Tag>
          ),
        width: 100,
      },
      {
        title: t("Reason"),
        dataIndex: "reason",
        key: "reason",
        render: (reason: ImportColumnResult["reason"]) => (
          <Typography.Text>{reason ?? EMPTY_VALUE}</Typography.Text>
        ),
      },
    ],
    [t],
  );

  if (!importResult) return null;

  return (
    <Wrapper>
      <Summary data-testid={DATA_TEST_ID.ImportResultContent__Summary}>
        {summary.map(group => (
          <Fragment key={group.label}>
            <SummaryGroupLabel>{group.label}</SummaryGroupLabel>
            <Space size="small" split="·" wrap>
              {group.entries.map(({ label, value }) => (
                <span key={label}>
                  <SummaryLabel>{label}</SummaryLabel>
                  <span>&nbsp;</span>
                  <SummaryValue>{value}</SummaryValue>
                </span>
              ))}
            </Space>
          </Fragment>
        ))}
      </Summary>
      <div data-testid={DATA_TEST_ID.ImportResultContent__Table}>
        <Table
          columns={columns}
          dataSource={importResult.columns}
          rowKey={(_, index) => index ?? 0}
          size="small"
          pagination={false}
          sticky
        />
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${AntdToken.SPACING.MD}px;
`;

const Summary = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: baseline;
  gap: ${AntdToken.SPACING.XS}px ${AntdToken.SPACING.MD}px;
`;

const SummaryGroupLabel = styled.span`
  font-weight: 500;
`;

const SummaryLabel = styled.span`
  color: ${AntdColor.GREY.GREY_2};
  font-size: ${AntdToken.FONT.SIZE_SM}px;
`;

const SummaryValue = styled.span`
  font-size: ${AntdToken.FONT.SIZE}px;
`;
export default ImportResultContent;
