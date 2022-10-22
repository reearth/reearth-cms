import WorkspaceSettingsMolecule from "@reearth-cms/components/molecules/WorkspaceSettings";

import useHooks from "./hooks";

const WorkspaceSettings: React.FC = () => {
  const { handleWorkspaceUpdate, handleWorkspaceDelete, workspaceName } = useHooks();

  return (
    <WorkspaceSettingsMolecule
      workspaceName={workspaceName}
      onWorkspaceUpdate={handleWorkspaceUpdate}
      onWorkspaceDelete={handleWorkspaceDelete}
    />
  );
};

export default WorkspaceSettings;
