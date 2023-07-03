import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import DangerZone from "@reearth-cms/components/molecules/ProjectSettings/DangerZone";
import ProjectGeneralForm from "@reearth-cms/components/molecules/ProjectSettings/GeneralForm";
import { useT } from "@reearth-cms/i18n";

import { Project } from "../Workspace/types";

export type Props = {
  project?: Project;
  onProjectUpdate: (name?: string | undefined, description?: string | undefined) => Promise<void>;
  onProjectDelete: () => Promise<void>;
};

const ProjectSettings: React.FC<Props> = ({ project, onProjectDelete, onProjectUpdate }) => {
  const t = useT();

  return (
    <InnerContent title={`${t("Project Settings")} / ${project?.name}`}>
      <ContentSection title={t("General")}>
        <ProjectGeneralForm project={project} onProjectUpdate={onProjectUpdate} />
      </ContentSection>
      <DangerZone onProjectDelete={onProjectDelete} />
    </InnerContent>
  );
};

export default ProjectSettings;
