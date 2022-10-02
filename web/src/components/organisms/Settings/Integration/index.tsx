import { useParams } from "react-router-dom";

import IntegrationConnectModal from "@reearth-cms/components/molecules/Integration/IntegrationConnectModal";
import IntegrationSettingsModal from "@reearth-cms/components/molecules/Integration/IntegrationSettingsModal";
import IntegrationTable from "@reearth-cms/components/molecules/Integration/IntegrationTable";

import useHooks from "./hooks";

const Integration: React.FC = () => {
  const { workspaceId } = useParams();

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
  } = useHooks(workspaceId);
  return (
    <>
      <IntegrationTable
        onIntegrationSettingsModalOpen={handleIntegrationSettingsModalOpen}
        integrationMembers={workspaceIntegrationMembers}
        onIntegrationConnectModalOpen={handleIntegrationConnectModalOpen}
      />
      <IntegrationConnectModal
        selectedIntegration={selectedConnectionModalIntegration}
        onConnectionModalIntegrationSelect={handleConnectionModalIntegrationSelect}
        integrations={integrations}
        onSubmit={handleIntegrationConnect}
        open={integrationConnectModalShown}
        onClose={handleIntegrationConnectModalClose}
      />
      <IntegrationSettingsModal
        open={integrationSettingsModalShown}
        onClose={handleIntegrationSettingsModalClose}
      />
    </>
  );
};

export default Integration;
