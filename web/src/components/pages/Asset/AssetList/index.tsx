import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import AssetList from "@reearth-cms/components/organisms/Asset/AssetList";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";

const AssetListPage: React.FC = () => (
  <AuthenticationRequiredPage>
    <Dashboard defaultSelectedKeys={["assets"]} child={AssetList} sidebar={ProjectMenu} />
  </AuthenticationRequiredPage>
);

export default AssetListPage;
