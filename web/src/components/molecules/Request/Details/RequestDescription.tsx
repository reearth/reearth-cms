import styled from "@emotion/styled";
import dayjs from "dayjs";
import { useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Collapse from "@reearth-cms/components/atoms/Collapse";
import AntDComment from "@reearth-cms/components/atoms/Comment";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { ItemInRequest, Request } from "@reearth-cms/components/molecules/Request/types";
import { Group } from "@reearth-cms/components/molecules/Schema/types";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import RequestItemForm from "./ItemForm";

const { Panel } = Collapse;

type Props = {
  currentRequest: Request;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
  onNavigateToItemEdit: (modelId: string, itemId: string) => void;
};

export const RequestDescription: React.FC<Props> = ({
  currentRequest,
  onGetAsset,
  onGroupGet,
  onNavigateToItemEdit,
}) => {
  const fromNow = useMemo(
    () => dayjs(currentRequest.createdAt?.toString()).fromNow(),
    [currentRequest.createdAt],
  );

  const headerGet = useCallback(
    ({ id: itemId, modelId, modelName, title }: ItemInRequest) => {
      if (modelName && modelId) {
        return (
          <>
            {`${modelName} / `}
            <StyledButton
              onClick={() => {
                onNavigateToItemEdit(modelId, itemId);
              }}
              type="link">
              {title || itemId}
            </StyledButton>
          </>
        );
      }
    },
    [onNavigateToItemEdit],
  );

  return (
    <StyledAntDComment
      author={currentRequest.createdBy?.name}
      content={
        <>
          <RequestTextWrapper>
            <RequestTitle>{currentRequest.title}</RequestTitle>
            <RequestText>{currentRequest.description}</RequestText>
          </RequestTextWrapper>
          <RequestItemsWrapper>
            {currentRequest.items
              .filter(item => item.schema)
              .map(item => (
                <Collapse key={item.id}>
                  <StyledPanel header={headerGet(item)} key={1}>
                    <RequestItemForm
                      initialFormValues={item.initialValues}
                      onGetAsset={onGetAsset}
                      onGroupGet={onGroupGet}
                      referencedItems={item.referencedItems}
                      schema={item.schema}
                    />
                  </StyledPanel>
                </Collapse>
              ))}
          </RequestItemsWrapper>
        </>
      }
      datetime={
        currentRequest.createdAt && (
          <Tooltip title={dateTimeFormat(currentRequest.createdAt)}>
            <span>{fromNow}</span>
          </Tooltip>
        )
      }
    />
  );
};

const StyledAntDComment = styled(AntDComment)`
  .ant-comment-content-author {
    padding: 16px 24px;
    margin: 0;
    border-bottom: 1px solid #f0f0f0;

    .ant-comment-content-author-name {
      font-weight: 500;
      font-size: 14px;
      color: #000000;
      overflow: hidden;
    }

    .ant-comment-content-author-time {
      display: flex;
      align-items: center;
    }
  }

  .ant-comment-inner {
    padding: 0;
  }

  .ant-comment-content {
    background-color: #fff;
  }
`;

const RequestTitle = styled.h1`
  border-bottom: 1px solid #f0f0f0;
  padding: 8px 0;
  color: #000000d9;
`;

const RequestTextWrapper = styled.div`
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
`;

const RequestText = styled.p`
  padding-top: 8px;
`;

const RequestItemsWrapper = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  .ant-pro-card-body {
    padding: 0;
  }
`;

const StyledPanel = styled(Panel)`
  > .ant-collapse-header {
    align-items: center !important;
    > .ant-collapse-header-text {
      overflow: hidden;
    }
  }
  > .ant-collapse-content {
    max-height: 640px;
    overflow: auto;
  }
`;

const StyledButton = styled(Button)`
  height: auto;
  padding: 0;
`;
