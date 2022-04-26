import { AuthenticationRequiredPage } from "@reearth-cms/auth";
import Typography from "@reearth-cms/components/atoms/Typography";

const DashboardPage: React.FC = () => {
  const { Title } = Typography;
  return (
    <AuthenticationRequiredPage>
      <Title>CMS dashboard root</Title>
    </AuthenticationRequiredPage>
  );
};

export default DashboardPage;
