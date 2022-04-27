import NotFound from "@reearth-cms/components/atoms/NotFound";
import RootPage from "@reearth-cms/components/pages/RootPage";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";

import { Provider as Auth0Provider } from "./auth";
import DashboardPage from "./components/pages/Dashboard";
import { Provider as GqlProvider } from "./gql";

import "./App.css";
import "antd/dist/antd.css";

function AppRoutes() {
  const routes = useRoutes([
    { path: "/", element: <RootPage /> },
    { path: "/dashboard", element: <DashboardPage /> },
    { path: "*", element: <NotFound /> },
  ]);
  return routes;
}

function App() {
  return (
    <Auth0Provider>
      <GqlProvider>
        <Router>
          <AppRoutes />
        </Router>
      </GqlProvider>
    </Auth0Provider>
  );
}

export default App;
