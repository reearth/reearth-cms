import { AuthenticationRequiredPage } from "@reearth-cms/auth";

const ProjectPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <h1>Project page</h1>
    </AuthenticationRequiredPage>
  );
};

export default ProjectPage;
