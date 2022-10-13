import styled from "@emotion/styled";
import { useState } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Sider, { SiderProps } from "@reearth-cms/components/atoms/Sider";
import { useT } from "@reearth-cms/i18n";

import Thread from "./Thread";

export type Props = {
  onCommentCreate: (content: string) => Promise<void>;
};

const ThreadSider: React.FC<Props> = ({ onCommentCreate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const t = useT();

  const [comments, setComments] = useState<any>([
    {
      author: "Nour Balaha",
      avatar: "https://joeschmoe.io/api/v1/random",
      content: "How are you doing?",
      datetime: "2022-09-28 11:22:33",
    },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value) return;

    const createdAt = new Date().toLocaleString();
    const author = "Nour Balaha";
    const comment = {
      author: author,
      avatar: "https://joeschmoe.io/api/v1/random",
      content: value,
      datetime: createdAt,
    };

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setValue("");
      setComments([...comments, comment]);
    }, 1000);
  };

  const handleChange = (e: any) => {
    setValue(e.target.value);
  };

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
            <Thread
              comments={comments}
              avatar="https://joeschmoe.io/api/v1/random"
              onChange={handleChange}
              onSubmit={handleSubmit}
              submitting={submitting}
              value={value}
            />
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
