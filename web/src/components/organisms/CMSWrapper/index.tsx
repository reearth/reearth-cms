import { Outlet } from "react-router-dom";

import CMSWrapperMolecule from "@reearth-cms/components/molecules/CMSWrapper";
import MoleculeHeader from "@reearth-cms/components/molecules/Common/Header";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import useUploaderHooks from "@reearth-cms/components/molecules/Uploader/hooks";

import useHooks from "./hooks";

const CMSWrapper: React.FC = () => {
  const {
    collapsedMainMenu,
    currentProject,
    currentWorkspace,
    handleCollapse,
    handleHomeNavigation,
    handleNavigateToSettings,
    handleProjectMenuNavigate,
    handleWorkspaceCreate,
    handleWorkspaceMenuNavigate,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    handleWorkspaceNavigation,
    logoUrl,
    personalWorkspace,
    profilePictureUrl,
    secondaryRoute,
    selectedKey,
    username,
    workspaceModalShown,
    workspaces,
  } = useHooks();
  const { isShowUploader, shouldPreventReload, uploaderState } = useUploaderHooks();

  return (
    <>
      <CMSWrapperMolecule
        collapsedMainMenu={collapsedMainMenu}
        contentComponent={<Outlet />}
        headerComponent={
          <MoleculeHeader
            currentProject={currentProject}
            currentWorkspace={currentWorkspace}
            logoUrl={logoUrl}
            onHomeNavigation={handleHomeNavigation}
            onNavigateToSettings={handleNavigateToSettings}
            onWorkspaceModalOpen={handleWorkspaceModalOpen}
            onWorkspaceNavigation={handleWorkspaceNavigation}
            personalWorkspace={personalWorkspace}
            profilePictureUrl={profilePictureUrl}
            username={username}
            workspaces={workspaces}
          />
        }
        isShowUploader={isShowUploader}
        onCollapse={handleCollapse}
        shouldPreventReload={shouldPreventReload}
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
        uploaderState={uploaderState}
      />
      <WorkspaceCreationModal
        onClose={handleWorkspaceModalClose}
        onSubmit={handleWorkspaceCreate}
        open={workspaceModalShown}
      />
    </>
  );
};

export default CMSWrapper;
