import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import Members from "@reearth-cms/components/organisms/Settings/Members";

const MembersPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard
        defaultSelectedKeys={["member"]}
        child={Members}
        sidebar={WorkspaceMenu}
      />
    </AuthenticationRequiredPage>
  );
};

export default MembersPage;
