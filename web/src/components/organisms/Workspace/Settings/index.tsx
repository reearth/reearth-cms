import WorkspaceSettingsWrapper from "@reearth-cms/components/molecules/WorkspaceSettings";

import useHooks from "./hooks";

const WorkspaceSettings: React.FC = () => {
  const {
    handleWorkspaceDelete,
    handleWorkspaceUpdate,
    hasDeleteRight,
    hasUpdateRight,
    updateWorkspaceLoading,
    workspaceName,
  } = useHooks();

  return (
    <WorkspaceSettingsWrapper
      hasDeleteRight={hasDeleteRight}
      hasUpdateRight={hasUpdateRight}
      onWorkspaceDelete={handleWorkspaceDelete}
      onWorkspaceUpdate={handleWorkspaceUpdate}
      updateWorkspaceLoading={updateWorkspaceLoading}
      workspaceName={workspaceName}
    />
  );
};

export default WorkspaceSettings;
