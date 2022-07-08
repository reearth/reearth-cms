import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import Members from "@reearth-cms/components/organisms/Settings/Members";

const MembersPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard defaultSelectedKeys={["member"]}>
        <Members />
      </Dashboard>
    </AuthenticationRequiredPage>
  );
};

export default MembersPage;
