import styled from "@emotion/styled";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  comment: Comment;
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
};

const ThreadCommentMolecule: React.FC<Props> = ({
  me,
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
      await onCommentUpdate?.(comment.id, value);
    } catch (info) {
      console.log("Validate Failed:", info);
    } finally {
      setShowEditor(false);
    }
  }, [value, comment.id, onCommentUpdate]);

  const fromNow = useMemo(
    () => dayjs(comment.createdAt?.toString()).fromNow(),
    [comment.createdAt],
  );

  return (
    <StyledAntDComment
      author={comment.author.name}
      actions={
        me?.id === comment.author.id
          ? [
              <Icon key="delete" icon="delete" onClick={() => onCommentDelete(comment.id)} />,
              showEditor ? (
                <Icon key="edit" icon="check" onClick={handleSubmit} />
              ) : (
                <Icon key="edit" icon="edit" onClick={() => setShowEditor(true)} />
              ),
            ]
          : []
      }
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
            <TextArea onChange={handleChange} value={value} rows={4} />
          </Form.Item>
          <div hidden={showEditor}>{comment.content}</div>
        </>
      }
      datetime={
        comment.createdAt && (
          <Tooltip title={dateTimeFormat(comment.createdAt)}>
            <span>{fromNow}</span>
          </Tooltip>
        )
      }
    />
  );
};

export default ThreadCommentMolecule;

const StyledAntDComment = styled(AntDComment)`
  .ant-comment-inner {
    padding: 0;
    margin-top: 35px;
  }
  .ant-comment-avatar {
    background-color: #f5f5f5;
    margin-right: 0;
    padding-right: 12px;
  }
  .ant-comment-content {
    background-color: #fff;
    padding: 12px 24px;
  }
  .ant-comment-actions {
    position: absolute;
    top: 12px;
    right: 24px;
    margin: 0;
  }

  .ant-comment-content-author {
    padding-right: 48px;
    .ant-comment-content-author-name {
      overflow: hidden;
    }
  }
`;

const StyledIcon = styled(Icon)`
  border-radius: 50%;
  background-color: #f0f0f0;
  padding: 3px;
`;
