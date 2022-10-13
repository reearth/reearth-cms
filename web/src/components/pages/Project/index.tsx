import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import CMSWrapper from "@reearth-cms/components/organisms/CMSWrapper";
import ProjectSettings from "@reearth-cms/components/organisms/Project/settings";

const ProjectPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <CMSWrapper defaultSelectedKeys={["home"]} child={ProjectSettings} sidebar={ProjectMenu} />
    </AuthenticationRequiredPage>
  );
};

export default ProjectPage;
