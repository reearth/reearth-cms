import { Outlet } from "react-router";

import CMSWrapperMolecule from "@reearth-cms/components/molecules/CMSWrapper";
import MoleculeHeader from "@reearth-cms/components/molecules/Common/Header";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import useUploaderHooks from "@reearth-cms/components/molecules/Uploader/hooks";

import useHooks from "./hooks";

const CMSWrapper: React.FC = () => {
  const {
    username,
    profilePictureUrl,
    personalWorkspace,
    workspaces,
    currentWorkspace,
    workspaceModalShown,
    currentProject,
    selectedKey,
    secondaryRoute,
    collapsedMainMenu,
    handleCollapse,
    handleProjectMenuNavigate,
    handleWorkspaceMenuNavigate,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    handleWorkspaceCreate,
    handleNavigateToSettings,
    handleWorkspaceNavigation,
    handleHomeNavigation,
    logoUrl,
  } = useHooks();
  const { isShowUploader, shouldPreventReload, uploaderState } = useUploaderHooks();

  return (
    <>
      <CMSWrapperMolecule
        collapsedMainMenu={collapsedMainMenu}
        shouldPreventReload={shouldPreventReload}
        isShowUploader={isShowUploader}
        uploaderState={uploaderState}
        onCollapse={handleCollapse}
        headerComponent={
          <MoleculeHeader
            onWorkspaceModalOpen={handleWorkspaceModalOpen}
            onNavigateToSettings={handleNavigateToSettings}
            onWorkspaceNavigation={handleWorkspaceNavigation}
            onHomeNavigation={handleHomeNavigation}
            personalWorkspace={personalWorkspace}
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            currentProject={currentProject}
            username={username}
            profilePictureUrl={profilePictureUrl}
            logoUrl={logoUrl}
          />
        }
        sidebarComponent={
          secondaryRoute === "project" ? (
            <ProjectMenu
              defaultSelectedKey={selectedKey}
              inlineCollapsed={collapsedMainMenu}
              onNavigate={handleProjectMenuNavigate}
            />
          ) : (
            <WorkspaceMenu
              defaultSelectedKey={selectedKey}
              inlineCollapsed={collapsedMainMenu}
              isPersonalWorkspace={personalWorkspace?.id === currentWorkspace?.id}
              onNavigate={handleWorkspaceMenuNavigate}
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
  );
};

export default CMSWrapper;
