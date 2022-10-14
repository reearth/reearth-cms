import styled from "@emotion/styled";

import Content from "@reearth-cms/components/atoms/Content";
import Header from "@reearth-cms/components/atoms/Header";
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

const DashboardMolecule: React.FC<Props> = ({
  contentComponent: Child,
  sidebarComponent: Sidebar,
  headerComponent: Header,
  collapsed,
  onCollapse,
}) => {
  return (
    <DashboardLayout>
      {Header}
      <Layout>
        <DashboardSider collapsible collapsed={collapsed} onCollapse={onCollapse}>
          {Sidebar}
        </DashboardSider>
        <PaddedContent>{Child}</PaddedContent>
      </Layout>
    </DashboardLayout>
  );
};

const DashboardLayout = styled(Layout)`
  min-height: 100vh;
`;

const DashboardSider = styled(Sider)`
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

const PaddedContent = styled(Content)`
  margin: 16px;
`;

export default DashboardMolecule;
