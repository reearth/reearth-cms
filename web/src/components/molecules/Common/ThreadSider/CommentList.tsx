import { Comment, List } from "antd";

type CommentListProps = {
  comments: any[];
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
