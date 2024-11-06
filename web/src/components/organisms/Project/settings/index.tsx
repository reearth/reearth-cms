import { useParams } from "react-router-dom";

import Loading from "@reearth-cms/components/atoms/Loading";
import ProjectSettingsMolecule from "@reearth-cms/components/molecules/ProjectSettings";

import useHooks from "./hooks";

const ProjectSettings: React.FC = () => {
  const { projectId } = useParams();

  const {
    project,
    loading,
    hasUpdateRight,
    hasDeleteRight,
    handleProjectDelete,
    handleProjectUpdate,
    handleProjectRequestRolesUpdate,
    handleProjectAliasCheck,
  } = useHooks({
    projectId,
  });

  return !project || loading ? (
    <Loading minHeight="400px" />
  ) : (
    <ProjectSettingsMolecule
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
