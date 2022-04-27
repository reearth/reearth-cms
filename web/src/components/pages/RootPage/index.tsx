import { useAuth } from "@reearth-cms/auth";
import Typography from "@reearth-cms/components/atoms/Typography";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const RootPage: React.FC = () => {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { Title } = Typography;

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return isLoading ? (
    <h1>Loading</h1>
  ) : !isAuthenticated ? (
    <div style={{ margin: "40px" }}>
      <Title>{t("CMS root page")}</Title>
      <button onClick={() => login()}>Log In</button>
    </div>
  ) : null;
};

export default RootPage;
