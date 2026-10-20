import styled from "@emotion/styled";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Popover from "@reearth-cms/components/atoms/Popover";
import Progress from "@reearth-cms/components/atoms/Progress";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import Typography from "@reearth-cms/components/atoms/Typography";
import { JobStatus } from "@reearth-cms/gql/__generated__/graphql.generated";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import ImportResultContent from "../ImportResultContent";
import type { UploaderQueueItem } from "../types";
import useJobState from "../useJobState";
import { ImportResultUtils } from "../utils";

type Props = {
  queue: UploaderQueueItem;
  onRetry: (id: UploaderQueueItem["jobId"]) => Promise<void>;
  onCancel: (id: UploaderQueueItem["jobId"]) => Promise<void>;
  onJobUpdate: (payload: Pick<UploaderQueueItem, "jobId" | "jobState">) => void;
  onJobComplete?: (jobId: UploaderQueueItem["jobId"]) => void;
  onJobError?: (jobId: UploaderQueueItem["jobId"], error: string) => void;
};

const QueueItem: React.FC<Props> = (props: Props) => {
  const { queue, onRetry, onCancel, onJobUpdate, onJobComplete, onJobError } = props;
  const t = useT();

  const hasColumnReport = useMemo<boolean>(() => ImportResultUtils.hasColumnReport(queue), [queue]);
  const skippedCount = useMemo<number>(
    () => (hasColumnReport ? ImportResultUtils.skippedCount(queue.importResult) : 0),
    [hasColumnReport, queue.importResult],
  );

  useJobState({
    jobId: queue.jobId,
    shouldSubscribe: ![JobStatus.Completed, JobStatus.Cancelled, JobStatus.Failed].includes(
      queue.jobState.status,
    ),
    onJobUpdateCallback: ({ data }) => {
      if (data.data) onJobUpdate({ jobId: queue.jobId, jobState: data.data.jobState });
    },
    onJobCompleteCallback: () => onJobComplete && void onJobComplete(queue.jobId),
    onJobErrorCallback: error => onJobError && void onJobError(queue.jobId, error.message),
  });

  const renderStatusIcons = useMemo<ReactNode>(() => {
    switch (queue.jobState.status) {
      case JobStatus.InProgress:
        return (
          <Tooltip title={t("Cancel upload")}>
            <span
              data-testid={DATA_TEST_ID.QueueItem__CancelIcon}
              onClick={() => void onCancel(queue.jobId)}>
              <ActionIcon icon="closeCircle" color={AntdColor.GREY.GREY_2} />
            </span>
          </Tooltip>
        );
      case JobStatus.Completed:
        return skippedCount > 0 ? (
          <span data-testid={DATA_TEST_ID.QueueItem__WarningIcon}>
            <InfoIcon icon="exclamationSolid" color={AntdColor.GOLD.GOLD_5} />
          </span>
        ) : (
          <span data-testid={DATA_TEST_ID.Uploader__CompleteIcon}>
            <InfoIcon icon="checkCircle" color={AntdColor.GREEN.GREEN_5} />
          </span>
        );
      case JobStatus.Failed:
        return (
          <>
            <Tooltip title={t("Retry")}>
              <span
                data-testid={DATA_TEST_ID.QueueItem__RetryIcon}
                onClick={() => void onRetry(queue.jobId)}>
                <ActionIcon icon="retry" color={AntdColor.GREY.GREY_2} />
              </span>
            </Tooltip>
            <span data-testid={DATA_TEST_ID.QueueItem__ErrorIcon}>
              <InfoIcon icon="exclamationSolid" color={AntdColor.RED.RED_5} />
            </span>
          </>
        );
      case JobStatus.Cancelled:
        return (
          <Tooltip title={t("Cancel upload")}>
            <span
              data-testid={DATA_TEST_ID.QueueItem__RetryIcon}
              onClick={() => void onRetry(queue.jobId)}>
              <ActionIcon icon="retry" color={AntdColor.GREY.GREY_2} />
            </span>
          </Tooltip>
        );
      default:
        return null;
    }
  }, [onCancel, onRetry, queue.jobId, queue.jobState.status, skippedCount, t]);

  const renderMessage = useMemo<ReactNode>(() => {
    if (queue.jobState.status === JobStatus.Completed && skippedCount > 0) {
      return (
        <CompletedMessage>
          <WarningText data-testid={DATA_TEST_ID.QueueItem__WarningMessage}>
            {t("Import completed with {{count}} skipped columns", { count: skippedCount })}
          </WarningText>
          <Popover
            rootClassName="importResultPopover"
            trigger="click"
            placement="left"
            title={
              <PopoverTitle>
                <PopoverFileName>{queue.fileName}</PopoverFileName>
                <ImportedCount type="secondary" data-testid={DATA_TEST_ID.QueueItem__ImportedCount}>
                  {t("{{count}} rows imported", { count: queue.importResult?.inserted ?? 0 })}
                </ImportedCount>
              </PopoverTitle>
            }
            content={<ImportResultContent importResult={queue.importResult} />}>
            <DetailsButton type="link" data-testid={DATA_TEST_ID.QueueItem__ViewDetailsLink}>
              {t("View details")}
            </DetailsButton>
          </Popover>
        </CompletedMessage>
      );
    } else if (queue.jobState.status === JobStatus.Failed && queue.jobState.error) {
      return (
        <ErrorMessage title={queue.jobState.error}>
          <span data-testid={DATA_TEST_ID.QueueItem__ErrorMessage}>{queue.jobState.error}</span>
        </ErrorMessage>
      );
    } else if (queue.jobState.status === JobStatus.Cancelled) {
      return <Message>{t("Upload canceled")}</Message>;
    } else {
      return null;
    }
  }, [
    queue.fileName,
    queue.importResult,
    queue.jobState.error,
    queue.jobState.status,
    skippedCount,
    t,
  ]);

  return (
    <ItemWrapper data-testid={DATA_TEST_ID.QueueItem__Wrapper}>
      <ItemUpper>
        <UpperLeft>
          <InfoIcon icon="clip" color={AntdColor.GREY.GREY_2} />
          <Tooltip title={queue.fileName}>
            {queue.jobState.status === JobStatus.Completed ? (
              <Link to={queue.url} target="_blank" data-testid={DATA_TEST_ID.QueueItem__FileLink}>
                <FileName>{queue.fileName}</FileName>
              </Link>
            ) : (
              <FileName>{queue.fileName}</FileName>
            )}
          </Tooltip>
        </UpperLeft>
        <UpperRight onPointerUp={event => event.stopPropagation()}>{renderStatusIcons}</UpperRight>
      </ItemUpper>
      <ItemLower>
        {queue.jobState.status === JobStatus.InProgress && (
          <Progress
            data-testid={DATA_TEST_ID.QueueItem__ProgressBar}
            percent={queue.jobState.progress ? queue.jobState.progress.percentage : 0}
            showInfo={false}
            status="active"
            size={{ height: 3 }}
          />
        )}
        {renderMessage}
      </ItemLower>
    </ItemWrapper>
  );
};

const ItemWrapper = styled.div`
  padding: ${AntdToken.SPACING.XS}px 0;

  :first-of-type {
    padding: 0 0 ${AntdToken.SPACING.XS}px 0;
  }

  :last-child {
    padding: ${AntdToken.SPACING.XS}px 0 0 0;
  }

  :not(:last-child) {
    border-bottom: 1px solid ${AntdColor.NEUTRAL.BORDER_SPLIT};
  }
`;

const ItemUpper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  line-height: ${AntdToken.LINE_HEIGHT.BASE}px;
`;

const ItemLower = styled.div``;

const UpperLeft = styled.div`
  display: flex;
  gap: ${AntdToken.SPACING.XS}px;
  font-size: ${AntdToken.FONT.SIZE}px;
`;

const UpperRight = styled.div`
  display: flex;
  gap: ${AntdToken.SPACING.XS}px;
  align-items: center;
`;

const ActionIcon = styled(Icon)`
  cursor: pointer;
  transition-property: filter;
  transition-duration: 0.5s;
  display: flex;

  :hover {
    filter: brightness(1.1);
  }
`;

const InfoIcon = styled(Icon)`
  transition-property: filter;
  transition-duration: 0.5s;

  :hover {
    filter: brightness(1.1);
  }
`;

const ErrorMessage = styled(Tooltip)`
  color: ${AntdColor.RED.RED_5};
  font-size: ${AntdToken.FONT.SIZE_SM}px;
  padding-left: 22px;
  line-height: ${AntdToken.LINE_HEIGHT.SM}px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;

const CompletedMessage = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 22px;
  font-size: ${AntdToken.FONT.SIZE_SM}px;
  line-height: ${AntdToken.LINE_HEIGHT.SM}px;
`;

const WarningText = styled.span`
  color: ${AntdColor.GOLD.GOLD_6};
`;

const DetailsButton = styled(Button)`
  align-self: flex-start;
  padding: 0;
  height: fit-content;
`;

const PopoverTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${AntdToken.SPACING.MD}px;
`;

const PopoverFileName = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ImportedCount = styled(Typography.Text)`
  flex-shrink: 0;
  font-weight: ${AntdToken.FONT_WEIGHT.NORMAL};
`;

const Message = styled.div`
  color: ${AntdColor.GREY.GREY_2};
  font-size: ${AntdToken.FONT.SIZE_SM}px;
  padding-left: 22px;
  line-height: ${AntdToken.LINE_HEIGHT.BASE}px;
`;

const FileName = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 225px;
`;

export default QueueItem;
