import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import MyIntegrationDetails from "@reearth-cms/components/organisms/Settings/MyIntegrationDetails";

const MyIntegrationDetailsPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard
        defaultSelectedKeys={["my-integration"]}
        child={MyIntegrationDetails}
        sidebar={WorkspaceMenu}
      />
    </AuthenticationRequiredPage>
  );
};

export default MyIntegrationDetailsPage;
