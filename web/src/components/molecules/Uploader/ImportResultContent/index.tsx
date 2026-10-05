import styled from "@emotion/styled";
import { useMemo } from "react";

import Flex from "@reearth-cms/components/atoms/Flex";
import Icon from "@reearth-cms/components/atoms/Icon";
import type { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import Table from "@reearth-cms/components/atoms/Table";
import Tag from "@reearth-cms/components/atoms/Tag";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import Typography from "@reearth-cms/components/atoms/Typography";
import type { ImportColumnResult } from "@reearth-cms/gql/__generated__/graphql.generated";
import { ImportColumnStatus } from "@reearth-cms/gql/__generated__/graphql.generated";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import Stat from "../Stat";
import SummaryCard from "../SummaryCard";
import type { ImportResult } from "../types";
import { ImportResultUtils } from "../utils";

const EMPTY_VALUE = "—";

type SummaryEntry = {
  label: string;
  value: number;
};

type ColumnStats = {
  matchedCount: number;
  skippedCount: number;
};

type Props = {
  importResult: ImportResult | null | undefined;
};

const ImportResultContent: React.FC<Props> = ({ importResult }) => {
  const t = useT();

  const rowStats = useMemo<SummaryEntry[]>(
    () => (importResult ? [{ label: t("Inserted"), value: importResult.inserted }] : []),
    [importResult, t],
  );

  const { matchedCount, skippedCount } = useMemo<ColumnStats>(
    () =>
      importResult
        ? {
            matchedCount: ImportResultUtils.matchedCount(importResult),
            skippedCount: ImportResultUtils.skippedCount(importResult),
          }
        : { matchedCount: 0, skippedCount: 0 },
    [importResult],
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
      <Flex data-testid={DATA_TEST_ID.ImportResultContent__Summary} gap={AntdToken.SPACING.XS}>
        <SummaryCard title={t("Columns")}>
          <Flex gap={AntdToken.SPACING.MD}>
            <Stat value={matchedCount} label={t("Matched")} type="success" />
            <Stat
              value={skippedCount}
              type="warning"
              label={
                <>
                  {t("Skipped")}
                  <Tooltip
                    title={t(
                      "Columns whose header doesn't match any field key in the schema. Their data wasn't imported.",
                    )}>
                    <span>
                      <Icon icon="exclamationCircle" />
                    </span>
                  </Tooltip>
                </>
              }
            />
          </Flex>
          <ColumnBar>
            <ColumnBarSegment
              style={{ flexGrow: matchedCount, background: AntdColor.GREEN.GREEN_5 }}
            />
            <ColumnBarSegment
              style={{ flexGrow: skippedCount, background: AntdColor.GOLD.GOLD_5 }}
            />
          </ColumnBar>
        </SummaryCard>
        <SummaryCard title={t("Rows")}>
          <Flex gap={AntdToken.SPACING.MD}>
            {rowStats.map(({ label, value }) => (
              <Stat
                key={label}
                value={value}
                label={label}
                type={value === 0 ? "secondary" : undefined}
              />
            ))}
          </Flex>
        </SummaryCard>
      </Flex>
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

// rounds only the outer ends; the boundary between segments stays a flat cut
const ColumnBar = styled.div`
  display: flex;
  height: 8px;
  margin-top: ${AntdToken.SPACING.XS}px;
  border-radius: 4px;
  overflow: hidden;
  background: ${AntdColor.NEUTRAL.BG_LAYOUT};
`;

const ColumnBarSegment = styled.div`
  flex-basis: 0;
`;

export default ImportResultContent;
