import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import CMSWrapper from "@reearth-cms/components/organisms/CMSWrapper";
import ContentList from "@reearth-cms/components/organisms/Project/Content/ContentList";

const ContentPage: React.FC = () => (
  <AuthenticationRequiredPage>
    <CMSWrapper defaultSelectedKeys={["content"]} child={ContentList} sidebar={ProjectMenu} />
  </AuthenticationRequiredPage>
);

export default ContentPage;
