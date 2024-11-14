import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { Role } from "@reearth-cms/components/molecules/Member/types";
import DangerZone from "@reearth-cms/components/molecules/ProjectSettings/DangerZone";
import ProjectGeneralForm from "@reearth-cms/components/molecules/ProjectSettings/GeneralForm";
import ProjectRequestOptions from "@reearth-cms/components/molecules/ProjectSettings/RequestOptions";
import { useT } from "@reearth-cms/i18n";

import { Project } from "../Workspace/types";

type Props = {
  project: Project;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  onProjectUpdate: (name?: string, alias?: string, description?: string) => Promise<void>;
  onProjectRequestRolesUpdate: (role?: Role[] | null) => Promise<void>;
  onProjectDelete: () => Promise<void>;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
};

const ProjectSettings: React.FC<Props> = ({
  project,
  hasUpdateRight,
  hasDeleteRight,
  onProjectDelete,
  onProjectUpdate,
  onProjectRequestRolesUpdate,
  onProjectAliasCheck,
}) => {
  const t = useT();

  return (
    <InnerContent title={`${t("Project Settings")} / ${project.name}`}>
      <ContentSection title={t("General")}>
        <ProjectGeneralForm
          project={project}
          hasUpdateRight={hasUpdateRight}
          onProjectUpdate={onProjectUpdate}
          onProjectAliasCheck={onProjectAliasCheck}
        />
      </ContentSection>
      <ContentSection title={t("Request")}>
        <ProjectRequestOptions
          project={project}
          hasUpdateRight={hasUpdateRight}
          onProjectRequestRolesUpdate={onProjectRequestRolesUpdate}
        />
      </ContentSection>
      <DangerZone hasDeleteRight={hasDeleteRight} onProjectDelete={onProjectDelete} />
    </InnerContent>
  );
};

export default ProjectSettings;
