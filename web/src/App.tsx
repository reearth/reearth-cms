import { ConfigProvider } from "antd";
import enUSIntl from "antd/lib/locale/en_US";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { Provider as Auth0Provider } from "@reearth-cms/auth";
import NotFound from "@reearth-cms/components/atoms/NotFound";
import AssetPage from "@reearth-cms/components/pages/Asset/Asset";
import AssetListPage from "@reearth-cms/components/pages/Asset/AssetList";
import ReearthCMS from "@reearth-cms/components/pages/CMSPageWrapper";
import ContentPage from "@reearth-cms/components/pages/Content";
import ContentDetailsPage from "@reearth-cms/components/pages/ContentDetails";
import IntegrationPage from "@reearth-cms/components/pages/Integration";
import MembersPage from "@reearth-cms/components/pages/Members";
import MyIntegrationDetailsPage from "@reearth-cms/components/pages/MyIntegrationDetails";
import MyIntegrationsPage from "@reearth-cms/components/pages/MyIntegrations";
import ProjectSettingsPage from "@reearth-cms/components/pages/ProjectSettings";
import RootPage from "@reearth-cms/components/pages/RootPage";
import SchemaPage from "@reearth-cms/components/pages/Schema";
import WorkspacePage from "@reearth-cms/components/pages/Workspace";
import { Provider as GqlProvider } from "@reearth-cms/gql";
import { Provider as I18nProvider } from "@reearth-cms/i18n";

import "antd/dist/antd.css";

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
                  <Route path=":workspaceId/members" element={<MembersPage />} />
                  <Route path=":workspaceId/myIntegrations" element={<MyIntegrationsPage />} />
                  <Route
                    path=":workspaceId/myIntegrations/:integrationId"
                    element={<MyIntegrationDetailsPage />}
                  />
                  <Route path=":workspaceId/integration" element={<IntegrationPage />} />
                  <Route
                    path=":workspaceId/project/:projectId"
                    element={<div>Project overview - GOTTA DO THIS PAGE!!!!</div>}
                  />
                  <Route path=":workspaceId/project/:projectId/schema" element={<SchemaPage />} />
                  <Route
                    path=":workspaceId/project/:projectId/schema/:modelId"
                    element={<SchemaPage />}
                  />
                  <Route path=":workspaceId/project/:projectId/content" element={<ContentPage />} />
                  <Route
                    path=":workspaceId/project/:projectId/settings"
                    element={<ProjectSettingsPage />}
                  />
                  <Route
                    path=":workspaceId/project/:projectId/content/:modelId"
                    element={<ContentPage />}
                  />
                  <Route
                    path=":workspaceId/project/:projectId/content/:modelId/details"
                    element={<ContentDetailsPage />}
                  />
                  <Route
                    path=":workspaceId/project/:projectId/content/:modelId/details/:itemId"
                    element={<ContentDetailsPage />}
                  />
                  <Route path=":workspaceId/project/:projectId/asset" element={<AssetListPage />} />
                  <Route
                    path=":workspaceId/project/:projectId/asset/:assetId"
                    element={<AssetPage />}
                  />
                  <Route
                    path=":workspaceId/project/:projectId/request"
                    element={<div>Request page - GOTTA DO THIS PAGE!!!!</div>}
                  />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </GqlProvider>
        </ConfigProvider>
      </I18nProvider>
    </Auth0Provider>
  );
}

export default App;
