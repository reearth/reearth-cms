import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import WorkspaceList from "@reearth-cms/components/organisms/Settings/workspaceList";

export type Props = {
  workspaceId?: string;
};

const WorkspaceListPage: React.FC<Props> = () => (
  <AuthenticationRequiredPage>
    <WorkspaceList />
  </AuthenticationRequiredPage>
);

export default WorkspaceListPage;
