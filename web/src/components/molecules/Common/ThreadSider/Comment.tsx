import moment from "moment";

import Avatar from "@reearth-cms/components/atoms/Avatar";
import AntDComment from "@reearth-cms/components/atoms/Comment";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { Comment as CommentItem } from "@reearth-cms/components/molecules/Asset/asset.type";

type Props = {
  comment: CommentItem;
};

const Comment: React.FC<Props> = ({ comment }) => {
  const fromNow = moment(comment.createdAt?.toString()).fromNow();

  return (
    <AntDComment
      author={<a>{comment.author}</a>}
      avatar={
        <Avatar style={{ color: "#fff", backgroundColor: "#3F3D45" }}>
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

export default Comment;
