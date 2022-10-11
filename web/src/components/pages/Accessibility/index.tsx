import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";
import Accessibility from "@reearth-cms/components/organisms/Project/Accessibility";

const ContentPage: React.FC = () => (
  <AuthenticationRequiredPage>
    <Dashboard defaultSelectedKeys={["accessibility"]} menuType="project">
      <Accessibility />
    </Dashboard>
  </AuthenticationRequiredPage>
);

export default ContentPage;
