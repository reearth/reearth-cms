import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import Integration from "@reearth-cms/components/organisms/Settings/Integration";

const IntegrationPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard defaultSelectedKeys={["integration"]}>
        <Integration />
      </Dashboard>
    </AuthenticationRequiredPage>
  );
};

export default IntegrationPage;
