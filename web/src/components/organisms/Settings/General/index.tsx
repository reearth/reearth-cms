import SettingsMolecule from "@reearth-cms/components/molecules/Settings";

import useHooks from "./hooks";

const WorkspaceSettings: React.FC = () => {
  const { workspaceSettings, handleWorkspaceSettingsUpdate, hasPrivilege } = useHooks();

  return (
    <SettingsMolecule
      workspaceSettings={workspaceSettings}
      onWorkspaceSettingsUpdate={handleWorkspaceSettingsUpdate}
      hasPrivilege={hasPrivilege}
    />
  );
};

export default WorkspaceSettings;
