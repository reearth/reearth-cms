import { useParams } from "react-router-dom";

import Loading from "@reearth-cms/components/atoms/Loading";
import ProjectSettingsMolecule from "@reearth-cms/components/molecules/ProjectSettings";

import useHooks from "./hooks";

const ProjectSettings: React.FC = () => {
  const { projectId } = useParams();

  const { project, loading, handleProjectDelete, handleProjectUpdate } = useHooks({
    projectId,
  });

  return !project || loading ? (
    <Loading minHeight="400px" />
  ) : (
    <ProjectSettingsMolecule
      project={project}
      onProjectDelete={handleProjectDelete}
      onProjectUpdate={handleProjectUpdate}
    />
  );
};

export default ProjectSettings;
