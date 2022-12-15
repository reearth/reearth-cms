import styled from "@emotion/styled";

import { Comment } from "@reearth-cms/components/molecules/Asset/asset.type";
import { RequestCommentList } from "@reearth-cms/components/molecules/Request/Details/CommentList";

import RequestEditor from "./Editor";

export type Props = {
  comments?: Comment[];
  emptyText?: string;
  onCommentCreate: (content: string) => Promise<void>;
};

const RequestThread: React.FC<Props> = ({ comments, emptyText, onCommentCreate }) => {
  return (
    <ContentWrapper>
      <ThreadWrapper>
        <CommentsContainer>
          {comments && comments?.length > 0 && <RequestCommentList comments={comments} />}
        </CommentsContainer>
      </ThreadWrapper>

      {!comments || comments.length === 0 ? <EmptyTextWrapper>{emptyText}</EmptyTextWrapper> : null}

      <RequestEditor onCommentCreate={onCommentCreate} />
    </ContentWrapper>
  );
};

export default RequestThread;

const ThreadWrapper = styled.div`
  padding: 12px;
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
