import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import Loading from "@reearth-cms/components/atoms/Loading";
import DangerZone from "@reearth-cms/components/molecules/AccountSettings/DangerZone";
import GeneralForm from "@reearth-cms/components/molecules/AccountSettings/GeneralForm";
import ServiceForm from "@reearth-cms/components/molecules/AccountSettings/ServiceForm";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  me?: User;
  loading: boolean;
  onUserUpdate: (name: string, email: string) => Promise<void>;
  onLanguageUpdate: (lang: string) => Promise<void>;
  onUserDelete: () => Promise<void>;
};

const AccountSettings: React.FC<Props> = ({
  me,
  loading,
  onUserDelete,
  onLanguageUpdate,
  onUserUpdate,
}) => {
  const t = useT();

  return !me || loading ? (
    <Loading minHeight="400px" />
  ) : (
    <InnerContent title={t("Account Settings")}>
      <ContentSection title={t("General")}>
        <GeneralForm initialValues={me} onUserUpdate={onUserUpdate} />
      </ContentSection>
      <ContentSection title={t("Service")}>
        <ServiceForm initialValues={me} onLanguageUpdate={onLanguageUpdate} />
      </ContentSection>
      <DangerZone onUserDelete={onUserDelete} />
    </InnerContent>
  );
};

export default AccountSettings;
