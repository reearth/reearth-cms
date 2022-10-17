import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import CMSWrapperOrganism from "@reearth-cms/components/organisms/CMSWrapper";

export type Props = {
  defaultSelectedKeys?: string[];
};

const CMSWrapper: React.FC = () => {
  return (
    <AuthenticationRequiredPage>
      <CMSWrapperOrganism />
    </AuthenticationRequiredPage>
  );
};

export default CMSWrapper;
