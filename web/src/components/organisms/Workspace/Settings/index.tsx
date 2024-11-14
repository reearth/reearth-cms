import WorkspaceSettingsMolecule from "@reearth-cms/components/molecules/WorkspaceSettings";

import useHooks from "./hooks";

const WorkspaceSettings: React.FC = () => {
  const {
    workspaceName,
    updateWorkspaceLoading,
    hasUpdateRight,
    hasDeleteRight,
    handleWorkspaceUpdate,
    handleWorkspaceDelete,
  } = useHooks();

  return (
    <WorkspaceSettingsMolecule
      workspaceName={workspaceName}
      updateWorkspaceLoading={updateWorkspaceLoading}
      hasUpdateRight={hasUpdateRight}
      hasDeleteRight={hasDeleteRight}
      onWorkspaceUpdate={handleWorkspaceUpdate}
      onWorkspaceDelete={handleWorkspaceDelete}
    />
  );
};

export default WorkspaceSettings;
