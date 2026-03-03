import Settings from "@reearth-cms/components/molecules/Settings";

import useHooks from "./hooks";

const WorkspaceSettings: React.FC = () => {
  const {
    handleWorkspaceSettingsUpdate,
    hasUpdateRight,
    loading,
    updateLoading,
    workspaceSettings,
  } = useHooks();

  return (
    <Settings
      hasUpdateRight={hasUpdateRight}
      loading={loading}
      onWorkspaceSettingsUpdate={handleWorkspaceSettingsUpdate}
      updateLoading={updateLoading}
      workspaceSettings={workspaceSettings}
    />
  );
};

export default WorkspaceSettings;
