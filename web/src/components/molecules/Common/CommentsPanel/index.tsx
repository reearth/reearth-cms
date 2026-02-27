import styled from "@emotion/styled";
import { useEffect, useRef } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Comment from "@reearth-cms/components/molecules/Common/CommentsPanel/Comment";
import { Comment as CommentType } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";
import Sidebar from "@reearth-cms/components/molecules/Common/Sidebar";
import { useT } from "@reearth-cms/i18n";

import Editor from "./Editor";

type Props = {
  collapsed: boolean;
  comments?: CommentType[];
  hasCreateRight: boolean;
  hasDeleteRight: boolean | null;
  hasUpdateRight: boolean | null;
  onCollapse: (value: boolean) => void;
  onCommentCreate: (content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  resourceId?: string;
  userId: string;
};

const CommentsPanel: React.FC<Props> = ({
  collapsed,
  comments,
  hasCreateRight,
  hasDeleteRight,
  hasUpdateRight,
  onCollapse,
  onCommentCreate,
  onCommentDelete,
  onCommentUpdate,
  resourceId,
  userId,
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
      collapsed={collapsed}
      collapsedWidth={54}
      collapsible
      onCollapse={value => onCollapse(value)}
      trigger={<Icon icon={collapsed ? "panelToggleLeft" : "panelToggleRight"} />}
      width={274}>
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
                    comment={comment}
                    hasDeleteRight={hasDeleteRight}
                    hasUpdateRight={hasUpdateRight}
                    key={comment.id}
                    onCommentDelete={onCommentDelete}
                    onCommentUpdate={onCommentUpdate}
                    userId={userId}
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
