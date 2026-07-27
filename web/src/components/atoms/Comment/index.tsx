import styled from "@emotion/styled";
import type { ReactNode } from "react";

export type CommentProps = {
  actions?: ReactNode[];
  author?: ReactNode;
  avatar?: ReactNode;
  content: ReactNode;
  datetime?: ReactNode;
  className?: string;
};

const Comment: React.FC<CommentProps> = ({ actions, author, avatar, content, datetime, className }) => {
  return (
    <div className={className ? `${className} ant-comment` : "ant-comment"}>
      <div className="ant-comment-inner">
        {avatar && <div className="ant-comment-avatar">{avatar}</div>}
        <div className="ant-comment-content">
          {(author || datetime) && (
            <div className="ant-comment-content-author">
              {author && <span className="ant-comment-content-author-name">{author}</span>}
              {datetime && <span className="ant-comment-content-author-time">{datetime}</span>}
            </div>
          )}
          <div className="ant-comment-content-detail">{content}</div>
          {actions && actions.length > 0 && (
            <ul className="ant-comment-actions">
              {actions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

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
