import styled from "@emotion/styled";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import Icon from "@reearth-cms/components/atoms/Icon";
import Progress from "@reearth-cms/components/atoms/Progress";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { useT } from "@reearth-cms/i18n";

import { UploaderQueueItem, UploadStatus } from "../types";

type Props = {
  queue: UploaderQueueItem;
  onRetry: (id: UploaderQueueItem["id"]) => void;
  onCancel: (id: UploaderQueueItem["id"]) => void;
};

const QueueItem: React.FC<Props> = ({ queue, onRetry, onCancel }) => {
  const t = useT();

  const renderStatusIcons = useMemo<JSX.Element | null>(() => {
    switch (queue.status) {
      case UploadStatus.InProgress:
        return (
          <Tooltip title={t("Cancel upload")}>
            <span>
              <ActionIcon
                icon="closeCircle"
                color="#8C8C8C"
                onClick={() => void onCancel(queue.id)}
              />
            </span>
          </Tooltip>
        );
      case UploadStatus.Completed:
        return <InfoIcon icon="checkCircle" color="#52C41A" />;
      case UploadStatus.Failed:
        return (
          <>
            <Tooltip title={t("Retry")}>
              <div>
                <ActionIcon
                  data-testId="retryIcon"
                  icon="retry"
                  color="#8C8C8C"
                  onClick={() => void onRetry(queue.id)}
                />
              </div>
            </Tooltip>
            <InfoIcon icon="exclamationSolid" color="#F5222D" />
          </>
        );
      case UploadStatus.Canceled:
        return (
          <Tooltip title={t("Cancel upload")}>
            <span>
              <ActionIcon
                data-testId="retryIcon"
                icon="retry"
                color="#8C8C8C"
                onClick={() => void onRetry(queue.id)}
              />
            </span>
          </Tooltip>
        );
      default:
        return null;
    }
  }, [queue.status, onCancel, onRetry, queue.id, t]);

  const renderMessage = useMemo<JSX.Element | null>(() => {
    if (queue.status === UploadStatus.Failed && queue.error) {
      return <ErrorMessage title={queue.error}>{queue.error}</ErrorMessage>;
    } else if (queue.status === UploadStatus.Canceled) {
      return <Message>{t("Upload canceled")}</Message>;
    } else {
      return null;
    }
  }, [queue, t]);

  return (
    <ItemWrapper>
      <ItemUpper>
        <UpperLeft>
          <ActionIcon icon="clip" color="#8C8C8C" />
          {queue.status === UploadStatus.Completed ? (
            <Link to={queue.url} target="_blank">
              {queue.title}
            </Link>
          ) : (
            <div>{queue.title}</div>
          )}
        </UpperLeft>
        <UpperRight onPointerUp={event => event.stopPropagation()}>{renderStatusIcons}</UpperRight>
      </ItemUpper>
      <ItemLower>
        {queue.status === UploadStatus.InProgress && (
          <Progress
            percent={queue.progress}
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

export default QueueItem;
