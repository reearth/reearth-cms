import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import ProjectSettings from "@reearth-cms/components/organisms/Project/settings";

const ProjectPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard
        defaultSelectedKeys={["home"]}
        menuType="project"
        InnerComponent={ProjectSettings}
      />
    </AuthenticationRequiredPage>
  );
};

export default ProjectPage;
