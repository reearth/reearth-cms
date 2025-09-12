import styled from "@emotion/styled";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Button from "@reearth-cms/components/atoms/Button";
import AntDComment from "@reearth-cms/components/atoms/Comment";
import Icon from "@reearth-cms/components/atoms/Icon";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { Comment as CommentType } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

type Props = {
  userId: string;
  hasUpdateRight: boolean | null;
  hasDeleteRight: boolean | null;
  comment: CommentType;
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
};

const Comment: React.FC<Props> = ({
  userId,
  hasUpdateRight,
  hasDeleteRight,
  comment,
  onCommentUpdate,
  onCommentDelete,
}) => {
  const t = useT();
  const [showEditor, setShowEditor] = useState(false);
  const [value, setValue] = useState(comment.content);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  }, []);

  useEffect(() => {
    setValue(comment.content);
  }, [comment.content, showEditor, setValue]);

  const handleSubmit = useCallback(async () => {
    try {
      if (comment.content !== value) {
        await onCommentUpdate(comment.id, value);
      }
    } catch (info) {
      console.log("Validate Failed:", info);
    } finally {
      setShowEditor(false);
    }
  }, [comment.content, comment.id, value, onCommentUpdate]);

  const fromNow = useMemo(() => dayjs(comment.createdAt).fromNow(), [comment.createdAt]);

  const actions = useMemo(() => {
    const result = [];
    const isMine = userId === comment.author.id;
    if (hasDeleteRight || (hasDeleteRight === null && isMine)) {
      result.push(
        <Button
          color="default"
          variant="link"
          size="small"
          icon={<Icon icon="delete" size={12} />}
          onClick={() => onCommentDelete(comment.id)}
        />,
      );
    }
    if (hasUpdateRight || (hasUpdateRight === null && isMine)) {
      result.push(
        <Button
          color="default"
          variant="link"
          size="small"
          icon={<Icon icon={showEditor ? "check" : "edit"} size={12} />}
          onClick={showEditor ? handleSubmit : () => setShowEditor(true)}
        />,
      );
    }
    return result;
  }, [
    comment.author.id,
    comment.id,
    handleSubmit,
    hasDeleteRight,
    hasUpdateRight,
    userId,
    onCommentDelete,
    showEditor,
  ]);

  const displayAuthor = useMemo<string>(
    () =>
      comment.author.id === userId
        ? `${comment.author.name} (${t("Myself")})`
        : comment.author.name,
    [comment.author.id, comment.author.name, t, userId],
  );

  return (
    <StyledAntDComment
      actions={actions}
      author={displayAuthor}
      content={
        showEditor ? (
          <TextArea onChange={handleChange} value={value} autoSize={{ maxRows: 4 }} />
        ) : (
          <ReactMarkdown
            components={{
              a(props) {
                const { node, ...rest } = props;
                return <a target="_blank" {...rest} />;
              },
            }}
            remarkPlugins={[remarkGfm]}>
            {comment.content}
          </ReactMarkdown>
        )
      }
      datetime={<Tooltip title={dateTimeFormat(comment.createdAt)}>{fromNow}</Tooltip>}
    />
  );
};

const StyledAntDComment = styled(AntDComment)`
  .ant-comment-content-author {
    .ant-comment-content-author-name {
      font-weight: 500;
      font-size: 14px;
      color: #000000;
      overflow: hidden;
    }

    .ant-comment-content-author-time {
      display: flex;
      align-items: center;
    }
  }
`;

export default Comment;
