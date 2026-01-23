import styled from "@emotion/styled";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import Icon from "@reearth-cms/components/atoms/Icon";
import Progress from "@reearth-cms/components/atoms/Progress";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/utils/test";

import { UploaderQueueItem } from "../types";
import { JobStatus } from "@reearth-cms/gql/__generated__/graphql.generated";

type Props = {
  queue: UploaderQueueItem;
  onRetry: (id: UploaderQueueItem["jobId"]) => void;
  onCancel: (id: UploaderQueueItem["jobId"]) => void;
};

const QueueItem: React.FC<Props> = ({ queue, onRetry, onCancel }) => {
  const t = useT();

  const renderStatusIcons = useMemo<JSX.Element | null>(() => {
    switch (queue.jobStatus) {
      case JobStatus.InProgress:
        return (
          <Tooltip title={t("Cancel upload")}>
            <span>
              <ActionIcon
                icon="closeCircle"
                color="#8C8C8C"
                onClick={() => void onCancel(queue.jobId)}
              />
            </span>
          </Tooltip>
        );
      case JobStatus.Completed:
        return <InfoIcon icon="checkCircle" color="#52C41A" />;
      case JobStatus.Failed:
        return (
          <>
            <Tooltip title={t("Retry")}>
              <div>
                <ActionIcon
                  data-testId={DATA_TEST_ID.UploaderQueueItemRetryIcon}
                  icon="retry"
                  color="#8C8C8C"
                  onClick={() => void onRetry(queue.jobId)}
                />
              </div>
            </Tooltip>
            <InfoIcon icon="exclamationSolid" color="#F5222D" />
          </>
        );
      case JobStatus.Cancelled:
        return (
          <Tooltip title={t("Cancel upload")}>
            <span>
              <ActionIcon
                data-testId={DATA_TEST_ID.UploaderQueueItemRetryIcon}
                icon="retry"
                color="#8C8C8C"
                onClick={() => void onRetry(queue.jobId)}
              />
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
    <ItemWrapper data-testid={DATA_TEST_ID.QueueItemWrapper}>
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

  :first-child {
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

const ErrorMessage = styled(Tooltip)`
  color: #f5222d;
  font-size: 12px;
  padding-left: 22px;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;

const Message = styled.div`
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
