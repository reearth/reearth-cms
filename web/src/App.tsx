import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { AuthProvider } from "@reearth-cms/auth";
import NotFound from "@reearth-cms/components/atoms/NotFound";
import AccountSettings from "@reearth-cms/components/organisms/Account";
import Asset from "@reearth-cms/components/organisms/Asset/Asset";
import AssetList from "@reearth-cms/components/organisms/Asset/AssetList";
import Accessibility from "@reearth-cms/components/organisms/Project/Accessibility";
import ContentDetails from "@reearth-cms/components/organisms/Project/Content/ContentDetails";
import Content from "@reearth-cms/components/organisms/Project/Content/ContentList";
import ProjectOverview from "@reearth-cms/components/organisms/Project/Overview";
import RequestDetails from "@reearth-cms/components/organisms/Project/Request/RequestDetails";
import RequestList from "@reearth-cms/components/organisms/Project/Request/RequestList";
import Schema from "@reearth-cms/components/organisms/Project/Schema";
import ProjectSettings from "@reearth-cms/components/organisms/Project/settings";
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

function App() {
  return <h1>Hello</h1>;
}

export default App;
