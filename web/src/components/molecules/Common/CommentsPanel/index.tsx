import styled from "@emotion/styled";
import { useRef, useEffect } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Comment from "@reearth-cms/components/molecules/Common/CommentsPanel/Comment";
import { Comment as CommentType } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";
import Sidebar from "@reearth-cms/components/molecules/Common/Sidebar";
import { useT } from "@reearth-cms/i18n";

import Editor from "./Editor";

type Props = {
  userId: string;
  hasCreateRight: boolean;
  hasUpdateRight: boolean | null;
  hasDeleteRight: boolean | null;
  resourceId?: string;
  comments?: CommentType[];
  collapsed: boolean;
  onCollapse: (value: boolean) => void;
  onCommentCreate: (content: string) => Promise<void>;
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
};

const CommentsPanel: React.FC<Props> = ({
  userId,
  hasCreateRight,
  hasUpdateRight,
  hasDeleteRight,
  resourceId,
  comments,
  collapsed,
  onCollapse,
  onCommentCreate,
  onCommentUpdate,
  onCommentDelete,
}) => {
  const t = useT();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [collapsed, resourceId]);

  return (
    <Sidebar
      collapsible
      width={274}
      collapsedWidth={54}
      collapsed={collapsed}
      onCollapse={value => onCollapse(value)}
      trigger={<Icon icon={collapsed ? "panelToggleLeft" : "panelToggleRight"} />}>
      <ContentWrapper>
        {collapsed ? (
          <StyledIcon icon="comment" onClick={() => onCollapse(false)} />
        ) : (
          <>
            <Title onClick={() => onCollapse(true)}>{t("Comments")}</Title>
            <CommentsContainer ref={scrollRef}>
              {comments && comments.length > 0 ? (
                comments.map(comment => (
                  <Comment
                    key={comment.id}
                    userId={userId}
                    hasUpdateRight={hasUpdateRight}
                    hasDeleteRight={hasDeleteRight}
                    comment={comment}
                    onCommentUpdate={onCommentUpdate}
                    onCommentDelete={onCommentDelete}
                  />
                ))
              ) : (
                <EmptyText>
                  {comments
                    ? t("No comments.")
                    : t("Please click the comment bubble in the table to check comments.")}
                </EmptyText>
              )}
            </CommentsContainer>
            <Editor
              isInputDisabled={!comments || !hasCreateRight}
              onCommentCreate={onCommentCreate}
            />
          </>
        )}
      </ContentWrapper>
    </Sidebar>
  );
};

export default CommentsPanel;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 12px;
  gap: 12px;
`;

const StyledIcon = styled(Icon)`
  justify-content: center;
`;

const Title = styled.h3`
  font-size: 16px;
  line-height: 1.5;
  cursor: pointer;
`;

const CommentsContainer = styled.div`
  overflow: auto;
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  .ant-comment-inner {
    padding: 0;
  }
  .ant-comment-content-author {
    margin-right: 48px;
    overflow-wrap: anywhere;
  }
  .ant-comment-actions {
    position: absolute;
    top: 0;
    right: 0;
    margin: 0;
  }
`;

const EmptyText = styled.p`
  color: #00000073;
  text-align: center;
  width: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
