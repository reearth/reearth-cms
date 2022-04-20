import React from "react";

import { useAuth } from "../../../../auth";

export type Props = {
  path?: string;
};

const LoginPage: React.FC<Props> = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return isLoading ? (
    <h1>Loading</h1>
  ) : !isAuthenticated ? (
    <h1>Login</h1>
  ) : null;
};

export default LoginPage;
