import { Comment } from "@reearth-cms/components/molecules/Asset/asset.type";
import CommentsPanelMolecule from "@reearth-cms/components/molecules/Common/CommentsPanel";

import useHooks from "./hooks";

export type Props = {
  emptyText?: string;
  threadId?: string;
  comments?: Comment[];
  collapsedInitialValue?: boolean;
};

const CommentsPanel: React.FC<Props> = ({
  emptyText,
  threadId,
  comments,
  collapsedInitialValue,
}) => {
  const { handleCommentCreate } = useHooks({
    threadId,
  });

  return (
    <CommentsPanelMolecule
      emptyText={emptyText}
      comments={comments}
      onCommentCreate={handleCommentCreate}
      collapsedInitialValue={collapsedInitialValue}
    />
  );
};

export default CommentsPanel;
