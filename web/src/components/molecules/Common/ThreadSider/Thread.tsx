import Avatar from "@reearth-cms/components/atoms/Avatar";

import Comment from "./CommentComponent";
import { CommentList } from "./CommentList";
import { Editor } from "./Editor";

type Props = {
  comments: any[];
  avatar: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  submitting: boolean;
  value: string;
};

export const Thread: React.FC<Props> = ({
  comments,
  avatar,
  onChange,
  onSubmit,
  submitting,
  value,
}) => {
  return (
    <>
      {comments.length > 0 && <CommentList comments={comments} />}
      <Comment
        avatar={<Avatar src={avatar} alt="Avatar" />}
        content={
          <Editor onChange={onChange} onSubmit={onSubmit} submitting={submitting} value={value} />
        }
      />
    </>
  );
};

export default Thread;
