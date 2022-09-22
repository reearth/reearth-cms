import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import ContentList from "@reearth-cms/components/organisms/Project/Content/ContentList";

const ContentPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard defaultSelectedKeys={["schema"]} menuType="project">
        <ContentList />
      </Dashboard>
    </AuthenticationRequiredPage>
  );
};

export default ContentPage;
