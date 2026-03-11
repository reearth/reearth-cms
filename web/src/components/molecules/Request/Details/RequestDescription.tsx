import styled from "@emotion/styled";
import dayjs from "dayjs";
import { useMemo, useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Collapse from "@reearth-cms/components/atoms/Collapse";
import AntDComment from "@reearth-cms/components/atoms/Comment";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { Request, ItemInRequest } from "@reearth-cms/components/molecules/Request/types";
import { Group } from "@reearth-cms/components/molecules/Schema/types";
import { dateTimeFormat } from "@reearth-cms/utils/format";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

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
    padding: ${AntdToken.SPACING.BASE}px ${AntdToken.SPACING.LG}px;
    margin: 0;
    border-bottom: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};

    .ant-comment-content-author-name {
      font-weight: 500;
      font-size: ${AntdToken.FONT.SIZE}px;
      color: ${AntdColor.GREY.GREY_8};
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
    background-color: ${AntdColor.NEUTRAL.BG_WHITE};
  }
`;

const RequestTitle = styled.h1`
  border-bottom: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
  padding: ${AntdToken.SPACING.XS}px 0;
  color: ${AntdColor.NEUTRAL.TEXT};
`;

const RequestTextWrapper = styled.div`
  padding: ${AntdToken.SPACING.LG}px;
  border-bottom: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
`;

const RequestText = styled.p`
  padding-top: ${AntdToken.SPACING.XS}px;
`;

const RequestItemsWrapper = styled.div`
  padding: ${AntdToken.SPACING.SM}px;
  display: flex;
  flex-direction: column;
  gap: ${AntdToken.SPACING.SM}px;
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
