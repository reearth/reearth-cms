import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import CMSWrapper from "@reearth-cms/components/organisms/CMSWrapper";
import Members from "@reearth-cms/components/organisms/Settings/Members";

const MembersPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <CMSWrapper defaultSelectedKeys={["member"]} child={Members} sidebar={WorkspaceMenu} />
    </AuthenticationRequiredPage>
  );
};

export default MembersPage;
