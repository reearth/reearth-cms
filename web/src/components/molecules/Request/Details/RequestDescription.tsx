import styled from "@emotion/styled";
import dayjs from "dayjs";
import { useMemo } from "react";

import Collapse from "@reearth-cms/components/atoms/Collapse";
import AntDComment from "@reearth-cms/components/atoms/Comment";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { Group } from "@reearth-cms/components/molecules/Schema/types";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import RequestItemForm from "./ItemForm";

const { Panel } = Collapse;

type Props = {
  currentRequest: Request;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
};

export const RequestDescription: React.FC<Props> = ({ currentRequest, onGetAsset, onGroupGet }) => {
  const fromNow = useMemo(
    () => dayjs(currentRequest.createdAt?.toString()).fromNow(),
    [currentRequest.createdAt],
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
            <Collapse>
              {currentRequest.items
                .filter(item => item.schema)
                .map((item, index) => (
                  <Panel header={item.modelName} key={index}>
                    <RequestItemForm
                      key={index}
                      schema={item.schema}
                      initialFormValues={item.initialValues}
                      referencedItems={item.referencedItems}
                      onGetAsset={onGetAsset}
                      onGroupGet={onGroupGet}
                    />
                  </Panel>
                ))}
            </Collapse>
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
    padding-top: 0;
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
  .ant-pro-card-body {
    padding: 0;
  }
`;
