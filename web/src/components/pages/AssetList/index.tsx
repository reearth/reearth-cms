import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import AssetList from "@reearth-cms/components/organisms/AssetList";

const AssetListPage: React.FC = () => (
  <AuthenticationRequiredPage>
    <AssetList />
  </AuthenticationRequiredPage>
);

export default AssetListPage;
