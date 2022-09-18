import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import ContentList from "@reearth-cms/components/organisms/Content/ContentList";

const ContentPage: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <ContentList />
    </AuthenticationRequiredPage>
  );
};

export default ContentPage;
