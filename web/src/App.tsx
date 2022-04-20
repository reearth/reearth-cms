import { BrowserRouter as Router, useRoutes } from "react-router-dom";

import { Provider as Auth0Provider } from "./auth";
import NotFound from "./components/atoms/NotFound";
import DashboardPage from "./components/pages/Dashboard";
import RootPage from "./components/pages/RootPage";
import { Provider as GqlProvider } from "./gql";

import "./App.css";

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
