import CommentsPanelWrapper from "@reearth-cms/components/molecules/Common/CommentsPanel";
import {
  Comment,
  RefetchQueries,
  ResourceType,
} from "@reearth-cms/components/molecules/Common/CommentsPanel/types";

import useHooks from "./hooks";

type Props = {
  resourceId?: string;
  resourceType: ResourceType;
  threadId?: string;
  comments?: Comment[];
  collapsed: boolean;
  onCollapse: (value: boolean) => void;
  refetchQueries: RefetchQueries;
};

const CommentsPanel: React.FC<Props> = ({
  resourceId,
  resourceType,
  threadId,
  comments,
  collapsed,
  onCollapse,
  refetchQueries,
}) => {
  const {
    userId,
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
    <CommentsPanelWrapper
      userId={userId}
      hasCreateRight={hasCreateRight}
      hasUpdateRight={hasUpdateRight}
      hasDeleteRight={hasDeleteRight}
      resourceId={resourceId}
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
