import Settings from "@reearth-cms/components/molecules/Settings";

import useHooks from "./hooks";

const WorkspaceSettings: React.FC = () => {
  const {
    loading,
    workspaceSettings,
    hasUpdateRight,
    updateLoading,
    handleWorkspaceSettingsUpdate,
  } = useHooks();

  return (
    <Settings
      loading={loading}
      workspaceSettings={workspaceSettings}
      hasUpdateRight={hasUpdateRight}
      updateLoading={updateLoading}
      onWorkspaceSettingsUpdate={handleWorkspaceSettingsUpdate}
    />
  );
};

export default WorkspaceSettings;
