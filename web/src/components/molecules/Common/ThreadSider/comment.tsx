import moment from "moment";

import Avatar from "@reearth-cms/components/atoms/Avatar";
import AntDComment, { CommentProps } from "@reearth-cms/components/atoms/Comment";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";

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
