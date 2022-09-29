import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import MyIntegration from "@reearth-cms/components/organisms/Settings/MyIntegration";

const MyIntegrationPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard defaultSelectedKeys={["my-integration"]}>
        <MyIntegration />
      </Dashboard>
    </AuthenticationRequiredPage>
  );
};

export default MyIntegrationPage;
