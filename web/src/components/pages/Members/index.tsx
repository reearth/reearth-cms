import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Members from "@reearth-cms/components/organisms/Settings/Members";

const MembersPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Members />
    </AuthenticationRequiredPage>
  );
};

export default MembersPage;
