import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import ContentDetails from "@reearth-cms/components/organisms/Project/Content/ContentDetails";

const ContentDetailsPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard defaultSelectedKeys={["schema"]} menuType="project">
        <ContentDetails />
      </Dashboard>
    </AuthenticationRequiredPage>
  );
};

export default ContentDetailsPage;
