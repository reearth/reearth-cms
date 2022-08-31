import { ConfigProvider } from "antd";
import enUSIntl from "antd/lib/locale/en_US";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";

import { Provider as Auth0Provider } from "@reearth-cms/auth";
import NotFound from "@reearth-cms/components/atoms/NotFound";
import DashboardPage from "@reearth-cms/components/pages/Dashboard";
import MembersPage from "@reearth-cms/components/pages/Members";
import ProjectPage from "@reearth-cms/components/pages/Project";
import RootPage from "@reearth-cms/components/pages/RootPage";
import { Provider as GqlProvider } from "@reearth-cms/gql";
import { Provider as I18nProvider } from "@reearth-cms/i18n";

import "antd/dist/antd.css";
import SchemaPage from "./components/pages/Schema";

function AppRoutes() {
  const routes = useRoutes([
    { path: "/", element: <RootPage /> },
    { path: "/dashboard", element: <DashboardPage /> },
    { path: "/dashboard/:workspaceId", element: <DashboardPage /> },
    { path: "/workspaces/:workspaceId/:projectId", element: <ProjectPage /> },
    { path: "/workspaces/:workspaceId/members", element: <MembersPage /> },
    { path: "/workspaces/:workspaceId/:projectId/schema", element: <SchemaPage /> },
    { path: "/workspaces/:workspaceId/:projectId/schema/:modelId", element: <SchemaPage /> },
    { path: "*", element: <NotFound /> },
  ]);
  return routes;
}

function App() {
  return (
    <Auth0Provider>
      <I18nProvider>
        <ConfigProvider locale={enUSIntl}>
          <GqlProvider>
            <Router>
              <AppRoutes />
            </Router>
          </GqlProvider>
        </ConfigProvider>
      </I18nProvider>
    </Auth0Provider>
  );
}

export default App;
