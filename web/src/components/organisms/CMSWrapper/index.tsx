import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";

import MoleculeHeader from "@reearth-cms/components/molecules/Common/Header";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import DashboardMolecule from "@reearth-cms/components/molecules/Dashboard";

import useHooks from "./hooks";

type InnerProps = {
  onWorkspaceModalOpen?: () => void;
};

export type Props = {
  child: React.FC<InnerProps>;
  defaultSelectedKeys?: string[];
  sidebar: React.FC<{
    projectId?: string;
    inlineCollapsed: boolean;
    isPersonalWorkspace?: boolean;
    workspaceId?: string;
    defaultSelectedKeys?: string[];
  }>;
};

const CMSWrapper: React.FC<Props> = ({ child: Child, defaultSelectedKeys, sidebar: Sidebar }) => {
  const { projectId, workspaceId } = useParams();
  const [collapsed, setCollapsed] = useState(false);

  const {
    user,
    personalWorkspace,
    workspaces,
    currentWorkspace,
    handleWorkspaceCreate,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    workspaceModalShown,
  } = useHooks(workspaceId);

  const handleCollapse = useCallback((collapse: boolean) => {
    setCollapsed(collapse);
  }, []);

  return (
    <>
      <DashboardMolecule
        collapsed={collapsed}
        onCollapse={handleCollapse}
        sidebarComponent={
          <Sidebar
            projectId={projectId}
            defaultSelectedKeys={defaultSelectedKeys}
            inlineCollapsed={collapsed}
            workspaceId={currentWorkspace?.id}
            isPersonalWorkspace={personalWorkspace?.id === currentWorkspace?.id}
          />
        }
        headerComponent={
          <MoleculeHeader
            onModalOpen={handleWorkspaceModalOpen}
            personalWorkspace={personalWorkspace}
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            user={user}
          />
        }
        contentComponent={<Child onWorkspaceModalOpen={handleWorkspaceModalOpen} />}
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
