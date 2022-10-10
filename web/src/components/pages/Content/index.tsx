import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import ContentList from "@reearth-cms/components/organisms/Project/Content/ContentList";

const ContentPage: React.FC = () => (
  <AuthenticationRequiredPage>
    <Dashboard
      defaultSelectedKeys={["content"]}
      child={ContentList}
      sidebar={ProjectMenu}
    />
  </AuthenticationRequiredPage>
);

export default ContentPage;
