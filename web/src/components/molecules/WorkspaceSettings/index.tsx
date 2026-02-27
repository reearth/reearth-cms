import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import DangerZone from "@reearth-cms/components/molecules/WorkspaceSettings/DangerZone";
import WorkspaceGeneralForm from "@reearth-cms/components/molecules/WorkspaceSettings/GeneralForm";
import { useT } from "@reearth-cms/i18n";

type Props = {
  hasDeleteRight: boolean;
  hasUpdateRight: boolean;
  onWorkspaceDelete: () => Promise<void>;
  onWorkspaceUpdate: (name: string) => Promise<void>;
  updateWorkspaceLoading: boolean;
  workspaceName?: string;
};

const WorkspaceSettings: React.FC<Props> = ({
  hasDeleteRight,
  hasUpdateRight,
  onWorkspaceDelete,
  onWorkspaceUpdate,
  updateWorkspaceLoading,
  workspaceName,
}) => {
  const t = useT();

  return (
    <InnerContent title={t("Workspace Settings")}>
      <ContentSection title={t("General")}>
        <WorkspaceGeneralForm
          hasUpdateRight={hasUpdateRight}
          onWorkspaceUpdate={onWorkspaceUpdate}
          updateWorkspaceLoading={updateWorkspaceLoading}
          workspaceName={workspaceName}
        />
      </ContentSection>
      <DangerZone hasDeleteRight={hasDeleteRight} onWorkspaceDelete={onWorkspaceDelete} />
    </InnerContent>
  );
};

export default WorkspaceSettings;
