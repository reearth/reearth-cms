import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Workspace from "@reearth-cms/components/organisms/Settings/Workspace";

const WorkspacePage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Workspace />
    </AuthenticationRequiredPage>
  );
};

export default WorkspacePage;
