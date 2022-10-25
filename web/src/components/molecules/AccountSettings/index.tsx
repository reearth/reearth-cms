import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import DangerZone from "@reearth-cms/components/molecules/AccountSettings/DangerZone";
import AccountGeneralForm from "@reearth-cms/components/molecules/AccountSettings/GeneralForm";
import AccountServiceForm from "@reearth-cms/components/molecules/AccountSettings/ServiceForm";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  user?: User;
  onUserUpdate: (name?: string | undefined, email?: string | undefined) => Promise<void>;
  onLanguageUpdate: (lang?: string | undefined) => Promise<void>;
  onUserDelete: () => Promise<void>;
};

const AccountSettings: React.FC<Props> = ({
  user,
  onUserDelete,
  onLanguageUpdate,
  onUserUpdate,
}) => {
  const t = useT();

  return (
    <InnerContent title="Workspace setting">
      <ContentSection title={t("General")}>
        <AccountGeneralForm user={user} onUserUpdate={onUserUpdate} />
      </ContentSection>
      <ContentSection title={t("Service")}>
        <AccountServiceForm user={user} onLanguageUpdate={onLanguageUpdate} />
      </ContentSection>
      <ContentSection title={t("Danger Zone")} danger>
        <DangerZone onUserDelete={onUserDelete} />
      </ContentSection>
    </InnerContent>
  );
};

export default AccountSettings;
