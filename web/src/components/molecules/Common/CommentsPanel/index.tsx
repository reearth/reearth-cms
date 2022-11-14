import styled from "@emotion/styled";
import { useState } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import { Comment } from "@reearth-cms/components/molecules/Asset/asset.type";
import Sidebar from "@reearth-cms/components/molecules/Common/Sidebar";
import { useT } from "@reearth-cms/i18n";

import Editor from "./Editor";
import Thread from "./Thread";

export type Props = {
  onCommentCreate: (content: string) => Promise<void>;
  comments?: Comment[];
};

const CommentsPanel: React.FC<Props> = ({ onCommentCreate, comments }) => {
  const [collapsed, setCollapsed] = useState(true);
  const t = useT();

  return (
    <Sidebar
      collapsible
      width={274}
      collapsedWidth={54}
      collapsed={collapsed}
      onCollapse={value => setCollapsed(value)}
      trigger={<Icon icon={collapsed ? "panelToggleLeft" : "panelToggleRight"} />}>
      <ContentWrapper>
        {collapsed ? (
          <StyledIcon icon="message" />
        ) : (
          <>
            <ThreadWrapper>
              <Title>{t("Comments")}</Title>
              <CommentsContainer>
                <Thread comments={comments} />
              </CommentsContainer>
            </ThreadWrapper>
            <Editor onCommentCreate={onCommentCreate} />
          </>
        )}
      </ContentWrapper>
    </Sidebar>
  );
};

export default CommentsPanel;

const StyledIcon = styled(Icon)`
  padding: 12px 20px;
`;

const ThreadWrapper = styled.div`
  padding: 12px;
  overflow: auto;
`;

const Title = styled.h3`
  font-size: 18px;
`;

const CommentsContainer = styled.div`
  overflow: auto;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;
