import styled from "@emotion/styled";

import AntDComment from "@reearth-cms/components/atoms/Comment";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { RequestCommentList } from "@reearth-cms/components/molecules/Request/Details/CommentList";
import { RequestDescription } from "@reearth-cms/components/molecules/Request/Details/RequestDescription";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { Group } from "@reearth-cms/components/molecules/Schema/types";

import RequestEditor from "./Editor";
import RequestStatus from "./RequestStatus";

export interface Props {
  me?: User;
  currentRequest: Request;
  emptyText?: string;
  onCommentCreate: (content: string) => Promise<void>;
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
}

const RequestThread: React.FC<Props> = ({
  me,
  currentRequest,
  emptyText,
  onCommentCreate,
  onCommentUpdate,
  onCommentDelete,
  onGetAsset,
  onGroupGet,
}) => {
  return (
    <ContentWrapper>
      <ThreadWrapper>
        <CommentsContainer>
          <RequestDescription
            currentRequest={currentRequest}
            onGetAsset={onGetAsset}
            onGroupGet={onGroupGet}
          />
          {currentRequest.comments && currentRequest.comments?.length > 0 && (
            <RequestCommentList
              me={me}
              comments={currentRequest.comments}
              onCommentUpdate={onCommentUpdate}
              onCommentDelete={onCommentDelete}
            />
          )}
        </CommentsContainer>
        <StyledRequestStatus requestState={currentRequest.state} />
      </ThreadWrapper>

      {!currentRequest.comments || currentRequest.comments.length === 0 ? (
        <EmptyTextWrapper>{emptyText}</EmptyTextWrapper>
      ) : null}

      <ThreadDivider />

      <AntDComment
        avatar={<UserAvatar username={me?.name} />}
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
