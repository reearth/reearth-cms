import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../auth";

const RootPage: React.FC<{ default?: boolean }> = () => {
  const { isAuthenticated, error, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return isLoading ? (
    <h1>Loading</h1>
  ) : !isAuthenticated ? (
    <>
      {error && <h1>Error</h1>}
      <div style={{ margin: "40px" }}>
        <button onClick={() => login()}>Log In</button>
      </div>
    </>
  ) : null;
};

export default RootPage;
