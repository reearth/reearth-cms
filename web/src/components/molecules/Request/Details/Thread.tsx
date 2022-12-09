import styled from "@emotion/styled";

import { Comment } from "@reearth-cms/components/molecules/Asset/asset.type";
import Editor from "@reearth-cms/components/molecules/Common/CommentsPanel/Editor";
import Thread from "@reearth-cms/components/molecules/Common/CommentsPanel/Thread";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  comments?: Comment[];
  emptyText?: string;
  onCommentCreate: (content: string) => Promise<void>;
};

const RequestThread: React.FC<Props> = ({ comments, emptyText, onCommentCreate }) => {
  const t = useT();

  return (
    <ContentWrapper>
      <ThreadWrapper>
        <Title>{t("Comments")}</Title>
        <CommentsContainer>
          <Thread comments={comments} />
        </CommentsContainer>
      </ThreadWrapper>

      {!comments || comments.length === 0 ? <EmptyTextWrapper>{emptyText}</EmptyTextWrapper> : null}

      <Editor onCommentCreate={onCommentCreate} />
    </ContentWrapper>
  );
};

export default RequestThread;

const ThreadWrapper = styled.div`
  padding: 12px;
  overflow: auto;
`;

const Title = styled.h3`
  font-size: 18px;
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
