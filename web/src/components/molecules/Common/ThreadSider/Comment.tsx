import moment from "moment";

import Avatar from "@reearth-cms/components/atoms/Avatar";
import AntDComment from "@reearth-cms/components/atoms/Comment";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";

import { CommentItem } from "./thread.types";

type Props = {
  comment: CommentItem;
};

const Comment: React.FC<Props> = ({ comment }) => {
  const fromNow = moment(comment.createdAt?.toString()).fromNow();

  return (
    <AntDComment
      author={<a>{comment.author.name}</a>}
      avatar={
        <Avatar style={{ color: "#fff", backgroundColor: "#3F3D45" }}>
          {comment.author.name.charAt(0)}
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
