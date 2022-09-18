import { ConfigProvider } from "antd";
import enUSIntl from "antd/lib/locale/en_US";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";

import { Provider as Auth0Provider } from "@reearth-cms/auth";
import NotFound from "@reearth-cms/components/atoms/NotFound";
import AssetPage from "@reearth-cms/components/pages/Asset/Asset";
import AssetListPage from "@reearth-cms/components/pages/Asset/AssetList";
import ContentPage from "@reearth-cms/components/pages/Content";
import DashboardPage from "@reearth-cms/components/pages/Dashboard";
import MembersPage from "@reearth-cms/components/pages/Members";
import ProjectPage from "@reearth-cms/components/pages/Project";
import RootPage from "@reearth-cms/components/pages/RootPage";
import SchemaPage from "@reearth-cms/components/pages/Schema";
import { Provider as GqlProvider } from "@reearth-cms/gql";
import { Provider as I18nProvider } from "@reearth-cms/i18n";

import "antd/dist/antd.css";

function AppRoutes() {
  const routes = useRoutes([
    { path: "/", element: <RootPage /> },
    { path: "/dashboard", element: <DashboardPage /> },
    { path: "/dashboard/:workspaceId", element: <DashboardPage /> },
    { path: "/workspaces/:workspaceId/:projectId", element: <ProjectPage /> },
    { path: "/workspaces/:workspaceId/:projectId/content", element: <ContentPage /> },
    { path: "/workspaces/:workspaceId/:projectId/content/:modelId", element: <ContentPage /> },
    {
      path: "/workspaces/:workspaceId/:projectId/asset",
      element: <AssetListPage />,
    },
    {
      path: "/workspaces/:workspaceId/:projectId/asset/:assetId",
      element: <AssetPage />,
    },
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
