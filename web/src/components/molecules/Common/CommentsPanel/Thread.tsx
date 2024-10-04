import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { Comment } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";

import { CommentList } from "./CommentList";

type Props = {
  me?: User;
  isWriter: boolean;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  comments?: Comment[];
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
};

export const Thread: React.FC<Props> = ({
  me,
  isWriter,
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
          isWriter={isWriter}
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
