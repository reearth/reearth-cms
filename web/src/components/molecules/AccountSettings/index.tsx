import ContentSection from "@reearth-cms/components/atoms/ContentSection";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import DangerZone from "@reearth-cms/components/molecules/AccountSettings/DangerZone";
import AccountGeneralForm from "@reearth-cms/components/molecules/AccountSettings/GeneralForm";
import AccountServiceForm from "@reearth-cms/components/molecules/AccountSettings/ServiceForm";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  onUserUpdate: (name?: string | undefined, email?: string | undefined) => Promise<void>;
  onLanguageUpdate: (lang?: string | undefined) => Promise<void>;
  onUserDelete: () => Promise<void>;
};

const AccountSettings: React.FC<Props> = ({ onUserDelete, onLanguageUpdate, onUserUpdate }) => {
  const t = useT();

  return (
    <InnerContent title="Workspace setting">
      <ContentSection title={t("General")}>
        <AccountGeneralForm onUserUpdate={onUserUpdate} />
      </ContentSection>
      <ContentSection title={t("Service")}>
        <AccountServiceForm onLanguageUpdate={onLanguageUpdate} />
      </ContentSection>
      <ContentSection title={t("Dangerous Zone")} danger>
        <DangerZone onUserDelete={onUserDelete} />
      </ContentSection>
    </InnerContent>
  );
};

export default AccountSettings;
