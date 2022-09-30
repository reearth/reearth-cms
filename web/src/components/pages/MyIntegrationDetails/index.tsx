import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import MyIntegrationDetails from "@reearth-cms/components/organisms/Settings/MyIntegrationDetails";

const MyIntegrationDetailsPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard defaultSelectedKeys={["my-integration"]}>
        <MyIntegrationDetails />
      </Dashboard>
    </AuthenticationRequiredPage>
  );
};

export default MyIntegrationDetailsPage;
