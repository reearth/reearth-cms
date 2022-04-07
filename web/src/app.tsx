import styled from "@emotion/styled";
import { Router } from "@reach/router";
import React from "react";
import { IntlProvider } from "react-intl";

import NotFound from "@reearth/components/pages/NotFound";

import RootPage from "./components/pages/Authentication/RootPage";

const App: React.FC = () => {
  return (
    <IntlProvider locale="en" defaultLocale="en">
      <StyledRouter>
        <RootPage path="/" />
        <NotFound default />
      </StyledRouter>
    </IntlProvider>
  );
};

const StyledRouter = styled(Router)`
  height: 100%;
`;

export default App;
