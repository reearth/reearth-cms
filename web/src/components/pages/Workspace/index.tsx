import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import Workspace from "@reearth-cms/components/organisms/Workspace";

const WorkspacePage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard
        defaultSelectedKeys={["home"]}
        InnerComponent={Workspace}
        Sidebar={WorkspaceMenu}
      />
    </AuthenticationRequiredPage>
  );
};

export default WorkspacePage;
