import { useParams } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import IntegrationConnectModal from "@reearth-cms/components/molecules/Integration/IntegrationConnectModal";
import IntegrationSettingsModal from "@reearth-cms/components/molecules/Integration/IntegrationSettingsModal";
import IntegrationTable from "@reearth-cms/components/molecules/Integration/IntegrationTable";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const Integration: React.FC = () => {
  const { workspaceId } = useParams();
  const t = useT();

  const {
    integrations,
    workspaceIntegrationMembers,
    selectedConnectionModalIntegration,
    handleConnectionModalIntegrationSelect,
    handleIntegrationConnect,
    handleIntegrationConnectModalClose,
    handleIntegrationConnectModalOpen,
    integrationConnectModalShown,
    handleIntegrationSettingsModalClose,
    handleIntegrationSettingsModalOpen,
    integrationSettingsModalShown,
    handleUpdateIntegration,
    selectedIntegrationMember,
    handleSearchTerm,
  } = useHooks(workspaceId);
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
      <IntegrationTable
        onSearchTerm={handleSearchTerm}
        onIntegrationSettingsModalOpen={handleIntegrationSettingsModalOpen}
        integrationMembers={workspaceIntegrationMembers}
        onIntegrationConnectModalOpen={handleIntegrationConnectModalOpen}
      />
      <IntegrationConnectModal
        selectedIntegration={selectedConnectionModalIntegration}
        onIntegrationSelect={handleConnectionModalIntegrationSelect}
        integrations={integrations}
        onSubmit={handleIntegrationConnect}
        open={integrationConnectModalShown}
        onClose={handleIntegrationConnectModalClose}
      />
      <IntegrationSettingsModal
        selectedIntegrationMember={selectedIntegrationMember}
        onSubmit={handleUpdateIntegration}
        open={integrationSettingsModalShown}
        onClose={handleIntegrationSettingsModalClose}
      />
    </>
  );
};

export default Integration;
