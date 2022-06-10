import { Provider as Auth0Provider } from "@reearth-cms/auth";
import NotFound from "@reearth-cms/components/atoms/NotFound";
import Account from "@reearth-cms/components/organisms/Settings/Account";
import DashboardPage from "@reearth-cms/components/pages/Dashboard";
import MembersPage from "@reearth-cms/components/pages/Members";
import ProjectPage from "@reearth-cms/components/pages/Project";
import RootPage from "@reearth-cms/components/pages/RootPage";
import WorkspacePage from "@reearth-cms/components/pages/Workspace";
import WorkspaceListPage from "@reearth-cms/components/pages/WorkspaceList";
import { Provider as GqlProvider } from "@reearth-cms/gql";
import { Provider as I18nProvider } from "@reearth-cms/i18n";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";

import "./App.css";
import "antd/dist/antd.css";

function AppRoutes() {
  const routes = useRoutes([
    { path: "/", element: <RootPage /> },
    { path: "/dashboard", element: <DashboardPage /> },
    { path: "/dashboard/:workspaceId", element: <DashboardPage /> },
    { path: "/members/:workspaceId", element: <MembersPage /> },
    { path: "/workspaces/:workspaceId", element: <WorkspacePage /> },
    { path: "/workspaces", element: <WorkspaceListPage /> },
    { path: "/workspaces/:workspaceId/:projectId", element: <ProjectPage /> },
    { path: "/account", element: <Account /> },
    { path: "*", element: <NotFound /> },
  ]);
  return routes;
}

function App() {
  return (
    <Auth0Provider>
      <I18nProvider>
        <GqlProvider>
          <Router>
            <AppRoutes />
          </Router>
        </GqlProvider>
      </I18nProvider>
    </Auth0Provider>
  );
}

export default App;
