import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import ProjectSettings from "@reearth-cms/components/organisms/Project/settings";

const ProjectPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard
        defaultSelectedKeys={["home"]}
        InnerComponent={ProjectSettings}
        Sidebar={ProjectMenu}
      />
    </AuthenticationRequiredPage>
  );
};

export default ProjectPage;
