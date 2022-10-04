import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import IntegrationConnectModal from "@reearth-cms/components/molecules/Integration/IntegrationConnectModal";
import IntegrationSettingsModal from "@reearth-cms/components/molecules/Integration/IntegrationSettingsModal";
import IntegrationTable from "@reearth-cms/components/molecules/Integration/IntegrationTable";
import { useT } from "@reearth-cms/i18n";

const Integration: React.FC = () => {
  const t = useT();

  return (
    <>
      <PageHeader
        title={t("Integration")}
        extra={
          <Button type="primary" onClick={() => {}} icon={<Icon icon="api" />}>
            {t("Connect Integration")}
          </Button>
        }
      />
      <IntegrationTable />
      <IntegrationConnectModal open={false} />
      <IntegrationSettingsModal open={false} />
    </>
  );
};

export default Integration;
