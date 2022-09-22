import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import ProjectList from "@reearth-cms/components/organisms/Project/ProjectList";

const DashboardPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard defaultSelectedKeys={["home"]}>
        <ProjectList />
      </Dashboard>
    </AuthenticationRequiredPage>
  );
};

export default DashboardPage;
