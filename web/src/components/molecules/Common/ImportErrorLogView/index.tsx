import styled from "@emotion/styled";
import { useMemo } from "react";

import Alert from "@reearth-cms/components/atoms/Alert";
import Icon from "@reearth-cms/components/atoms/Icon";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import { useT } from "@reearth-cms/i18n";
import {
  ErrorLogEntry,
  ErrorLogMeta,
  ImportErrorLogUtils,
} from "@reearth-cms/utils/importErrorLog";
import { AntdColor, AntdToken, CustomToken } from "@reearth-cms/utils/style";

type Props = {
  errorLogMeta: ErrorLogMeta | null;
  source: "content" | "schema";
  "data-testid"?: string;
};

const ImportErrorLogView: React.FC<Props> = ({ errorLogMeta, source, ...rest }) => {
  const t = useT();

  const errorLogColumns = useMemo<TableColumnsType<ErrorLogEntry>>(
    () => [
      {
        title: t("Location"),
        dataIndex: "path",
        key: "path",
        render: (path: string[]) => ImportErrorLogUtils.formatPath(path, source),
      },
      { title: t("Detail"), dataIndex: "detail", key: "detail" },
    ],
    [t, source],
  );

  return (
    <ErrorLogWrapper data-testid={rest["data-testid"]}>
      <Alert
        type="error"
        message={<AlertMessage>{t("Validation errors")}</AlertMessage>}
        description={
          <AlertDescription>
            {t("You can preview errors here or download the error log")}
          </AlertDescription>
        }
        showIcon
        icon={
          <Icon icon="warningSolid" color={AntdColor.RED.RED_5} size={AntdToken.LINE_HEIGHT.BASE} />
        }
        action={
          errorLogMeta && (
            <ErrorCountBadge>
              {t("{{count}} errors", { count: errorLogMeta.totalErrors })}
            </ErrorCountBadge>
          )
        }
      />
      {errorLogMeta && errorLogMeta.entries.length > 0 && (
        <Table<ErrorLogEntry>
          dataSource={errorLogMeta.entries}
          columns={errorLogColumns}
          pagination={false}
          scroll={{ y: `calc(${CustomToken.MODAL.HEIGHT_LG} - 200px)` }}
          size="small"
          rowKey={(_, index) => index ?? 0}
        />
      )}
    </ErrorLogWrapper>
  );
};

export default ImportErrorLogView;

const ErrorLogWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${AntdToken.SPACING.MD}px;
`;

const ErrorCountBadge = styled.span`
  background: ${AntdColor.RED.RED_5};
  color: #fff;
  border-radius: ${AntdToken.SPACING.MD}px;
  padding: ${AntdToken.SPACING.XXS}px ${AntdToken.SPACING.SM}px;
  font-size: ${AntdToken.FONT.SIZE_SM}px;
  white-space: nowrap;
  font-weight: ${AntdToken.FONT_WEIGHT.BOLD};
`;

const AlertMessage = styled.span`
  font-weight: ${AntdToken.FONT_WEIGHT.MEDIUM};
`;

const AlertDescription = styled.span`
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
`;
