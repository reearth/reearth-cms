import React from "react";

import { AuthenticationRequiredPage } from "../../../../auth";

export type Props = {
  path?: string;
};

const RootPage: React.FC<Props> = () => {
  return (
    <AuthenticationRequiredPage>
      <h1>Root page</h1>
    </AuthenticationRequiredPage>
  );
};

export default RootPage;
