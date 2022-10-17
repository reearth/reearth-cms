import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import CMSWrapper from "@reearth-cms/components/organisms/CMSWrapper";

export type Props = {
  defaultSelectedKeys?: string[];
};

const SharedWrapper: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <CMSWrapper />
    </AuthenticationRequiredPage>
  );
};

export default SharedWrapper;
