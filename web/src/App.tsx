import { BrowserRouter as Router, useRoutes } from "react-router-dom";

import NotFound from "./components/atoms/NotFound";
import RootPage from "./components/pages/Authentication/RootPage";
import { Provider as GqlProvider } from "./gql";

import "./App.css";

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
