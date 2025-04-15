import ProjectSettingsWrapper from "@reearth-cms/components/molecules/ProjectSettings";

import useHooks from "./hooks";

const ProjectSettings: React.FC = () => {
  const {
    project,
    hasUpdateRight,
    hasDeleteRight,
    handleProjectDelete,
    handleProjectUpdate,
    handleProjectRequestRolesUpdate,
    handleProjectAliasCheck,
  } = useHooks();

  return (
    <ProjectSettingsWrapper
      project={project}
      hasUpdateRight={hasUpdateRight}
      hasDeleteRight={hasDeleteRight}
      onProjectDelete={handleProjectDelete}
      onProjectUpdate={handleProjectUpdate}
      onProjectRequestRolesUpdate={handleProjectRequestRolesUpdate}
      onProjectAliasCheck={handleProjectAliasCheck}
    />
  );
};

export default ProjectSettings;
