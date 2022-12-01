import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import DangerZone from "@reearth-cms/components/molecules/MyIntegrations/Settings/DangerZone";
import MyIntegrationForm from "@reearth-cms/components/molecules/MyIntegrations/Settings/Form";
import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  integration: Integration;
  onIntegrationUpdate: (data: { name: string; description: string; logoUrl: string }) => void;
  onIntegrationDelete: () => Promise<void>;
};

const MyIntegrationSettings: React.FC<Props> = ({
  integration,
  onIntegrationUpdate,
  onIntegrationDelete,
}) => {
  const t = useT();

  return (
    <InnerContent title={t("Workspace Settings")}>
      <ContentSection title={t("General")}>
        <MyIntegrationForm integration={integration} onIntegrationUpdate={onIntegrationUpdate} />
      </ContentSection>
      <DangerZone onIntegrationDelete={onIntegrationDelete} />
    </InnerContent>
  );
};

export default MyIntegrationSettings;
