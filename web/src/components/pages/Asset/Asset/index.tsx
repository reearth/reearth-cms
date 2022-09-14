import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Asset from "@reearth-cms/components/organisms/Asset/Asset";

const AssetPage: React.FC = () => (
  <AuthenticationRequiredPage>
    <Asset />
  </AuthenticationRequiredPage>
);

export default AssetPage;
