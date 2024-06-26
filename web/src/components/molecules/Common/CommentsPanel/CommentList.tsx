import List from "@reearth-cms/components/atoms/List";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { Comment } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";

import CommentMolecule from "./Comment";

interface Props {
  me?: User;
  comments: Comment[];
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
}

export const CommentList: React.FC<Props> = ({
  me,
  comments,
  onCommentUpdate,
  onCommentDelete,
}) => (
  <List
    dataSource={comments}
    itemLayout="horizontal"
    renderItem={props => (
      <CommentMolecule
        comment={props}
        me={me}
        onCommentUpdate={onCommentUpdate}
        onCommentDelete={onCommentDelete}
      />
    )}
  />
);
