import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@reearth-cms/auth";
import { useT } from "@reearth-cms/i18n";

const RootPage: React.FC = () => {
  const t = useT();
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
    if (!isAuthenticated && !isLoading) {
      login();
    }
  }, [isAuthenticated, navigate, login, isLoading]);

  return isLoading ? <h1>{t("Loading")}</h1> : null;
};

export default RootPage;
