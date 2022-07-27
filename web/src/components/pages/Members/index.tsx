import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import Members from "@reearth-cms/components/organisms/Settings/Members";

const MembersPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard
        defaultSelectedKeys={["member"]}
        sideMenu={
          <WorkspaceMenu
            defaultSelectedKeys={["member"]}
            isPersonalWorkspace={false}
            inlineCollapsed={false}
          ></WorkspaceMenu>
        }
      >
        <Members />
      </Dashboard>
    </AuthenticationRequiredPage>
  );
};

export default MembersPage;
