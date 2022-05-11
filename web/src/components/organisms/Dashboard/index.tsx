import { useAuth } from "@reearth-cms/auth";
import React from "react";

import useHooks from "./hooks";

export type Props = {
  workspaceId?: string;
};

const Dashboard: React.FC<Props> = ({ workspaceId }) => {
  const { logout } = useAuth();
  console.log("here");

  const {
    user,
    // workspaces = [],
    // currentWorkspace,
    // createWorkspace,
    // changeWorkspace,
  } = useHooks(workspaceId);

  return (
    <>
      <h1>{user.name}</h1>
      <button onClick={() => logout()}>logout</button>
    </>
  );
};

export default Dashboard;
