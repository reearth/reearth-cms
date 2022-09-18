import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import ProjectSchema from "@reearth-cms/components/organisms/Project/Schema";

const ContentPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <ProjectSchema />
    </AuthenticationRequiredPage>
  );
};

export default ContentPage;
