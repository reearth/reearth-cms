import NotFound from "@reearth-cms/components/atoms/NotFound";
import RootPage from "@reearth-cms/components/pages/Authentication/RootPage";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";

import { Provider as GqlProvider } from "./gql";

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
    <GqlProvider>
      <Router>
        <AppRoutes />
      </Router>
    </GqlProvider>
  );
}

export default App;
