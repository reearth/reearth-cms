import styled from "@emotion/styled";
import { ReactNode } from "react";

type CommentProps = {
  author?: ReactNode;
  avatar?: ReactNode;
  content?: ReactNode;
  datetime?: ReactNode;
  actions?: ReactNode[];
  children?: ReactNode;
  className?: string;
};

const Comment: React.FC<CommentProps> = ({
  author,
  avatar,
  content,
  datetime,
  actions,
  children,
  className,
}) => {
  return (
    <CommentRoot className={`ant-comment ${className ?? ""}`}>
      <div className="ant-comment-inner">
        {avatar && <div className="ant-comment-avatar">{avatar}</div>}
        <div className="ant-comment-content">
          {(author || datetime) && (
            <div className="ant-comment-content-author">
              {author && <span className="ant-comment-content-author-name">{author}</span>}
              {datetime && <span className="ant-comment-content-author-time">{datetime}</span>}
            </div>
          )}
          {content && <div className="ant-comment-content-detail">{content}</div>}
          {actions && actions.length > 0 && (
            <ul className="ant-comment-actions">
              {actions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {children && <div className="ant-comment-nested">{children}</div>}
    </CommentRoot>
  );
};

const CommentRoot = styled.div`
  position: relative;

  .ant-comment-inner {
    display: flex;
    padding: 16px 0;
  }

  .ant-comment-avatar {
    flex-shrink: 0;
    margin-right: 12px;
    cursor: pointer;

    img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }
  }

  .ant-comment-content {
    position: relative;
    flex: 1 1 auto;
    min-width: 1px;
    font-size: 14px;
    word-wrap: break-word;
  }

  .ant-comment-content-author {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    margin-bottom: 4px;
    font-size: 14px;

    & > a,
    & > span {
      padding-right: 8px;
      font-size: 12px;
      line-height: 18px;
    }
  }

  .ant-comment-content-author-name {
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
    transition: color 0.3s;

    > * {
      color: rgba(0, 0, 0, 0.45);

      &:hover {
        color: rgba(0, 0, 0, 0.45);
      }
    }
  }

  .ant-comment-content-author-time {
    color: rgba(0, 0, 0, 0.45);
    white-space: nowrap;
    cursor: auto;
  }

  .ant-comment-content-detail p {
    white-space: pre-wrap;
  }

  .ant-comment-actions {
    margin-top: 12px;
    margin-bottom: inherit;
    padding-left: 0;

    > li {
      display: inline-block;
      color: rgba(0, 0, 0, 0.45);

      > span {
        margin-right: 10px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 12px;
        cursor: pointer;
        transition: color 0.3s;
        user-select: none;

        &:hover {
          color: rgba(0, 0, 0, 0.65);
        }
      }
    }
  }

  .ant-comment-nested {
    margin-left: 44px;
  }
`;

export default Comment;
export type { CommentProps };
