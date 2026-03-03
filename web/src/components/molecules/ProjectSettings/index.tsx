import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import Loading from "@reearth-cms/components/atoms/Loading";
import { Role } from "@reearth-cms/components/molecules/Member/types";
import DangerZone from "@reearth-cms/components/molecules/ProjectSettings/DangerZone";
import GeneralForm from "@reearth-cms/components/molecules/ProjectSettings/GeneralForm";
import RequestOptions from "@reearth-cms/components/molecules/ProjectSettings/RequestOptions";
import { useT } from "@reearth-cms/i18n";

import { Project } from "../Workspace/types";

type Props = {
  hasDeleteRight: boolean;
  hasPublishRight: boolean;
  hasUpdateRight: boolean;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
  onProjectDelete: () => Promise<void>;
  onProjectRequestRolesUpdate: (role: Role[]) => Promise<void>;
  onProjectUpdate: (name: string, alias: string, description: string) => Promise<void>;
  onProjectVisibilityChange: (visibility: string) => Promise<void>;
  project?: Project;
};

const ProjectSettings: React.FC<Props> = ({
  hasDeleteRight,
  hasPublishRight,
  hasUpdateRight,
  onProjectAliasCheck,
  onProjectDelete,
  onProjectRequestRolesUpdate,
  onProjectUpdate,
  onProjectVisibilityChange,
  project,
}) => {
  const t = useT();

  return !project ? (
    <Loading minHeight="400px" />
  ) : (
    <InnerContent title={`${t("Project Settings")} / ${project.name}`}>
      <ContentSection title={t("General")}>
        <GeneralForm
          hasUpdateRight={hasUpdateRight}
          onProjectAliasCheck={onProjectAliasCheck}
          onProjectUpdate={onProjectUpdate}
          project={project}
        />
      </ContentSection>
      <ContentSection title={t("Request")}>
        <RequestOptions
          hasUpdateRight={hasUpdateRight}
          initialRequestRoles={project.requestRoles}
          onProjectRequestRolesUpdate={onProjectRequestRolesUpdate}
        />
      </ContentSection>
      <DangerZone
        hasDeleteRight={hasDeleteRight}
        hasPublishRight={hasPublishRight}
        onProjectDelete={onProjectDelete}
        onProjectVisibilityChange={onProjectVisibilityChange}
        projectName={project.name}
        visibility={project.accessibility?.visibility}
      />
    </InnerContent>
  );
};

export default ProjectSettings;
