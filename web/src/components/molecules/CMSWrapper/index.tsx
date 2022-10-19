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
        <CMSSidebar collapsible collapsed={collapsed} onCollapse={onCollapse} collapsedWidth={54}>
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
    border-top: 1px solid #f0f0f0;
    color: #002140;
    text-align: left;
    padding: 0 20px;
    margin: 0;
    height: 38px;
    line-height: 38px;
  }
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .ant-menu-inline {
    border-right: 1px solid white;
  }
  .ant-menu-vertical {
    border-right: none;
  }
`;

const CMSContent = styled(Content)`
  margin: 16px;
`;

export default CMSWrapper;
