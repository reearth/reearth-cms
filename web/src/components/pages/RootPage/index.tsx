import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@reearth-cms/auth";
import Loading from "@reearth-cms/components/atoms/Loading";

const RootPage: React.FC = () => {
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

  return isLoading ? <Loading spinnerSize="large" minHeight="100vh" /> : null;
};

export default RootPage;
