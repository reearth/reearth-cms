import { Outlet } from "react-router-dom";

import NotFound from "@reearth-cms/components/atoms/NotFound";
import CMSWrapperMolecule from "@reearth-cms/components/molecules/CMSWrapper";
import MoleculeHeader from "@reearth-cms/components/molecules/Common/Header";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";

import useHooks from "./hooks";

const CMSWrapper: React.FC = () => {
  const {
    username,
    personalWorkspace,
    workspaces,
    currentWorkspace,
    workspaceModalShown,
    currentProject,
    selectedKey,
    secondaryRoute,
    collapsed,
    workspaceExists,
    handleCollapse,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    handleWorkspaceCreate,
    handleNavigateToSettings,
  } = useHooks();

  return workspaceExists ? (
    <>
      <CMSWrapperMolecule
        collapsed={collapsed}
        onCollapse={handleCollapse}
        headerComponent={
          <MoleculeHeader
            onWorkspaceModalOpen={handleWorkspaceModalOpen}
            onNavigateToSettings={handleNavigateToSettings}
            personalWorkspace={personalWorkspace}
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            currentProject={currentProject}
            username={username}
          />
        }
        sidebarComponent={
          secondaryRoute === "project" ? (
            <ProjectMenu
              projectId={currentProject?.id}
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
        contentComponent={<Outlet />}
      />
      <WorkspaceCreationModal
        open={workspaceModalShown}
        onClose={handleWorkspaceModalClose}
        onSubmit={handleWorkspaceCreate}
      />
    </>
  ) : (
    <NotFound />
  );
};

export default CMSWrapper;
