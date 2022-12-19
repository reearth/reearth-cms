import styled from "@emotion/styled";
import moment from "moment";
import { useMemo } from "react";

import Avatar from "@reearth-cms/components/atoms/Avatar";
import AntDComment from "@reearth-cms/components/atoms/Comment";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { Request } from "@reearth-cms/components/molecules/Request/types";

type Props = {
  currentRequest: Request;
};

export const RequestDescription: React.FC<Props> = ({ currentRequest }) => {
  const fromNow = useMemo(
    () => moment(currentRequest.createdAt?.toString()).fromNow(),
    [currentRequest.createdAt],
  );
  return (
    <StyledAntDComment
      author={<a>{currentRequest.createdBy?.name}</a>}
      avatar={
        <Avatar style={{ color: "#fff", backgroundColor: "#3F3D45" }}>
          {currentRequest.createdBy?.name.charAt(0)}
        </Avatar>
      }
      content={
        <>
          <RequestTextWrapper>
            <RequestTitle>{currentRequest.title}</RequestTitle>
            <RequestText>{currentRequest.description}</RequestText>
          </RequestTextWrapper>
          <RequestItemsWrapper>
            {currentRequest.items
              .filter(item => item.columns && item.fields)
              .map((item, index) => (
                <RequestItemWrapper key={index}>
                  <RequestModelName>{item.modelName}</RequestModelName>
                  <RequestTableWrapper>
                    <ResizableProTable
                      pagination={false}
                      options={false}
                      dataSource={[item.fields]}
                      columns={item.columns}
                    />
                  </RequestTableWrapper>
                </RequestItemWrapper>
              ))}
          </RequestItemsWrapper>
        </>
      }
      datetime={
        currentRequest.createdAt && (
          <Tooltip title={currentRequest.createdAt.toString()}>
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

const RequestItemWrapper = styled.div`
  + div {
    margin-top: 24px;
  }
`;

const RequestModelName = styled.h1`
  display: inline-block;
  padding: 8px 16px;
  border: 1px solid #f0f0f0;
  border-bottom: none;
  border-radius: 2px 2px 0px 0px;
  margin-bottom: 0;
`;

const RequestTableWrapper = styled.div`
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 2px 2px 0px 0px;
`;
