import styled from "@emotion/styled";

import Content from "@reearth-cms/components/atoms/Content";
import Header from "@reearth-cms/components/atoms/Header";
import Layout from "@reearth-cms/components/atoms/Layout";
import Sider from "@reearth-cms/components/atoms/Sider";

export type InnerProps = {
  onWorkspaceModalOpen?: () => void;
};

export type Props = {
  header: React.ReactNode;
  child: React.ReactNode;
  sidebar: React.ReactNode;
  collapsed: boolean;
  onCollapse: (collapse: boolean) => void;
};

const DashboardMolecule: React.FC<Props> = ({
  child: Child,
  sidebar: Sidebar,
  header: Header,
  collapsed,
  onCollapse,
}) => {
  return (
    <DashboardLayout>
      <MainHeader>{Header}</MainHeader>
      <Layout>
        <DashboardSider collapsible collapsed={collapsed} onCollapse={onCollapse}>
          {Sidebar}
        </DashboardSider>
        <PaddedContent>{Child}</PaddedContent>
      </Layout>
    </DashboardLayout>
  );
};

const MainHeader = styled(Header)`
  display: flex;
  align-items: center;
  height: 48px;
  line-height: 48px;
`;

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
