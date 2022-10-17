import styled from "@emotion/styled";

import Content from "@reearth-cms/components/atoms/Content";
import Layout from "@reearth-cms/components/atoms/Layout";
import Sider from "@reearth-cms/components/atoms/Sider";

export type InnerProps = {
  onWorkspaceModalOpen?: () => void;
};

export type Props = {
  headerComponent: React.ReactNode;
  contentComponent: React.ReactNode;
  sidebarComponent: React.ReactNode;
  collapsed: boolean;
  onCollapse: (collapse: boolean) => void;
};

const CMSWrapper: React.FC<Props> = ({
  contentComponent: Content,
  sidebarComponent: Sidebar,
  headerComponent: Header,
  collapsed,
  onCollapse,
}) => {
  return (
    <CMSLayout>
      {Header}
      <Layout>
        <CMSSidebar collapsible collapsed={collapsed} onCollapse={onCollapse}>
          {Sidebar}
        </CMSSidebar>
        <CMSContent>{Content}</CMSContent>
      </Layout>
    </CMSLayout>
  );
};

const CMSLayout = styled(Layout)`
  min-height: 100vh;
`;

const CMSSidebar = styled(Sider)`
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
  }
`;

const CMSContent = styled(Content)`
  margin: 16px;
`;

export default CMSWrapper;
