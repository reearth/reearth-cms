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
      <ThreadWrapper>
        <CommentsContainer>
          <RequestDescription
            currentRequest={currentRequest}
            onGetAsset={onGetAsset}
            onGroupGet={onGroupGet}
            onNavigateToItemEdit={onNavigateToItemEdit}
          />
          {currentRequest.comments && currentRequest.comments?.length > 0 && (
            <RequestCommentList
              me={me}
              hasCommentUpdateRight={hasCommentUpdateRight}
              hasCommentDeleteRight={hasCommentDeleteRight}
              comments={currentRequest.comments}
              onCommentUpdate={onCommentUpdate}
              onCommentDelete={onCommentDelete}
            />
          )}
        </CommentsContainer>
        <RequestStatus requestState={currentRequest.state} />
      </ThreadWrapper>
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

const ThreadWrapper = styled.div`
  overflow: auto;
`;

const CommentsContainer = styled.div`
  overflow: auto;
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
