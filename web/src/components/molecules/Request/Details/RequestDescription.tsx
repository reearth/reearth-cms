import styled from "@emotion/styled";
import dayjs from "dayjs";
import { useMemo, useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Collapse from "@reearth-cms/components/atoms/Collapse";
import AntDComment from "@reearth-cms/components/atoms/Comment";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { Request, ItemInRequest } from "@reearth-cms/components/molecules/Request/types";
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
    ({ modelName, modelId, id: itemId, title }: ItemInRequest) => {
      if (modelName && modelId) {
        return (
          <>
            {`${modelName} / `}
            <StyledButton
              type="link"
              onClick={() => {
                onNavigateToItemEdit(modelId, itemId);
              }}>
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
      avatar={<UserAvatar username={currentRequest.createdBy?.name} />}
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
                      schema={item.schema}
                      initialFormValues={item.initialValues}
                      referencedItems={item.referencedItems}
                      onGetAsset={onGetAsset}
                      onGroupGet={onGroupGet}
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
      font-weight: 400;
      font-size: 14px;
      color: #00000073;
      overflow: hidden;
    }
  }
  .ant-comment-inner {
    padding: 0;
  }
  .ant-comment-avatar {
    background-color: #f5f5f5;
    margin-right: 0;
    padding-right: 12px;
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
