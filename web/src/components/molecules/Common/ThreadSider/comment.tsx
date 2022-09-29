import { Avatar, Comment, Tooltip } from "antd";
import moment from "moment";

type Props = {
  comment: any;
};

const CommentContainer: React.FC<Props> = ({ comment }) => {
  const fromNow = moment(comment.datetime).fromNow();
  return (
    <Comment
      author={<a>{comment.author}</a>}
      avatar={<Avatar src={comment.avatarUrl} alt="avatar" />}
      content={<p>{comment.content}</p>}
      datetime={
        <Tooltip title={comment.datetime}>
          <span>{fromNow}</span>
        </Tooltip>
      }
    />
  );
};

export default CommentContainer;
