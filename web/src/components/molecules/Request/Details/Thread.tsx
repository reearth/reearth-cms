import styled from "@emotion/styled";

import Avatar from "@reearth-cms/components/atoms/Avatar";
import AntDComment from "@reearth-cms/components/atoms/Comment";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { RequestCommentList } from "@reearth-cms/components/molecules/Request/Details/CommentList";
import { RequestDescription } from "@reearth-cms/components/molecules/Request/Details/RequestDescription";
import { Request } from "@reearth-cms/components/molecules/Request/types";

import RequestEditor from "./Editor";
import RequestStatus from "./RequestStatus";

export type Props = {
  me?: User;
  currentRequest: Request;
  emptyText?: string;
  onCommentCreate: (content: string) => Promise<void>;
};

const RequestThread: React.FC<Props> = ({ me, currentRequest, emptyText, onCommentCreate }) => {
  return (
    <ContentWrapper>
      <ThreadWrapper>
        <CommentsContainer>
          <RequestDescription currentRequest={currentRequest} />
          {currentRequest.comments && currentRequest.comments?.length > 0 && (
            <RequestCommentList comments={currentRequest.comments} />
          )}
        </CommentsContainer>
        <StyledRequestStatus
          approvedAt={currentRequest.approvedAt}
          closedAt={currentRequest.closedAt}
        />
      </ThreadWrapper>

      {!currentRequest.comments || currentRequest.comments.length === 0 ? (
        <EmptyTextWrapper>{emptyText}</EmptyTextWrapper>
      ) : null}

      <ThreadDivider />

      <AntDComment
        avatar={
          <Avatar style={{ color: "#fff", backgroundColor: "#3F3D45" }}>
            {me?.name.charAt(0)}
          </Avatar>
        }
        content={<RequestEditor onCommentCreate={onCommentCreate} />}
      />
    </ContentWrapper>
  );
};

export default RequestThread;

const StyledRequestStatus = styled(RequestStatus)`
  display: inline-block;
`;

const ThreadWrapper = styled.div`
  padding: 0 12px;
  overflow: auto;
`;

const CommentsContainer = styled.div`
  overflow: auto;
`;

const EmptyTextWrapper = styled.div`
  padding: 12px;
  color: #00000073;
  text-align: center;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const ThreadDivider = styled.div`
  border-top: 1px solid #d9d9d9;
  width: calc(100% - 12px);
  padding: 0 12px;
`;
