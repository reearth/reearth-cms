import { Comment } from "@ant-design/compatible";
import type { CommentProps } from "@ant-design/compatible/lib/comment";

export default styled(Comment)`
  display: flex;

  .ant-comment-inner {
    display: flex;
    padding: 16px 0;
  }

  .ant-comment-avatar {
    margin-right: 12px;
  }

  .ant-comment-content {
    flex: 1;
    min-width: 0;
    word-wrap: break-word;
  }

  .ant-comment-content-author {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 14px;
  }

  .ant-comment-content-author-name {
    font-weight: 600;
    color: rgba(0, 0, 0, 0.88);
  }

  .ant-comment-content-author-time {
    color: rgba(0, 0, 0, 0.45);
  }

  .ant-comment-actions {
    display: flex;
    gap: 12px;
    margin: 8px 0 0;
    padding: 0;
    list-style: none;

    li {
      color: rgba(0, 0, 0, 0.45);
    }
  }
`;
