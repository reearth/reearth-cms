import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import ProjectSchema from "@reearth-cms/components/organisms/Project/Schema";

const SchemaPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <ProjectSchema />
    </AuthenticationRequiredPage>
  );
};

export default SchemaPage;
