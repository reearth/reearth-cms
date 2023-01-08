import styled from "@emotion/styled";
import moment from "moment";
import { useCallback, useMemo, useState } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import AntDComment from "@reearth-cms/components/atoms/Comment";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { Comment } from "@reearth-cms/components/molecules/Asset/asset.type";

type Props = {
  me?: User;
  comment: Comment;
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
};

const CommentMolecule: React.FC<Props> = ({ me, comment, onCommentUpdate, onCommentDelete }) => {
  const [showEditor, setShowEditor] = useState(false);

  const fromNow = useMemo(
    () => moment(comment.createdAt?.toString()).fromNow(),
    [comment.createdAt],
  );

  const handleCommentUpdate = useCallback(() => {
    onCommentUpdate(comment.id, "lalala");
    setShowEditor(false);
  }, [comment.id, onCommentUpdate, setShowEditor]);

  return (
    <StyledComment
      actions={
        me?.id === comment.author.id
          ? [
              <Icon key="delete" icon="delete" onClick={() => onCommentDelete(comment.id)} />,
              showEditor ? (
                <Icon key="edit" icon="check" onClick={handleCommentUpdate} />
              ) : (
                <Icon key="edit" icon="edit" onClick={() => setShowEditor(true)} />
              ),
            ]
          : []
      }
      author={<a> {comment.author.name}</a>}
      avatar={
        comment.author.type === "Integration" ? (
          <Badge
            count={
              <Icon
                icon="api"
                size={8}
                style={{ borderRadius: "50%", backgroundColor: "#F0F0F0", padding: 3 }}
                color="#BFBFBF"
              />
            }
            offset={[0, 24]}>
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
      content={<> {comment.content}</>}
      datetime={
        comment.createdAt && (
          <Tooltip title={comment.createdAt}>
            <span>{fromNow}</span>
          </Tooltip>
        )
      }
    />
  );
};

const StyledComment = styled(AntDComment)`
  .ant-comment-actions {
    position: absolute;
    top: 0;
    right: 0;
    margin: 0;
  }
`;

export default CommentMolecule;
