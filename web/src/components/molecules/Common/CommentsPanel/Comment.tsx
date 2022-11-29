import moment from "moment";

import Avatar from "@reearth-cms/components/atoms/Avatar";
import AntDComment from "@reearth-cms/components/atoms/Comment";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { Comment } from "@reearth-cms/components/molecules/Asset/asset.type";

type Props = {
  comment: Comment;
};

const CommentMoecule: React.FC<Props> = ({ comment }) => {
  const fromNow = moment(comment.createdAt?.toString()).fromNow();

  return (
    <AntDComment
      author={<a>{comment.author}</a>}
      avatar={
        <Avatar
          style={{ color: "#fff", backgroundColor: "#3F3D45" }}
          shape={comment.authorType === "Integration" ? "square" : "circle"}>
          {comment.author.charAt(0)}
        </Avatar>
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

export default CommentMoecule;
