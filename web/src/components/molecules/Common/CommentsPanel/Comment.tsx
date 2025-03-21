import styled from "@emotion/styled";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Badge from "@reearth-cms/components/atoms/Badge";
import Button from "@reearth-cms/components/atoms/Button";
import AntDComment from "@reearth-cms/components/atoms/Comment";
import Icon from "@reearth-cms/components/atoms/Icon";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { Comment as CommentType } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";
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

  return (
    <AntDComment
      actions={actions}
      author={comment.author.name}
      avatar={
        comment.author.type === "Integration" ? (
          <Badge count={<StyledIcon icon="api" size={8} color="#BFBFBF" />} offset={[0, 24]}>
            <UserAvatar username={comment.author.name} />
          </Badge>
        ) : (
          <UserAvatar username={comment.author.name} />
        )
      }
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

const StyledIcon = styled(Icon)`
  border-radius: 50%;
  background-color: #f0f0f0;
  padding: 3px;
`;

export default Comment;
