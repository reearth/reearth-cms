import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import Integration from "@reearth-cms/components/organisms/Settings/Integration";

const WorkspacePage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard
        defaultSelectedKeys={["integration"]}
        InnerComponent={Integration}
        Sidebar={WorkspaceMenu}
      />
    </AuthenticationRequiredPage>
  );
};

export default WorkspacePage;
