import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../auth";

const RootPage: React.FC<{ default?: boolean }> = () => {
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
    <>
      <div style={{ margin: "40px" }}>
        <button onClick={() => login()}>Log In</button>
      </div>
    </>
  ) : null;
};

export default RootPage;
