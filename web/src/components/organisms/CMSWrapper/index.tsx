import { useCallback, useMemo, useState } from "react";
import { useParams, useLocation, Outlet } from "react-router-dom";

import MoleculeHeader from "@reearth-cms/components/molecules/Common/Header";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import DashboardMolecule from "@reearth-cms/components/molecules/Dashboard";

import useHooks from "./hooks";

const CMSWrapper: React.FC = () => {
  const { projectId, workspaceId } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  const [secondaryRoute, subRoute] = useMemo(() => {
    const splitPathname = pathname.split("/");
    const secondaryRoute = splitPathname[3];
    const subRoute = secondaryRoute === "project" ? splitPathname[5] : secondaryRoute;
    return [secondaryRoute, subRoute];
  }, [pathname]);

  const selectedKey = useMemo(() => subRoute ?? "home", [subRoute]);

  const {
    user,
    personalWorkspace,
    workspaces,
    currentWorkspace,
    workspaceModalShown,
    handleWorkspaceCreate,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    handleNavigateToSettings,
  } = useHooks({ projectId, workspaceId });

  const handleCollapse = useCallback((collapse: boolean) => {
    setCollapsed(collapse);
  }, []);

  return (
    <>
      <DashboardMolecule
        collapsed={collapsed}
        onCollapse={handleCollapse}
        sidebarComponent={
          secondaryRoute === "project" ? (
            <ProjectMenu
              projectId={projectId}
              defaultSelectedKey={selectedKey}
              inlineCollapsed={collapsed}
              workspaceId={currentWorkspace?.id}
            />
          ) : (
            <WorkspaceMenu
              defaultSelectedKey={selectedKey}
              inlineCollapsed={collapsed}
              workspaceId={currentWorkspace?.id}
              isPersonalWorkspace={personalWorkspace?.id === currentWorkspace?.id}
            />
          )
        }
        headerComponent={
          <MoleculeHeader
            onWorkspaceModalOpen={handleWorkspaceModalOpen}
            onNavigateToSettings={handleNavigateToSettings}
            personalWorkspace={personalWorkspace}
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            user={user}
          />
        }
        contentComponent={<Outlet />}
      />
      <WorkspaceCreationModal
        open={workspaceModalShown}
        onClose={handleWorkspaceModalClose}
        onSubmit={handleWorkspaceCreate}
      />
    </>
  );
};

export default CMSWrapper;
