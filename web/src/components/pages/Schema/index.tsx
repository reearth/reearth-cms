import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import ProjectSchema from "@reearth-cms/components/organisms/Project/Schema";

const SchemaPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard
        defaultSelectedKeys={["schema"]}
        child={ProjectSchema}
        sidebar={ProjectMenu}
      />
    </AuthenticationRequiredPage>
  );
};

export default SchemaPage;
