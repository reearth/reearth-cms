import List from "@reearth-cms/components/atoms/List";
import { Comment } from "@reearth-cms/components/molecules/Asset/asset.type";
import ThreadCommentMoecule from "@reearth-cms/components/molecules/Request/Details/Comment";

type Props = {
  comments: Comment[];
};

export const RequestCommentList: React.FC<Props> = ({ comments }: { comments: Comment[] }) => (
  <List
    dataSource={comments}
    itemLayout="horizontal"
    renderItem={props => <ThreadCommentMoecule comment={props} />}
  />
);
