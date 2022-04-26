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
  }, [isAuthenticated, navigate]);

  return isLoading ? (
    <h1>Loading</h1>
  ) : !isAuthenticated ? (
    <div style={{ margin: "40px" }}>
      <button onClick={() => login()}>Log In</button>
    </div>
  ) : null;
};

export default RootPage;
