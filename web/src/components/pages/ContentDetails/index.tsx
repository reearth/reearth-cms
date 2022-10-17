import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import CMSWrapper from "@reearth-cms/components/organisms/CMSWrapper";
import ContentDetails from "@reearth-cms/components/organisms/Project/Content/ContentDetails";

const ContentDetailsPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <CMSWrapper defaultSelectedKeys={["content"]} child={ContentDetails} sidebar={ProjectMenu} />
    </AuthenticationRequiredPage>
  );
};

export default ContentDetailsPage;
