import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import ContentDetails from "@reearth-cms/components/organisms/Project/Content/ContentDetails";

const ContentDetailsPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard defaultSelectedKeys={["content"]} child={ContentDetails} sidebar={ProjectMenu} />
    </AuthenticationRequiredPage>
  );
};

export default ContentDetailsPage;
