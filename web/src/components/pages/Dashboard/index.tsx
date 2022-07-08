import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import Project from "@reearth-cms/components/organisms/Project";

const DashboardPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard defaultSelectedKeys={["home"]}>
        <Project />
      </Dashboard>
    </AuthenticationRequiredPage>
  );
};

export default DashboardPage;
