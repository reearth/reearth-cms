import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import Asset from "@reearth-cms/components/organisms/Asset/Asset";
import CMSWrapper from "@reearth-cms/components/organisms/CMSWrapper";

const AssetPage: React.FC = () => (
  <AuthenticationRequiredPage>
    <CMSWrapper defaultSelectedKeys={["asset"]} child={Asset} sidebar={ProjectMenu} />
  </AuthenticationRequiredPage>
);

export default AssetPage;
