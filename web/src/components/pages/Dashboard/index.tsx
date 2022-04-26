import Typography from "@reearth-cms/components/atoms/Typography";
import React from "react";

import { AuthenticationRequiredPage } from "../../../auth";

const DashboardPage: React.FC<{ default?: boolean }> = () => {
  const { Title } = Typography;
  return (
    <AuthenticationRequiredPage>
      <Title>CMS dashboard root</Title>
    </AuthenticationRequiredPage>
  );
};

export default DashboardPage;
