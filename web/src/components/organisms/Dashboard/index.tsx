import styled from "@emotion/styled";
import { useAuth } from "@reearth-cms/auth";
import Button from "@reearth-cms/components/atoms/Button";
import MoleculeHeader from "@reearth-cms/components/molecules/Common/Header";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import Layout, { Content, Header } from "antd/lib/layout/layout";
import Sider from "antd/lib/layout/Sider";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import useHooks from "./hooks";

export type Props = {
  workspaceId?: string;
};

const Dashboard: React.FC<Props> = ({ workspaceId }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const { user } = useHooks(workspaceId);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header>
        <MoleculeHeader user={user}></MoleculeHeader>
      </Header>
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          style={{ backgroundColor: "#fff" }}
        >
          <WorkspaceMenu inlineCollapsed={collapsed}></WorkspaceMenu>
        </Sider>
        <PaddedContent>
          <DashboardCard>Welcome to Re:Earth CMS !</DashboardCard>
        </PaddedContent>
      </Layout>
      {/* <h1>Hello {user.name}</h1>
      <Button onClick={() => logout()}>logout</Button>
      <Button onClick={() => navigate("/account")}>Account</Button>
      <Button onClick={() => navigate("/workspaces")}>Workspace list</Button> */}
    </Layout>
  );
};

const PaddedContent = styled(Content)`
  margin: 16px;
  background-color: #fff;
`;

const DashboardCard = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 24px;

  height: 121px;

  background: linear-gradient(
    79.71deg,
    #1e2086 0%,
    #df3013 66.79%,
    #df3013 93.02%
  );
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
  color: #fff;
`;

export default Dashboard;
