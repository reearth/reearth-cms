import { Comment } from "@reearth-cms/components/molecules/Asset/asset.type";
import CommentsPanelMolecule from "@reearth-cms/components/molecules/Common/CommentsPanel";

import useHooks from "./hooks";

export type Props = {
  threadId?: string;
  comments?: Comment[];
};

const CommentsPanel: React.FC<Props> = ({ threadId, comments }) => {
  const { handleCommentCreate } = useHooks({
    threadId,
  });

  return <CommentsPanelMolecule comments={comments} onCommentCreate={handleCommentCreate} />;
};

export default CommentsPanel;
