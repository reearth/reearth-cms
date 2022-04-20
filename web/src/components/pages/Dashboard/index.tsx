import React from "react";

import { AuthenticationRequiredPage } from "../../../auth";

const DashboardPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <h1>Dashboard</h1>
    </AuthenticationRequiredPage>
  );
};

export default DashboardPage;
