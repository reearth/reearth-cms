import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import AssetList from "@reearth-cms/components/organisms/Asset/AssetList";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";

const AssetListPage: React.FC = () => (
  <AuthenticationRequiredPage>
    <Dashboard defaultSelectedKeys={["assets"]} menuType="project" InnerComponent={AssetList} />
  </AuthenticationRequiredPage>
);

export default AssetListPage;
