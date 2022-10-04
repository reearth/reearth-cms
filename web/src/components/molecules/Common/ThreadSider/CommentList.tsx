import List from "@reearth-cms/components/atoms/List";

import Comment from "./Comment";

type CommentListProps = {
  comments: CommentItem[];
};

type CommentItem = {
  author: string;
  avatar: string;
  content: React.ReactNode;
  datetime: string;
};

export const CommentList: React.FC<CommentListProps> = ({
  comments,
}: {
  comments: CommentItem[];
}) => (
  <List
    dataSource={comments}
    itemLayout="horizontal"
    renderItem={props => <Comment {...props} />}
  />
);
