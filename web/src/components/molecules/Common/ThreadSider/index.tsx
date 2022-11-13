import styled from "@emotion/styled";
import { useState } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Sider from "@reearth-cms/components/atoms/Sider";
import { Comment } from "@reearth-cms/components/molecules/Asset/asset.type";
import { useT } from "@reearth-cms/i18n";

import Thread from "./Thread";

export type Props = {
  onCommentCreate: (content: string) => Promise<void>;
  comments: Comment[];
};

const ThreadSider: React.FC<Props> = ({ onCommentCreate, comments }) => {
  const [collapsed, setCollapsed] = useState(true);
  const t = useT();

  return (
    <StyledSider
      collapsible
      width={300}
      collapsed={collapsed}
      onCollapse={value => setCollapsed(value)}
      trigger={<Icon icon={collapsed ? "modelMenuOpen" : "modelMenuClose"} />}>
      {collapsed ? (
        <CollapsedSider>
          <Icon
            onClick={() => {
              setCollapsed(false);
            }}
            icon="message"
          />
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
    border-top: 1px solid #f0f0f0;
    border-right: 1px solid #f0f0f0;
    color: #002140;
    text-align: left;
    padding: 0 20px;
    margin: 0;
    height: 38px;
    line-height: 38px;
    cursor: pointer;
  }
  .ant-layout-sider-children {
    height: calc(100% + 12px);
  }
  .ant-menu-inline {
    border-right: 1px solid white;

    & > li {
      padding: 0 20px;
    }
  }
  .ant-menu-vertical {
    border-right: none;
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
