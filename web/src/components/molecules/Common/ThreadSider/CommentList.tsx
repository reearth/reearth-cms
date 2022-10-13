import List from "@reearth-cms/components/atoms/List";

import Comment from "./Comment";
import { CommentItem } from "./thread.types";

type Props = {
  comments: CommentItem[];
};

export const CommentList: React.FC<Props> = ({ comments }: { comments: CommentItem[] }) => (
  <List
    dataSource={comments}
    itemLayout="horizontal"
    renderItem={props => <Comment comment={props} />}
  />
);
