import styled from "@emotion/styled";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import Icon from "@reearth-cms/components/atoms/Icon";
import Progress from "@reearth-cms/components/atoms/Progress";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { JobStatus } from "@reearth-cms/gql/__generated__/graphql.generated";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/utils/test";

import { UploaderQueueItem } from "../types";
import useJobProgress from "../useJobProgress";

type Props = {
  queue: UploaderQueueItem;
  onRetry: (id: UploaderQueueItem["jobId"]) => void;
  onCancel: (id: UploaderQueueItem["jobId"]) => void;
  onJobProgressUpdate: (payload: Pick<UploaderQueueItem, "jobId" | "jobProgress">) => void;
};

const QueueItem: React.FC<Props> = ({ queue, onRetry, onCancel, onJobProgressUpdate }) => {
  const t = useT();

  useJobProgress({
    jobId: queue.jobId,
    updateJobProgressCallback: ({ data }) => {
      if (data.data)
        onJobProgressUpdate({ jobId: queue.jobId, jobProgress: data.data.jobProgress });
    },
    shouldSubscribe: ![JobStatus.Completed, JobStatus.Cancelled, JobStatus.Failed].includes(
      queue.jobStatus,
    ),
  });

  const renderStatusIcons = useMemo<JSX.Element | null>(() => {
    switch (queue.jobStatus) {
      case JobStatus.InProgress:
        return (
          <Tooltip title={t("Cancel upload")}>
            <span
              data-testid={DATA_TEST_ID.QueueItem__CancelIcon}
              onClick={() => void onCancel(queue.jobId)}>
              <ActionIcon icon="closeCircle" color="#8C8C8C" />
            </span>
          </Tooltip>
        );
      case JobStatus.Completed:
        return (
          <span data-testid={DATA_TEST_ID.Uploader__CompleteIcon}>
            <InfoIcon icon="checkCircle" color="#52C41A" />
          </span>
        );
      case JobStatus.Failed:
        return (
          <>
            <Tooltip title={t("Retry")}>
              <span
                data-testid={DATA_TEST_ID.QueueItem__RetryIcon}
                onClick={() => void onRetry(queue.jobId)}>
                <ActionIcon icon="retry" color="#8C8C8C" />
              </span>
            </Tooltip>
            <span data-testid={DATA_TEST_ID.QueueItem__ErrorIcon}>
              <InfoIcon icon="exclamationSolid" color="#F5222D" />
            </span>
          </>
        );
      case JobStatus.Cancelled:
        return (
          <Tooltip title={t("Cancel upload")}>
            <span
              data-testid={DATA_TEST_ID.QueueItem__RetryIcon}
              onClick={() => void onRetry(queue.jobId)}>
              <ActionIcon icon="retry" color="#8C8C8C" />
            </span>
          </Tooltip>
        );
      default:
        return null;
    }
  }, [onCancel, onRetry, queue.jobId, queue.jobStatus, t]);

  const renderMessage = useMemo<JSX.Element | null>(() => {
    // FIXME: fix it later about error
    // if (queue.jobStatus === JobStatus.Failed && queue.error) {
    //   return <ErrorMessage title={queue.error}>{queue.error}</ErrorMessage>;
    // } else if (queue.status === UploadStatus.Canceled) {
    //   return <Message>{t("Upload canceled")}</Message>;
    // } else {
    //   return null;
    // }

    return null;
  }, []);

  return (
    <ItemWrapper data-testid={DATA_TEST_ID.QueueItem__Wrapper}>
      <ItemUpper>
        <UpperLeft>
          <InfoIcon icon="clip" color="#8C8C8C" />
          <Tooltip title={queue.fileName}>
            {queue.jobStatus === JobStatus.Completed ? (
              <Link to={queue.url} target="_blank">
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
        {queue.jobStatus === JobStatus.InProgress && (
          <Progress
            data-testid={DATA_TEST_ID.QueueItem__ProgressBar}
            percent={queue.jobProgress ? queue.jobProgress.percentage : 0}
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
  padding: 8px 0;

  :first-of-type {
    padding: 0 0 8px 0;
  }

  :last-child {
    padding: 8px 0 0 0;
  }

  :not(:last-child) {
    border-bottom: 1px solid rgba(5, 5, 5, 0.06);
  }
`;

const ItemUpper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  line-height: 22px;
`;

const ItemLower = styled.div``;

const UpperLeft = styled.div`
  display: flex;
  gap: 8px;
  font-size: 14px;
`;

const UpperRight = styled.div`
  display: flex;
  gap: 8px;
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

const _ErrorMessage = styled(Tooltip)`
  color: #f5222d;
  font-size: 12px;
  padding-left: 22px;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;

const _Message = styled.div`
  color: #8c8c8c;
  font-size: 12px;
  padding-left: 22px;
  line-height: 22px;
`;

const FileName = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 225px;
`;

export default QueueItem;
