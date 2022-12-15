import styled from "@emotion/styled";
import moment from "moment";
import { useMemo } from "react";

import Avatar from "@reearth-cms/components/atoms/Avatar";
import Badge from "@reearth-cms/components/atoms/Badge";
import AntDComment from "@reearth-cms/components/atoms/Comment";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { Comment as CommentType } from "@reearth-cms/components/molecules/Asset/asset.type";

type Props = {
  comment: CommentType;
};

const ThreadCommentMolecule: React.FC<Props> = ({ comment }) => {
  const fromNow = useMemo(
    () => moment(comment.createdAt?.toString()).fromNow(),
    [comment.createdAt],
  );

  return (
    <StyledAntDComment
      author={<a>{comment.author}</a>}
      avatar={
        comment.authorType === "Integration" ? (
          <Badge
            count={
              <Icon
                icon="api"
                size={8}
                style={{ borderRadius: "50%", backgroundColor: "#F0F0F0", padding: 3 }}
                color="#BFBFBF"
              />
            }
            offset={[0, 24]}>
            <Avatar style={{ color: "#fff", backgroundColor: "#3F3D45" }}>
              {comment.author.charAt(0)}
            </Avatar>
          </Badge>
        ) : (
          <Avatar style={{ color: "#fff", backgroundColor: "#3F3D45" }}>
            {comment.author.charAt(0)}
          </Avatar>
        )
      }
      content={<>{comment.content}</>}
      datetime={
        comment.createdAt && (
          <Tooltip title={comment.createdAt}>
            <span>{fromNow}</span>
          </Tooltip>
        )
      }
    />
  );
};

export default ThreadCommentMolecule;

const StyledAntDComment = styled(AntDComment)`
  .ant-comment-content {
    background-color: #fff;
    padding: 12px 24px;
  }
`;
