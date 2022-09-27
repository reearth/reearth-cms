import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import ProjectSchema from "@reearth-cms/components/organisms/Project/Schema";

const SchemaPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard
        defaultSelectedKeys={["schema"]}
        menuType="project"
        InnerComponent={ProjectSchema}
      />
    </AuthenticationRequiredPage>
  );
};

export default SchemaPage;
