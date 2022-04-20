import React from "react";

import { useAuth } from "../../../../auth";

export type Props = {
  path?: string;
};

const RootPage: React.FC<Props> = () => {
  const { isLoading, isAuthenticated } = useAuth();
  return isLoading ? (
    <h1>Loading</h1>
  ) : !isAuthenticated ? (
    <h1>CMS root page</h1>
  ) : null;
};

export default RootPage;
