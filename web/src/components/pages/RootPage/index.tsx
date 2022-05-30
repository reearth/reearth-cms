import { useAuth } from "@reearth-cms/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RootPage: React.FC = () => {
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

  return isLoading ? <h1>Loading</h1> : null;
};

export default RootPage;
