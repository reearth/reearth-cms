import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Workspace from "@reearth-cms/components/organisms/Settings/Workspace";

export type Props = {
  path?: string;
};

const WorkspacePage: React.FC<Props> = () => {
  return (
    <AuthenticationRequiredPage>
      <Workspace />
    </AuthenticationRequiredPage>
  );
};

export default WorkspacePage;
