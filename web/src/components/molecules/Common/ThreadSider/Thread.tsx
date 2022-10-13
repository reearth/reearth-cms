import { CommentList } from "./CommentList";
import { Editor } from "./Editor";
import { CommentItem } from "./thread.types";

type Props = {
  onCommentCreate: (content: string) => Promise<void>;
  comments: CommentItem[];
};

export const Thread: React.FC<Props> = ({ comments, onCommentCreate }) => {
  return (
    <>
      {comments.length > 0 && <CommentList comments={comments} />}
      <Editor onCommentCreate={onCommentCreate} />
    </>
  );
};

export default Thread;
