import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@reearth-cms/auth";
import Row from "@reearth-cms/components/atoms/Row";
import Spin from "@reearth-cms/components/atoms/Spin";
import { useT } from "@reearth-cms/i18n";

const RootPage: React.FC = () => {
  const t = useT();
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("workspace");
    }
    if (!isAuthenticated && !isLoading) {
      login();
    }
  }, [isAuthenticated, navigate, login, isLoading]);

  return isLoading ? (
    <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
      <Spin tip={t("Loading")} size="large" />
    </Row>
  ) : null;
};

export default RootPage;
