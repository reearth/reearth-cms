import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import WorkspaceList from "@reearth-cms/components/organisms/Settings/workspaceList";

export type Props = {
  path?: string;
  workspaceId?: string;
};

const WorkspaceListPage: React.FC<Props> = ({ workspaceId = "" }) => (
  <AuthenticationRequiredPage>
    <WorkspaceList workspaceId={workspaceId} />
  </AuthenticationRequiredPage>
);

export default WorkspaceListPage;
