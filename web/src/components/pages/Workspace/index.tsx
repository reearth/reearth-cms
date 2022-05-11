import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Workspace from "@reearth-cms/components/organisms/Settings/Workspace";

export type Props = {
  path?: string;
  workspaceId?: string;
};

const WorkspacePage: React.FC<Props> = ({ workspaceId = "" }) => (
  <AuthenticationRequiredPage>
    <Workspace workspaceId={workspaceId} />
  </AuthenticationRequiredPage>
);

export default WorkspacePage;
