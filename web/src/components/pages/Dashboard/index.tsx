import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";

export type Props = {
  workspaceId?: string;
};

const DashboardPage: React.FC<Props> = ({ workspaceId }) => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard workspaceId={workspaceId} />
    </AuthenticationRequiredPage>
  );
};

export default DashboardPage;
