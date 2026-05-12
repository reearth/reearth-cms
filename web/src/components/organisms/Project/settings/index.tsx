import ProjectSettingsWrapper from "@reearth-cms/components/molecules/ProjectSettings";

import useHooks from "./hooks";

const ProjectSettings: React.FC = () => {
  const {
    project,
    hasUpdateRight,
    hasDeleteRight,
    hasPublishRight,
    handleProjectDelete,
    handleProjectUpdate,
    handleProjectRequestRolesUpdate,
    handleProjectAliasCheck,
    handleProjectVisibilityChange,
  } = useHooks();

  return (
    <ProjectSettingsWrapper
      project={project}
      hasUpdateRight={hasUpdateRight}
      hasDeleteRight={hasDeleteRight}
      hasPublishRight={hasPublishRight}
      onProjectDelete={handleProjectDelete}
      onProjectUpdate={handleProjectUpdate}
      onProjectRequestRolesUpdate={handleProjectRequestRolesUpdate}
      onProjectAliasCheck={handleProjectAliasCheck}
      onProjectVisibilityChange={handleProjectVisibilityChange}
    />
  );
};

export default ProjectSettings;
