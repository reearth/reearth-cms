import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import ProjectSettings from "@reearth-cms/components/organisms/Project/settings";

const ProjectPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <ProjectSettings></ProjectSettings>
    </AuthenticationRequiredPage>
  );
};

export default ProjectPage;
