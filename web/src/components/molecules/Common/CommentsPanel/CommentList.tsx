import List from "@reearth-cms/components/atoms/List";
import { Comment } from "@reearth-cms/components/molecules/Asset/asset.type";

import CommentMolecule from "./Comment";

type Props = {
  comments: Comment[];
};

export const CommentList: React.FC<Props> = ({ comments }: { comments: Comment[] }) => (
  <List
    dataSource={comments}
    itemLayout="horizontal"
    renderItem={props => <CommentMolecule comment={props} />}
  />
);
