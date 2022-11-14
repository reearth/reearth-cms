import { Comment } from "@reearth-cms/components/molecules/Asset/asset.type";

import { CommentList } from "./CommentList";

type Props = {
  comments?: Comment[];
};

export const Thread: React.FC<Props> = ({ comments }) => {
  return <>{comments && comments?.length > 0 && <CommentList comments={comments} />}</>;
};

export default Thread;
