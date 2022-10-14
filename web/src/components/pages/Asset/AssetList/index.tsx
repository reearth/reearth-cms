import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import AssetList from "@reearth-cms/components/organisms/Asset/AssetList";
import CMSWrapper from "@reearth-cms/components/organisms/CMSWrapper";

const AssetListPage: React.FC = () => (
  <AuthenticationRequiredPage>
    <CMSWrapper defaultSelectedKeys={["assets"]} child={AssetList} sidebar={ProjectMenu} />
  </AuthenticationRequiredPage>
);

export default AssetListPage;
