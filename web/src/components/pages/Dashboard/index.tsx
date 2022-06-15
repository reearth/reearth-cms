import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";

const DashboardPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard />
    </AuthenticationRequiredPage>
  );
};

export default DashboardPage;
