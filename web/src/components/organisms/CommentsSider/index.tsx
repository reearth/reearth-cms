import ThreadSider from "@reearth-cms/components/molecules/Common/ThreadSider";
import { CommentItem } from "@reearth-cms/components/molecules/Common/ThreadSider/thread.types";

import useHooks from "./hooks";

export interface Props {
  threadId: string;
  comments: CommentItem[];
}

const CommentsSider: React.FC<Props> = ({ threadId, comments }) => {
  const { handleCommentCreate } = useHooks({
    threadId,
  });

  return <ThreadSider comments={comments} onCommentCreate={handleCommentCreate} />;
};

export default CommentsSider;
