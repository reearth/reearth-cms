import styled from "@emotion/styled";

import List from "@reearth-cms/components/atoms/List";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { Comment } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";
import ThreadCommentMolecule from "@reearth-cms/components/molecules/Request/Details/Comment";

type Props = {
  me?: User;
  hasCommentUpdateRight: boolean | null;
  hasCommentDeleteRight: boolean | null;
  comments: Comment[];
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
};

export const RequestCommentList: React.FC<Props> = ({
  me,
  hasCommentUpdateRight,
  hasCommentDeleteRight,
  comments,
  onCommentUpdate,
  onCommentDelete,
}) => (
  <StyledListWrapper>
    <List
      dataSource={comments}
      itemLayout="horizontal"
      renderItem={props => (
        <ThreadCommentMolecule
          me={me}
          hasCommentUpdateRight={hasCommentUpdateRight}
          hasCommentDeleteRight={hasCommentDeleteRight}
          comment={props}
          onCommentUpdate={onCommentUpdate}
          onCommentDelete={onCommentDelete}
        />
      )}
    />
  </StyledListWrapper>
);

const StyledListWrapper = styled.div`
  .ant-comment {
    .ant-comment-content {
      &:before {
        content: "";
        display: block;
        position: absolute;
        width: 4px;
        height: 24px;
        background-color: #d9d9d9;
        left: 16px;
        top: -30px;
      }
    }
  }
`;
