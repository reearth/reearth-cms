import styled from "@emotion/styled";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import Icon from "@reearth-cms/components/atoms/Icon";
import Progress from "@reearth-cms/components/atoms/Progress";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { JobStatus } from "@reearth-cms/gql/__generated__/graphql.generated";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import { UploaderQueueItem } from "../types";
import useJobState from "../useJobState";

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

  const renderStatusIcons = useMemo<JSX.Element | null>(() => {
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
        return (
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
  }, [onCancel, onRetry, queue.jobId, queue.jobState.status, t]);

  const renderMessage = useMemo<JSX.Element | null>(() => {
    if (queue.jobState.status === JobStatus.Failed && queue.jobState.error) {
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
  }, [queue.jobState.error, queue.jobState.status, t]);

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
