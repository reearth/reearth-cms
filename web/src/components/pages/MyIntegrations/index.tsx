import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import MyIntegrations from "@reearth-cms/components/organisms/Settings/MyIntegrations";

const WorkspacePage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard
        defaultSelectedKeys={["my-integration"]}
        InnerComponent={MyIntegrations}
        Sidebar={WorkspaceMenu}
      />
    </AuthenticationRequiredPage>
  );
};

export default WorkspacePage;
