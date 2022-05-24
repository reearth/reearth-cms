import { useAuth } from "@reearth-cms/auth";
import Button from "@reearth-cms/components/atoms/Button";
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
    <>
      <h1>Hello {user.name}</h1>
      <Button onClick={() => logout()}>logout</Button>
      <Button onClick={() => navigate("/account")}>Account</Button>
      <Button onClick={() => navigate("/workspace")}>Workspace list</Button>
    </>
  );
};

export default Dashboard;
