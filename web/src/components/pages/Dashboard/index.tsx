import React from "react";

import { AuthenticationRequiredPage } from "../../../auth";

const DashboardPage: React.FC<{ default?: boolean }> = () => {
  return (
    <AuthenticationRequiredPage>
      <h1>CMS dashboard root</h1>
    </AuthenticationRequiredPage>
  );
};

export default DashboardPage;
