import moment from "moment";
import { useMemo } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import AntDComment from "@reearth-cms/components/atoms/Comment";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { Comment } from "@reearth-cms/components/molecules/Asset/asset.type";

type Props = {
  comment: Comment;
};

const CommentMolecule: React.FC<Props> = ({ comment }) => {
  const fromNow = useMemo(
    () => moment(comment.createdAt?.toString()).fromNow(),
    [comment.createdAt],
  );

  return (
    <AntDComment
      author={<a>{comment.author}</a>}
      avatar={
        comment.authorType === "Integration" ? (
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
            <UserAvatar username={comment.author} anonymous={comment.author === "Anonymous"} />
          </Badge>
        ) : (
          <UserAvatar username={comment.author} anonymous={comment.author === "Anonymous"} />
        )
      }
      content={<>{comment.content}</>}
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

export default CommentMolecule;
