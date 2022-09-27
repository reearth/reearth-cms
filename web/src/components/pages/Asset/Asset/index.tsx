import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Asset from "@reearth-cms/components/organisms/Asset/Asset";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";

const AssetPage: React.FC = () => (
  <AuthenticationRequiredPage>
    <Dashboard defaultSelectedKeys={["assets"]} menuType="project">
      <Asset />
    </Dashboard>
  </AuthenticationRequiredPage>
);

export default AssetPage;
