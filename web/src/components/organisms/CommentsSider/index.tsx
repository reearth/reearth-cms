import { Comment } from "@reearth-cms/components/molecules/Asset/asset.type";
import ThreadSider from "@reearth-cms/components/molecules/Common/ThreadSider";

import useHooks from "./hooks";

export interface Props {
  threadId?: string;
  comments?: Comment[];
}

const CommentsSider: React.FC<Props> = ({ threadId, comments }) => {
  const { handleCommentCreate } = useHooks({
    threadId,
  });

  return <ThreadSider comments={comments} onCommentCreate={handleCommentCreate} />;
};

export default CommentsSider;
