import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import Integration from "@reearth-cms/components/organisms/Settings/Integration";

const IntegrationPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard
        defaultSelectedKeys={["integration"]}
        child={Integration}
        sidebar={WorkspaceMenu}
      />
    </AuthenticationRequiredPage>
  );
};

export default IntegrationPage;
