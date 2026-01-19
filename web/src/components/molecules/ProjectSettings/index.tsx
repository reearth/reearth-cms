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
  project?: Project;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  hasPublishRight: boolean;
  onProjectUpdate: (name: string, alias: string, description: string) => Promise<void>;
  onProjectRequestRolesUpdate: (role: Role[]) => Promise<void>;
  onProjectDelete: () => Promise<void>;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
  onProjectVisibilityChange: (visibility: string) => Promise<void>;
};

const ProjectSettings: React.FC<Props> = ({
  project,
  hasUpdateRight,
  hasDeleteRight,
  hasPublishRight,
  onProjectDelete,
  onProjectUpdate,
  onProjectRequestRolesUpdate,
  onProjectAliasCheck,
  onProjectVisibilityChange,
}) => {
  const t = useT();

  return !project ? (
    <Loading minHeight="400px" />
  ) : (
    <InnerContent title={`${t("Project Settings")} / ${project.name}`}>
      <ContentSection title={t("General")}>
        <GeneralForm
          project={project}
          hasUpdateRight={hasUpdateRight}
          onProjectUpdate={onProjectUpdate}
          onProjectAliasCheck={onProjectAliasCheck}
        />
      </ContentSection>
      <ContentSection title={t("Request")}>
        <RequestOptions
          initialRequestRoles={project.requestRoles}
          hasUpdateRight={hasUpdateRight}
          onProjectRequestRolesUpdate={onProjectRequestRolesUpdate}
        />
      </ContentSection>
      <DangerZone
        projectName={project.name}
        visibility={project.accessibility?.visibility}
        hasDeleteRight={hasDeleteRight}
        hasPublishRight={hasPublishRight}
        onProjectDelete={onProjectDelete}
        onProjectVisibilityChange={onProjectVisibilityChange}
      />
    </InnerContent>
  );
};

export default ProjectSettings;
