import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import CMSWrapper from "@reearth-cms/components/organisms/CMSWrapper";
import MyIntegrationDetails from "@reearth-cms/components/organisms/Settings/MyIntegrationDetails";

const MyIntegrationDetailsPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <CMSWrapper
        defaultSelectedKeys={["my-integration"]}
        child={MyIntegrationDetails}
        sidebar={WorkspaceMenu}
      />
    </AuthenticationRequiredPage>
  );
};

export default MyIntegrationDetailsPage;
