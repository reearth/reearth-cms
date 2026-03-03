import CommentsPanelWrapper from "@reearth-cms/components/molecules/Common/CommentsPanel";
import {
  Comment,
  RefetchQueries,
  ResourceType,
} from "@reearth-cms/components/molecules/Common/CommentsPanel/types";

import useHooks from "./hooks";

type Props = {
  collapsed: boolean;
  comments?: Comment[];
  onCollapse: (value: boolean) => void;
  refetchQueries: RefetchQueries;
  resourceId?: string;
  resourceType: ResourceType;
  threadId?: string;
};

const CommentsPanel: React.FC<Props> = ({
  collapsed,
  comments,
  onCollapse,
  refetchQueries,
  resourceId,
  resourceType,
  threadId,
}) => {
  const {
    handleCommentCreate,
    handleCommentDelete,
    handleCommentUpdate,
    hasCreateRight,
    hasDeleteRight,
    hasUpdateRight,
    userId,
  } = useHooks({
    refetchQueries,
    resourceId,
    resourceType,
    threadId,
  });

  return (
    <CommentsPanelWrapper
      collapsed={collapsed}
      comments={comments}
      hasCreateRight={hasCreateRight}
      hasDeleteRight={hasDeleteRight}
      hasUpdateRight={hasUpdateRight}
      onCollapse={onCollapse}
      onCommentCreate={handleCommentCreate}
      onCommentDelete={handleCommentDelete}
      onCommentUpdate={handleCommentUpdate}
      resourceId={resourceId}
      userId={userId}
    />
  );
};

export default CommentsPanel;
