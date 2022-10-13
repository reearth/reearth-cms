import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import CMSWrapper from "@reearth-cms/components/organisms/CMSWrapper";
import Workspace from "@reearth-cms/components/organisms/Workspace";

const WorkspacePage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <CMSWrapper defaultSelectedKeys={["workspace"]} child={Workspace} sidebar={WorkspaceMenu} />
    </AuthenticationRequiredPage>
  );
};

export default WorkspacePage;
