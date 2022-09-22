import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import ProjectSettings from "@reearth-cms/components/organisms/Project/settings";

const ProjectPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard defaultSelectedKeys={["settings"]} menuType="project">
        <ProjectSettings />
      </Dashboard>
    </AuthenticationRequiredPage>
  );
};

export default ProjectPage;
