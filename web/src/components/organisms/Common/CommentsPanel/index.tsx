import CommentsPanelMolecule from "@reearth-cms/components/molecules/Common/CommentsPanel";
import {
  Comment,
  RefetchQueries,
  ResourceType,
} from "@reearth-cms/components/molecules/Common/CommentsPanel/types";

import useHooks from "./hooks";

type Props = {
  resourceId: string;
  resourceType: ResourceType;
  emptyText?: string;
  threadId?: string;
  comments?: Comment[];
  collapsed: boolean;
  onCollapse: (value: boolean) => void;
  refetchQueries: RefetchQueries;
};

const CommentsPanel: React.FC<Props> = ({
  resourceId,
  resourceType,
  emptyText,
  threadId,
  comments,
  collapsed,
  onCollapse,
  refetchQueries,
}) => {
  const {
    me,
    hasCreateRight,
    hasUpdateRight,
    hasDeleteRight,
    handleCommentCreate,
    handleCommentUpdate,
    handleCommentDelete,
  } = useHooks({
    resourceId,
    resourceType,
    threadId,
    refetchQueries,
  });

  return (
    <CommentsPanelMolecule
      me={me}
      hasCreateRight={hasCreateRight}
      hasUpdateRight={hasUpdateRight}
      hasDeleteRight={hasDeleteRight}
      emptyText={emptyText}
      comments={comments}
      collapsed={collapsed}
      onCollapse={onCollapse}
      onCommentCreate={handleCommentCreate}
      onCommentUpdate={handleCommentUpdate}
      onCommentDelete={handleCommentDelete}
    />
  );
};

export default CommentsPanel;
