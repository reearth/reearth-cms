import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { Route, createBrowserRouter, createRoutesFromElements } from "react-router";
import { RouterProvider } from "react-router/dom";

import { AuthProvider } from "@reearth-cms/auth";
import NotFound from "@reearth-cms/components/atoms/NotFound";
import AccountSettings from "@reearth-cms/components/organisms/Account";
import Accessibility from "@reearth-cms/components/organisms/Project/Accessibility/Accessibility";
import APIKeyDetails from "@reearth-cms/components/organisms/Project/Accessibility/APIKeyDetails";
import Asset from "@reearth-cms/components/organisms/Project/Asset/Asset";
import AssetList from "@reearth-cms/components/organisms/Project/Asset/AssetList";
import ContentDetails from "@reearth-cms/components/organisms/Project/Content/ContentDetails";
import Content from "@reearth-cms/components/organisms/Project/Content/ContentList";
import License from "@reearth-cms/components/organisms/Project/License";
import ProjectOverview from "@reearth-cms/components/organisms/Project/Overview";
import Readme from "@reearth-cms/components/organisms/Project/Readme";
import RequestDetails from "@reearth-cms/components/organisms/Project/Request/RequestDetails";
import RequestList from "@reearth-cms/components/organisms/Project/Request/RequestList";
import Schema from "@reearth-cms/components/organisms/Project/Schema";
import ProjectSettings from "@reearth-cms/components/organisms/Project/settings";
import Settings from "@reearth-cms/components/organisms/Settings/General";
import Integration from "@reearth-cms/components/organisms/Settings/Integration";
import Members from "@reearth-cms/components/organisms/Settings/Members";
import MyIntegrationDetails from "@reearth-cms/components/organisms/Settings/MyIntegrationDetails";
import MyIntegrations from "@reearth-cms/components/organisms/Settings/MyIntegrations";
import Workspace from "@reearth-cms/components/organisms/Workspace";
import WorkspaceSettings from "@reearth-cms/components/organisms/Workspace/Settings";
import CMSPageWrapper from "@reearth-cms/components/pages/CMSPage";
import RootPage from "@reearth-cms/components/pages/RootPage";
import { Provider as GqlProvider } from "@reearth-cms/gql";
import { Provider as I18nProvider } from "@reearth-cms/i18n";

dayjs.extend(relativeTime);
dayjs.extend(utc);

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route index element={<RootPage />} />
      <Route path="auth" element={<RootPage />}>
        <Route path="*" element={<RootPage />} />
      </Route>
      <Route path="workspace" element={<CMSPageWrapper />}>
        <Route index element={<Workspace />} />
        <Route path=":workspaceId" element={<Workspace />} />
        <Route path=":workspaceId/account" element={<AccountSettings />} />
        <Route path=":workspaceId/members" element={<Members />} />
        <Route path=":workspaceId/myIntegrations" element={<MyIntegrations />} />
        <Route
          path=":workspaceId/myIntegrations/:integrationId"
          element={<MyIntegrationDetails />}
        />
        <Route path=":workspaceId/integrations" element={<Integration />} />
        <Route path=":workspaceId/settings" element={<Settings />} />
        <Route path=":workspaceId/workspaceSettings" element={<WorkspaceSettings />} />
        <Route path=":workspaceId/project/:projectId" element={<ProjectOverview />} />
        <Route path=":workspaceId/project/:projectId/schema" element={<Schema />} />
        <Route path=":workspaceId/project/:projectId/schema/:modelId" element={<Schema />} />
        <Route path=":workspaceId/project/:projectId/accessibility" element={<Accessibility />} />
        <Route
          path=":workspaceId/project/:projectId/accessibility/:keyId"
          element={<APIKeyDetails />}
        />
        <Route path=":workspaceId/project/:projectId/readme" element={<Readme />} />
        <Route path=":workspaceId/project/:projectId/license" element={<License />} />
        <Route path=":workspaceId/project/:projectId/settings" element={<ProjectSettings />} />
        <Route path=":workspaceId/project/:projectId/content" element={<Content />} />
        <Route path=":workspaceId/project/:projectId/content/:modelId" element={<Content />} />
        <Route
          path=":workspaceId/project/:projectId/content/:modelId/details"
          element={<ContentDetails />}
        />
        <Route
          path=":workspaceId/project/:projectId/content/:modelId/details/:itemId"
          element={<ContentDetails />}
        />
        <Route path=":workspaceId/project/:projectId/asset" element={<AssetList />} />
        <Route path=":workspaceId/project/:projectId/asset/:assetId" element={<Asset />} />
        <Route path=":workspaceId/project/:projectId/request" element={<RequestList />} />
        <Route
          path=":workspaceId/project/:projectId/request/:requestId"
          element={<RequestDetails />}
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </>,
  ),
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
);

function App() {
  return (
    <AuthProvider>
      <GqlProvider>
        <I18nProvider>
          <RouterProvider router={router} />
        </I18nProvider>
      </GqlProvider>
    </AuthProvider>
  );
}

export default App;
