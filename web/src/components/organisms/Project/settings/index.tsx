import ProjectSettingsWrapper from "@reearth-cms/components/molecules/ProjectSettings";

import useHooks from "./hooks";

const ProjectSettings: React.FC = () => {
  const {
    handleProjectAliasCheck,
    handleProjectDelete,
    handleProjectRequestRolesUpdate,
    handleProjectUpdate,
    handleProjectVisibilityChange,
    hasDeleteRight,
    hasPublishRight,
    hasUpdateRight,
    project,
  } = useHooks();

  return (
    <ProjectSettingsWrapper
      hasDeleteRight={hasDeleteRight}
      hasPublishRight={hasPublishRight}
      hasUpdateRight={hasUpdateRight}
      onProjectAliasCheck={handleProjectAliasCheck}
      onProjectDelete={handleProjectDelete}
      onProjectRequestRolesUpdate={handleProjectRequestRolesUpdate}
      onProjectUpdate={handleProjectUpdate}
      onProjectVisibilityChange={handleProjectVisibilityChange}
      project={project}
    />
  );
};

export default ProjectSettings;
