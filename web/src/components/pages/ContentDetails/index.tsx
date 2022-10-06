import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";

const ContentDetailsPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard defaultSelectedKeys={["content"]} menuType="project">
        <h1>Content details organism</h1>
      </Dashboard>
    </AuthenticationRequiredPage>
  );
};

export default ContentDetailsPage;
