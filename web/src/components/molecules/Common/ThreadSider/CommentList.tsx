import List from "@reearth-cms/components/atoms/List";
import { Comment as CommentItem } from "@reearth-cms/components/molecules/Asset/asset.type";

import Comment from "./Comment";

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
