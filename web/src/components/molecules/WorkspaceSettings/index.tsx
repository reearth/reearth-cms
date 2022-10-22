import ContentSection from "@reearth-cms/components/atoms/ContentSection";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import DangerZone from "@reearth-cms/components/molecules/WorkspaceSettings/DangerZone";
import WorkspaceForm from "@reearth-cms/components/molecules/WorkspaceSettings/Form";
import { useT } from "@reearth-cms/i18n";

export type Props = {};

const WorkspaceSettings: React.FC<Props> = () => {
  const t = useT();

  return (
    <InnerContent title="Workspace setting">
      <ContentSection title={t("General")}>
        <WorkspaceForm />
      </ContentSection>

      <ContentSection title={t("Dangerous Zone")} danger>
        <DangerZone />
      </ContentSection>
    </InnerContent>
  );
};

export default WorkspaceSettings;
