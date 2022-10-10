import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import Asset from "@reearth-cms/components/organisms/Asset/Asset";
import Dashboard from "@reearth-cms/components/organisms/Dashboard";

const AssetPage: React.FC = () => (
  <AuthenticationRequiredPage>
    <Dashboard defaultSelectedKeys={["asset"]} child={Asset} sidebar={ProjectMenu} />
  </AuthenticationRequiredPage>
);

export default AssetPage;
