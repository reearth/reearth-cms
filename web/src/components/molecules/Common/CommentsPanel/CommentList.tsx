import List from "@reearth-cms/components/atoms/List";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { Comment } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";

import CommentMolecule from "./Comment";

type Props = {
  me?: User;
  hasUpdateRight: boolean | null;
  hasDeleteRight: boolean | null;
  comments: Comment[];
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
};

export const CommentList: React.FC<Props> = ({
  me,
  hasUpdateRight,
  hasDeleteRight,
  comments,
  onCommentUpdate,
  onCommentDelete,
}) => (
  <List
    dataSource={comments}
    itemLayout="horizontal"
    renderItem={props => (
      <CommentMolecule
        me={me}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
        comment={props}
        onCommentUpdate={onCommentUpdate}
        onCommentDelete={onCommentDelete}
      />
    )}
  />
);
