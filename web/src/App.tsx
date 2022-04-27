import NotFound from "@reearth-cms/components/atoms/NotFound";
import RootPage from "@reearth-cms/components/pages/Authentication/RootPage";
import { Provider as GqlProvider } from "@reearth-cms/gql";
import { Provider as I18nProvider } from "@reearth-cms/i18n";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";

import "./App.css";
import "antd/dist/antd.css";

function AppRoutes() {
  const routes = useRoutes([
    { path: "/", element: <RootPage /> },
    { path: "*", element: <NotFound /> },
  ]);
  return routes;
}

function App() {
  return (
    <I18nProvider>
      <GqlProvider>
        <Router>
          <AppRoutes />
        </Router>
      </GqlProvider>
    </I18nProvider>
  );
}

export default App;
