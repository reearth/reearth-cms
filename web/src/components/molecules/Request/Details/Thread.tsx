import styled from "@emotion/styled";

import AntDComment from "@reearth-cms/components/atoms/Comment";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import Comment from "@reearth-cms/components/molecules/Common/CommentsPanel/Comment";
import { RequestDescription } from "@reearth-cms/components/molecules/Request/Details/RequestDescription";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { Group } from "@reearth-cms/components/molecules/Schema/types";

import RequestEditor from "./Editor";
import RequestStatus from "./RequestStatus";

type Props = {
  me?: User;
  hasCommentCreateRight: boolean;
  hasCommentUpdateRight: boolean | null;
  hasCommentDeleteRight: boolean | null;
  currentRequest: Request;
  onCommentCreate: (content: string) => Promise<void>;
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
  onNavigateToItemEdit: (modelId: string, itemId: string) => void;
};

const RequestThread: React.FC<Props> = ({
  me,
  hasCommentCreateRight,
  hasCommentUpdateRight,
  hasCommentDeleteRight,
  currentRequest,
  onCommentCreate,
  onCommentUpdate,
  onCommentDelete,
  onGetAsset,
  onGroupGet,
  onNavigateToItemEdit,
}) => {
  return (
    <ContentWrapper>
      <RequestDescription
        currentRequest={currentRequest}
        onGetAsset={onGetAsset}
        onGroupGet={onGroupGet}
        onNavigateToItemEdit={onNavigateToItemEdit}
      />
      {currentRequest.comments && currentRequest.comments.length > 0 && (
        <CommentWrapper>
          {currentRequest.comments.map(comment => (
            <Comment
              key={comment.id}
              userId={me?.id ?? ""}
              hasUpdateRight={hasCommentUpdateRight}
              hasDeleteRight={hasCommentDeleteRight}
              comment={comment}
              onCommentUpdate={onCommentUpdate}
              onCommentDelete={onCommentDelete}
            />
          ))}
        </CommentWrapper>
      )}
      <RequestStatus requestState={currentRequest.state} />
      <ThreadDivider />
      <StyledAntDComment
        avatar={<UserAvatar username={me?.name} />}
        content={
          <RequestEditor
            hasCommentCreateRight={hasCommentCreateRight}
            onCommentCreate={onCommentCreate}
          />
        }
      />
    </ContentWrapper>
  );
};

export default RequestThread;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const CommentWrapper = styled.div`
  .ant-comment-inner {
    padding: 0;
    margin-top: 35px;
  }
  .ant-comment-content-author {
    padding-right: 48px;
    overflow-wrap: anywhere;
  }
  .ant-comment-avatar {
    background-color: #f5f5f5;
    margin-right: 0;
    padding-right: 12px;
  }
  .ant-comment-content {
    padding: 12px 24px;
    &:before {
      content: "";
      display: block;
      position: absolute;
      width: 4px;
      height: 24px;
      background-color: #d9d9d9;
      left: 16px;
      top: -30px;
    }
  }
  .ant-comment-actions {
    position: absolute;
    top: 12px;
    right: 24px;
    margin: 0;
  }
`;

const ThreadDivider = styled.div`
  border-top: 1px solid #d9d9d9;
  width: calc(100% - 12px);
  padding: 0 12px;
`;

const StyledAntDComment = styled(AntDComment)`
  margin-top: 16px;
  background-color: #f5f5f5;
  .ant-comment-inner {
    padding: 0;
  }
  .ant-comment-avatar {
    margin-right: 0;
    padding-right: 12px;
  }
`;
