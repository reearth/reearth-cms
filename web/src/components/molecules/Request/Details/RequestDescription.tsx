import styled from "@emotion/styled";
import moment from "moment";
import { useMemo } from "react";

import Avatar from "@reearth-cms/components/atoms/Avatar";
import AntDComment from "@reearth-cms/components/atoms/Comment";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
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
          <h1>{currentRequest.title}</h1>
          <p>{currentRequest.description}</p>
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
  .ant-comment-inner {
    padding-top: 0;
  }
  .ant-comment-content {
    background-color: #fff;
    padding: 12px 24px;
  }
`;
