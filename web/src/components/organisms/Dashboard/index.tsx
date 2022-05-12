import styled from "@emotion/styled";
import { useAuth } from "@reearth-cms/auth";
import Button from "@reearth-cms/components/atoms/Button";
import { Layout } from "antd";
import { Content, Header } from "antd/lib/layout/layout";
import React from "react";
import { useNavigate } from "react-router-dom";

import useHooks from "./hooks";

export type Props = {
  workspaceId?: string;
};

const Dashboard: React.FC<Props> = ({ workspaceId }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const { user } = useHooks(workspaceId);

  return (
    <Layout>
      <LightHeader>Hello {user.name}</LightHeader>
      <Layout>
        <PaddedContent>
          <PaddedDiv>
            <Button onClick={() => logout()}>logout</Button>
          </PaddedDiv>
          <PaddedDiv>
            <Button onClick={() => navigate("/account")}>Account</Button>
            <Button onClick={() => navigate("/workspace")}>
              Workspace list
            </Button>
          </PaddedDiv>
        </PaddedContent>
      </Layout>
    </Layout>
  );
};

const PaddedDiv = styled.div`
  padding: 24px 0;
`;

const LightHeader = styled(Header)`
  background-color: #add8e6;
  font-weight: 800;
  font-size: 26px;
`;

const PaddedContent = styled(Content)`
  min-height: 280px;
  padding: 24px 50px;
  background: #fff;
`;

export default Dashboard;
