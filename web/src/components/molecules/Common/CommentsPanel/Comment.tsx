import styled from "@emotion/styled";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Badge from "@reearth-cms/components/atoms/Badge";
import AntDComment from "@reearth-cms/components/atoms/Comment";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { Comment } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";
import { dateTimeFormat } from "@reearth-cms/utils/format";

type Props = {
  me?: User;
  hasUpdateRight: boolean | null;
  hasDeleteRight: boolean | null;
  comment: Comment;
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
};

const CommentMolecule: React.FC<Props> = ({
  me,
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
        await onCommentUpdate?.(comment.id, value);
      }
    } catch (info) {
      console.log("Validate Failed:", info);
    } finally {
      setShowEditor(false);
    }
  }, [comment.content, comment.id, value, onCommentUpdate]);

  const fromNow = useMemo(
    () => dayjs(comment.createdAt?.toString()).fromNow(),
    [comment.createdAt],
  );

  const actions = useMemo(() => {
    const result = [];
    const isMine = me?.id === comment.author.id;
    if (hasDeleteRight || (hasDeleteRight === null && isMine)) {
      result.push(<Icon key="delete" icon="delete" onClick={() => onCommentDelete(comment.id)} />);
    }
    if (hasUpdateRight || (hasUpdateRight === null && isMine)) {
      result.push(
        <Icon
          key="edit"
          icon={showEditor ? "check" : "edit"}
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
    me?.id,
    onCommentDelete,
    showEditor,
  ]);

  return (
    <StyledComment
      actions={actions}
      author={comment.author.name}
      avatar={
        comment.author.type === "Integration" ? (
          <Badge count={<StyledIcon icon="api" size={8} color="#BFBFBF" />} offset={[0, 24]}>
            <UserAvatar
              username={comment.author.name}
              anonymous={comment.author.name === "Anonymous"}
            />
          </Badge>
        ) : (
          <UserAvatar
            username={comment.author.name}
            anonymous={comment.author.name === "Anonymous"}
          />
        )
      }
      content={
        <>
          <Form.Item hidden={!showEditor}>
            <TextArea onChange={handleChange} value={value} rows={4} maxLength={1000} showCount />
          </Form.Item>
          <div hidden={showEditor}>
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
          </div>
        </>
      }
      datetime={
        <Tooltip title={dateTimeFormat(comment.createdAt)}>
          <span>{fromNow}</span>
        </Tooltip>
      }
    />
  );
};

const StyledComment = styled(AntDComment)`
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

const StyledIcon = styled(Icon)`
  border-radius: 50%;
  background-color: #f0f0f0;
  padding: 3px;
`;

export default CommentMolecule;
