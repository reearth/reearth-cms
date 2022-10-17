import { ConfigProvider } from "antd";
import enUSIntl from "antd/lib/locale/en_US";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { Provider as Auth0Provider } from "@reearth-cms/auth";
// import NotFound from "@reearth-cms/components/atoms/NotFound";
// import AssetPage from "@reearth-cms/components/pages/Asset/Asset";
// import AssetListPage from "@reearth-cms/components/pages/Asset/AssetList";
import ContentPage from "@reearth-cms/components/pages/Content";
// import ContentDetailsPage from "@reearth-cms/components/pages/ContentDetails";
// import IntegrationPage from "@reearth-cms/components/pages/Integration";
// import MembersPage from "@reearth-cms/components/pages/Members";
// import MyIntegrationDetailsPage from "@reearth-cms/components/pages/MyIntegrationDetails";
// import MyIntegrationsPage from "@reearth-cms/components/pages/MyIntegrations";
import ProjectPage from "@reearth-cms/components/pages/Project";
// import ProjectSettings from "@reearth-cms/components/organisms/Project/settings";
import RootPage from "@reearth-cms/components/pages/RootPage";
// import SchemaPage from "@reearth-cms/components/pages/Schema";
import ReearthCMS from "@reearth-cms/components/pages/SharedPageWrapper";
import WorkspacePage from "@reearth-cms/components/pages/Workspace";
import { Provider as GqlProvider } from "@reearth-cms/gql";
import { Provider as I18nProvider } from "@reearth-cms/i18n";

import "antd/dist/antd.css";

// function AppRoutes() {
//   const routes = useRoutes([
//     { path: "/workspace/:workspaceId/:projectId/content", element: <ContentPage /> },
//     { path: "/workspace/:workspaceId/:projectId/content/:modelId", element: <ContentPage /> },
//     {
//       path: "/workspace/:workspaceId/:projectId/content/:modelId/details",
//       element: <ContentDetailsPage />,
//     },
//     {
//       path: "/workspace/:workspaceId/:projectId/content/:modelId/details/:itemId",
//       element: <ContentDetailsPage />,
//     },
//     {
//       path: "/workspace/:workspaceId/:projectId/asset",
//       element: <AssetListPage />,
//     },
//     {
//       path: "/workspace/:workspaceId/:projectId/asset/:assetId",
//       element: <AssetPage />,
//     },
//     { path: "/workspace/:workspaceId/members", element: <MembersPage /> },
//     { path: "/workspace/:workspaceId/myIntegrations", element: <MyIntegrationsPage /> },
//     {
//       path: "/workspace/:workspaceId/myIntegrations/:integrationId",
//       element: <MyIntegrationDetailsPage />,
//     },
//     {
//       path: "/workspace/:workspaceId/myIntegrations/:integrationId/:tab",
//       element: <MyIntegrationDetailsPage />,
//     },
//     {
//       path: "/workspace/:workspaceId/myIntegrations/:integrationId/:tab/form",
//       element: <MyIntegrationDetailsPage />,
//     },
//     {
//       path: "/workspace/:workspaceId/myIntegrations/:integrationId/:tab/form/:webhookId",
//       element: <MyIntegrationDetailsPage />,
//     },
//     { path: "/workspace/:workspaceId/integration", element: <IntegrationPage /> },
//     { path: "/workspace/:workspaceId/:projectId/schema", element: <SchemaPage /> },
//     { path: "/workspace/:workspaceId/:projectId/schema/:modelId", element: <SchemaPage /> },
//     { path: "*", element: <NotFound /> },
//   ]);
//   return routes;
// }

function App() {
  return (
    <Auth0Provider>
      <I18nProvider>
        <ConfigProvider locale={enUSIntl}>
          <GqlProvider>
            <Router>
              <Routes>
                <Route path="/" element={<RootPage />} />
                <Route path="workspace" element={<ReearthCMS />}>
                  <Route path=":workspaceId" element={<WorkspacePage />} />
                  <Route
                    path=":workspaceId/project/:projectId"
                    element={<div>Project overview</div>}
                  />
                  <Route path=":workspaceId/project/:projectId/content" element={<ContentPage />} />
                  <Route
                    path=":workspaceId/project/:projectId/settings"
                    element={<ProjectPage />}
                  />
                </Route>
              </Routes>
            </Router>
          </GqlProvider>
        </ConfigProvider>
      </I18nProvider>
    </Auth0Provider>
  );
}

export default App;
