import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { Comment } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";

import { CommentList } from "./CommentList";

type Props = {
  me?: User;
  hasUpdateRight: boolean | null;
  hasDeleteRight: boolean | null;
  comments?: Comment[];
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
};

export const Thread: React.FC<Props> = ({
  me,
  hasUpdateRight,
  hasDeleteRight,
  comments,
  onCommentUpdate,
  onCommentDelete,
}) => {
  return (
    <>
      {comments && comments?.length > 0 && (
        <CommentList
          me={me}
          hasUpdateRight={hasUpdateRight}
          hasDeleteRight={hasDeleteRight}
          comments={comments}
          onCommentUpdate={onCommentUpdate}
          onCommentDelete={onCommentDelete}
        />
      )}
    </>
  );
};

export default Thread;
