import styled from "@emotion/styled";
import { useState } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Sider from "@reearth-cms/components/atoms/Sider";
import { useT } from "@reearth-cms/i18n";

import Thread from "./Thread";
import { CommentItem } from "./thread.types";

export type Props = {
  onCommentCreate: (content: string) => Promise<void>;
  comments: CommentItem[];
};

const ThreadSider: React.FC<Props> = ({ onCommentCreate, comments }) => {
  const [collapsed, setCollapsed] = useState(false);
  const t = useT();

  return (
    <StyledSider width={300} collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
      {collapsed ? (
        <CollapsedSider>
          <Icon icon="message" />
        </CollapsedSider>
      ) : (
        <NotCollapsedSider>
          <SiderTitle>{t("Comments")}</SiderTitle>
          <CommentsContainer>
            <Thread comments={comments} onCommentCreate={onCommentCreate} />
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
