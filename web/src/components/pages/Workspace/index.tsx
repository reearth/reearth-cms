import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import Workspace from "@reearth-cms/components/organisms/Workspace";

const WorkspacePage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard defaultSelectedKeys={["home"]}>
        <Workspace />
      </Dashboard>
    </AuthenticationRequiredPage>
  );
};

export default WorkspacePage;
