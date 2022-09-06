import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";

const IntegrationPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard defaultSelectedKeys={["integration"]}></Dashboard>
    </AuthenticationRequiredPage>
  );
};

export default IntegrationPage;
