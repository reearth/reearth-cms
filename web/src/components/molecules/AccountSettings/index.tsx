import ContentSection from "@reearth-cms/components/atoms/ContentSection";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import DangerZone from "@reearth-cms/components/molecules/AccountSettings/DangerZone";
import AccountGeneralForm from "@reearth-cms/components/molecules/AccountSettings/GeneralForm";
import AccountServiceForm from "@reearth-cms/components/molecules/AccountSettings/ServiceForm";
import { useT } from "@reearth-cms/i18n";

export type Props = {};

const AccountSettings: React.FC<Props> = () => {
  const t = useT();

  return (
    <InnerContent title="Workspace setting">
      <ContentSection title={t("General")}>
        <AccountGeneralForm />
      </ContentSection>
      <ContentSection title={t("Service")}>
        <AccountServiceForm />
      </ContentSection>
      <ContentSection title={t("Dangerous Zone")} danger>
        <DangerZone />
      </ContentSection>
    </InnerContent>
  );
};

export default AccountSettings;
