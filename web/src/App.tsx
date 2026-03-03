import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { AuthProvider } from "@reearth-cms/auth";
import NotFound from "@reearth-cms/components/atoms/NotFound";
import AccountSettings from "@reearth-cms/components/organisms/Account";
import Accessibility from "@reearth-cms/components/organisms/Project/Accessibility/Accessibility";
import AccessibilityDocs from "@reearth-cms/components/organisms/Project/Accessibility/AccessibilityDocs";
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

import { UploaderProvider } from "./components/molecules/Uploader/provider";

dayjs.extend(relativeTime);
dayjs.extend(utc);

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<RootPage />} index />
      <Route element={<RootPage />} path="auth/*" />
      <Route element={<CMSPageWrapper />} path="workspace">
        <Route element={<Workspace />} index />
        <Route element={<Workspace />} path=":workspaceId" />
        <Route element={<AccountSettings />} path=":workspaceId/account" />
        <Route element={<Members />} path=":workspaceId/members" />
        <Route element={<MyIntegrations />} path=":workspaceId/myIntegrations" />
        <Route
          element={<MyIntegrationDetails />}
          path=":workspaceId/myIntegrations/:integrationId"
        />
        <Route element={<Integration />} path=":workspaceId/integrations" />
        <Route element={<Settings />} path=":workspaceId/settings" />
        <Route element={<WorkspaceSettings />} path=":workspaceId/workspaceSettings" />
        <Route element={<ProjectOverview />} path=":workspaceId/project/:projectId" />
        <Route element={<Schema />} path=":workspaceId/project/:projectId/schema" />
        <Route element={<Schema />} path=":workspaceId/project/:projectId/schema/:modelId" />
        <Route element={<Accessibility />} path=":workspaceId/project/:projectId/accessibility" />
        <Route
          element={<APIKeyDetails />}
          path=":workspaceId/project/:projectId/accessibility/:keyId"
        />
        <Route
          element={<AccessibilityDocs />}
          path=":workspaceId/project/:projectId/accessibility/docs"
        />
        <Route element={<Readme />} path=":workspaceId/project/:projectId/readme" />
        <Route element={<License />} path=":workspaceId/project/:projectId/license" />
        <Route element={<ProjectSettings />} path=":workspaceId/project/:projectId/settings" />
        <Route element={<Content />} path=":workspaceId/project/:projectId/content" />
        <Route element={<Content />} path=":workspaceId/project/:projectId/content/:modelId" />
        <Route
          element={<ContentDetails />}
          path=":workspaceId/project/:projectId/content/:modelId/details"
        />
        <Route
          element={<ContentDetails />}
          path=":workspaceId/project/:projectId/content/:modelId/details/:itemId"
        />
        <Route element={<AssetList />} path=":workspaceId/project/:projectId/asset" />
        <Route element={<Asset />} path=":workspaceId/project/:projectId/asset/:assetId" />
        <Route element={<RequestList />} path=":workspaceId/project/:projectId/request" />
        <Route
          element={<RequestDetails />}
          path=":workspaceId/project/:projectId/request/:requestId"
        />
      </Route>
      <Route element={<NotFound />} path="*" />
    </>,
  ),
);

function App() {
  return (
    <AuthProvider>
      <GqlProvider>
        <I18nProvider>
          <UploaderProvider>
            <RouterProvider router={router} />
          </UploaderProvider>
        </I18nProvider>
      </GqlProvider>
    </AuthProvider>
  );
}

export default App;
