import { MessageOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { useState } from "react";

import Sider from "@reearth-cms/components/atoms/Sider";

import CommentContainer from "./comment";
import ReplyEditor from "./replyEditor";

type Props = {};

const ThreadSider: React.FC<Props> = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <StyledThreadSider
      collapsible
      collapsed={collapsed}
      width={300}
      onCollapse={value => setCollapsed(value)}>
      {collapsed ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            fontSize: "18px",
            paddingTop: "20px",
          }}>
          <MessageOutlined />
        </div>
      ) : (
        <div style={{ padding: "12px" }}>
          <h1 style={{ fontSize: "18px" }}>Comments</h1>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}>
            <CommentContainer />
            <ReplyEditor />
          </div>
        </div>
      )}
    </StyledThreadSider>
  );
};

const StyledThreadSider = styled(Sider)`
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

export default ThreadSider;
