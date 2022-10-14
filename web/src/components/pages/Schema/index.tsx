import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import CMSWrapper from "@reearth-cms/components/organisms/CMSWrapper";
import ProjectSchema from "@reearth-cms/components/organisms/Project/Schema";

const SchemaPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <CMSWrapper defaultSelectedKeys={["schema"]} child={ProjectSchema} sidebar={ProjectMenu} />
    </AuthenticationRequiredPage>
  );
};

export default SchemaPage;
