import { MessageOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { SiderProps } from "antd";

import Sider from "@reearth-cms/components/atoms/Sider";
import { useT } from "@reearth-cms/i18n";

import CommentContainer from "./comment";
import ReplyEditor from "./replyEditor";

const ThreadSider: React.FC<SiderProps> = ({ ...props }) => {
  const t = useT();
  const comment = {
    author: "Han Solo",
    avatarUrl: "https://joeschmoe.io/api/v1/random",
    content:
      "We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.",
    createdAt: "2016-11-22 11:22:33",
  };

  return (
    <StyledSider {...props}>
      {props.collapsed ? (
        <CollapsedSider>
          <MessageOutlined />
        </CollapsedSider>
      ) : (
        <NotCollapsedSider>
          <SiderTitle>{t("Comments")}</SiderTitle>
          <CommentsContainer>
            <CommentContainer comment={comment} />
            <ReplyEditor />
          </CommentsContainer>
        </NotCollapsedSider>
      )}
    </StyledSider>
  );
};

const StyledSider = styled(Sider)`
  background-color: #fff;
  .ant-layout-sider-trigger {
    background-color: #fff;
    color: #002140;
    text-align: left;
    padding: 0 24px;
  }
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
`;

const CollapsedSider = styled.div`
  display: flex;
  justify-content: center;
  font-size: 18px;
  padding-top: 20px;
`;

const NotCollapsedSider = styled.div`
  padding: 12px;
`;

const SiderTitle = styled.h1`
  font-size: 18px;
`;

const CommentsContainer = styled.div`
display: flex,
flex-direction: column,
justify-content: space-between,
`;

export default ThreadSider;
