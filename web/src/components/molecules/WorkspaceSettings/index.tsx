import ContentSection from "@reearth-cms/components/atoms/ContentSection";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import DangerZone from "@reearth-cms/components/molecules/WorkspaceSettings/DangerZone";
import WorkspaceForm from "@reearth-cms/components/molecules/WorkspaceSettings/Form";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  workspaceName?: string;
  onWorkspaceUpdate: (name?: string | undefined) => Promise<void>;
  onWorkspaceDelete: () => Promise<void>;
};

const WorkspaceSettings: React.FC<Props> = ({
  workspaceName,
  onWorkspaceUpdate,
  onWorkspaceDelete,
}) => {
  const t = useT();

  return (
    <InnerContent title="Workspace setting">
      <ContentSection title={t("General")}>
        <WorkspaceForm onWorkspaceUpdate={onWorkspaceUpdate} workspaceName={workspaceName} />
      </ContentSection>

      <ContentSection title={t("Dangerous Zone")} danger>
        <DangerZone onWorkspaceDelete={onWorkspaceDelete} />
      </ContentSection>
    </InnerContent>
  );
};

export default WorkspaceSettings;
