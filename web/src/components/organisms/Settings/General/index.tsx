import Settings from "@reearth-cms/components/molecules/Settings";

import useHooks from "./hooks";

const WorkspaceSettings: React.FC = () => {
  const { workspaceSettings, hasUpdateRight, updateLoading, handleWorkspaceSettingsUpdate } =
    useHooks();

  return (
    <Settings
      workspaceSettings={workspaceSettings}
      hasUpdateRight={hasUpdateRight}
      loading={updateLoading}
      onWorkspaceSettingsUpdate={handleWorkspaceSettingsUpdate}
    />
  );
};

export default WorkspaceSettings;
