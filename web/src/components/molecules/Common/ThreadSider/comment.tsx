import { Avatar, Comment as AntDComment, CommentProps, Tooltip } from "antd";
import moment from "moment";

const Comment: React.FC<CommentProps> = ({ author, avatar, content, datetime }) => {
  const fromNow = moment(datetime?.toString()).fromNow();

  return (
    <AntDComment
      author={<a>{author}</a>}
      avatar={<Avatar src={avatar} alt="avatar" />}
      content={<>{content}</>}
      datetime={
        datetime && (
          <Tooltip title={datetime}>
            <span>{fromNow}</span>
          </Tooltip>
        )
      }
    />
  );
};

export default Comment;
