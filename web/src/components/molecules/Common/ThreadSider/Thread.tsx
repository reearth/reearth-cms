import { Comment } from "@reearth-cms/components/molecules/Asset/asset.type";

import { CommentList } from "./CommentList";
import { Editor } from "./Editor";

type Props = {
  onCommentCreate: (content: string) => Promise<void>;
  comments: Comment[];
};

export const Thread: React.FC<Props> = ({ comments, onCommentCreate }) => {
  return (
    <>
      {comments?.length > 0 && <CommentList comments={comments} />}
      <Editor onCommentCreate={onCommentCreate} />
    </>
  );
};

export default Thread;
