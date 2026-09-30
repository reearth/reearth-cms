import styled from "@emotion/styled";
import { useMemo } from "react";

import type { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import Table from "@reearth-cms/components/atoms/Table";
import Tag from "@reearth-cms/components/atoms/Tag";
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
const TABLE_MAX_HEIGHT = 240;

type Props = {
  importResult: ImportJobResult | null | undefined;
};

const ImportResultContent: React.FC<Props> = ({ importResult }) => {
  const t = useT();

  const summary = useMemo<{ label: string; value: number }[]>(
    () =>
      importResult
        ? [
            { label: t("Total"), value: importResult.total },
            { label: t("Inserted"), value: importResult.inserted },
            { label: t("Updated"), value: importResult.updated },
            { label: t("Ignored"), value: importResult.ignored },
            { label: t("Matched columns"), value: ImportResultUtils.matchedCount(importResult) },
            { label: t("Skipped columns"), value: ImportResultUtils.skippedCount(importResult) },
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
      },
      {
        title: t("Schema field"),
        dataIndex: "schemaFieldKey",
        key: "schemaFieldKey",
        render: (schemaFieldKey: ImportColumnResult["schemaFieldKey"]) =>
          schemaFieldKey ?? EMPTY_VALUE,
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
      },
      {
        title: t("Reason"),
        dataIndex: "reason",
        key: "reason",
        render: (reason: ImportColumnResult["reason"]) => reason ?? EMPTY_VALUE,
      },
    ],
    [t],
  );

  if (!importResult) return null;

  return (
    <Wrapper>
      <Summary data-testid={DATA_TEST_ID.ImportResultContent__Summary}>
        {summary.map(({ label, value }) => (
          <SummaryItem key={label}>
            <SummaryLabel>{label}</SummaryLabel>
            <SummaryValue>{value}</SummaryValue>
          </SummaryItem>
        ))}
      </Summary>
      <div data-testid={DATA_TEST_ID.ImportResultContent__Table}>
        <Table
          columns={columns}
          dataSource={importResult.columns}
          rowKey="header"
          size="small"
          pagination={false}
          scroll={{ y: TABLE_MAX_HEIGHT }}
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
  grid-template-columns: repeat(3, 1fr);
  gap: ${AntdToken.SPACING.XS}px ${AntdToken.SPACING.MD}px;
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const SummaryLabel = styled.span`
  color: ${AntdColor.GREY.GREY_2};
  font-size: ${AntdToken.FONT.SIZE_SM}px;
`;

const SummaryValue = styled.span`
  font-size: ${AntdToken.FONT.SIZE}px;
`;

export default ImportResultContent;
