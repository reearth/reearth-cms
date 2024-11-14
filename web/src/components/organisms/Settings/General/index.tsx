import SettingsMolecule from "@reearth-cms/components/molecules/Settings";

import useHooks from "./hooks";

const WorkspaceSettings: React.FC = () => {
  const { workspaceSettings, hasUpdateRight, updateLoading, handleWorkspaceSettingsUpdate } =
    useHooks();

  return (
    <SettingsMolecule
      workspaceSettings={workspaceSettings}
      hasUpdateRight={hasUpdateRight}
      loading={updateLoading}
      onWorkspaceSettingsUpdate={handleWorkspaceSettingsUpdate}
    />
  );
};

export default WorkspaceSettings;
