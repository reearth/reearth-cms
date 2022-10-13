import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import CMSWrapper from "@reearth-cms/components/organisms/CMSWrapper";
import Integration from "@reearth-cms/components/organisms/Settings/Integration";

const IntegrationPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <CMSWrapper
        defaultSelectedKeys={["integration"]}
        child={Integration}
        sidebar={WorkspaceMenu}
      />
    </AuthenticationRequiredPage>
  );
};

export default IntegrationPage;
