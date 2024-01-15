import SettingsMolecule from "@reearth-cms/components/molecules/Settings";

import useHooks from "./hooks";

const WorkspaceSettings: React.FC = () => {
  const {
    workspaceSettings,
    tiles,
    terrains,
    handleWorkspaceSettingsUpdate,
    handleTerrainToggle,
    hasPrivilege,
  } = useHooks();

  return (
    <SettingsMolecule
      workspaceSettings={workspaceSettings}
      tiles={tiles}
      terrains={terrains}
      onWorkspaceSettingsUpdate={handleWorkspaceSettingsUpdate}
      onTerrainToggle={handleTerrainToggle}
      hasPrivilege={hasPrivilege}
    />
  );
};

export default WorkspaceSettings;
