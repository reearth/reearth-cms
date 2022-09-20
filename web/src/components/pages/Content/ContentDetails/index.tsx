import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import ContentDetails from "@reearth-cms/components/organisms/Project/Content/ContentDetails";

const ContentDetailsPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <ContentDetails />
    </AuthenticationRequiredPage>
  );
};

export default ContentDetailsPage;
