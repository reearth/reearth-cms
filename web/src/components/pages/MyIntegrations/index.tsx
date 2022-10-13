import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import CMSWrapper from "@reearth-cms/components/organisms/CMSWrapper";
import MyIntegrations from "@reearth-cms/components/organisms/Settings/MyIntegrations";

const MyIntegrationsPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <CMSWrapper
        defaultSelectedKeys={["my-integration"]}
        child={MyIntegrations}
        sidebar={WorkspaceMenu}
      />
    </AuthenticationRequiredPage>
  );
};

export default MyIntegrationsPage;
