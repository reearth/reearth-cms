import ThreadSider from "@reearth-cms/components/molecules/Common/ThreadSider";

import useHooks from "./hooks";

export interface Props {
  threadId: string;
}

const CommentsSider: React.FC<Props> = ({ threadId }) => {
  const { handleCommentCreate } = useHooks({
    threadId,
  });

  return <ThreadSider onCommentCreate={handleCommentCreate} />;
};

export default CommentsSider;
