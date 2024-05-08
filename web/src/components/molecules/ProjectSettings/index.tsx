import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import DangerZone from "@reearth-cms/components/molecules/ProjectSettings/DangerZone";
import ProjectGeneralForm from "@reearth-cms/components/molecules/ProjectSettings/GeneralForm";
import ProjectRequestOptions from "@reearth-cms/components/molecules/ProjectSettings/RequestOptions";
import { useT } from "@reearth-cms/i18n";

import { Project, Role } from "../Workspace/types";

export type Props = {
  project?: Project;
  onProjectUpdate: (name?: string, alias?: string, description?: string) => Promise<void>;
  onProjectRequestRolesUpdate: (role?: Role[] | null) => Promise<void>;
  onProjectDelete: () => Promise<void>;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
};

const ProjectSettings: React.FC<Props> = ({
  project,
  onProjectDelete,
  onProjectUpdate,
  onProjectRequestRolesUpdate,
  onProjectAliasCheck,
}) => {
  const t = useT();

  return (
    <InnerContent title={`${t("Project Settings")} / ${project?.name}`}>
      <ContentSection title={t("General")}>
        <ProjectGeneralForm
          project={project}
          onProjectUpdate={onProjectUpdate}
          onProjectAliasCheck={onProjectAliasCheck}
        />
      </ContentSection>
      <ContentSection title={t("Request")}>
        <ProjectRequestOptions
          project={project}
          onProjectRequestRolesUpdate={onProjectRequestRolesUpdate}
        />
      </ContentSection>
      <DangerZone onProjectDelete={onProjectDelete} />
    </InnerContent>
  );
};

export default ProjectSettings;
