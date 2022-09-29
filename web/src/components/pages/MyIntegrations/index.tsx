import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import MyIntegrations from "@reearth-cms/components/organisms/Settings/MyIntegrations";

const MyIntegrationsPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard defaultSelectedKeys={["my-integration"]}>
        <MyIntegrations />
      </Dashboard>
    </AuthenticationRequiredPage>
  );
};

export default MyIntegrationsPage;
