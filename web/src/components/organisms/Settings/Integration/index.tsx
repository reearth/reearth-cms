import { useParams } from "react-router-dom";

import IntegrationConnectModal from "@reearth-cms/components/molecules/Integration/IntegrationConnectModal";
import IntegrationSettingsModal from "@reearth-cms/components/molecules/Integration/IntegrationSettingsModal";
import IntegrationTable from "@reearth-cms/components/molecules/Integration/IntegrationTable";

import useHooks from "./hooks";

const Integration: React.FC = () => {
  const { workspaceId } = useParams();

  const {
    integrations,
    workspaceIntegrations,
    selectedConnectionModalIntegration,
    handleConnectionModalIntegrationSelect,
    handleIntegrationConnect,
    handleIntegrationConnectModalClose,
    handleIntegrationConnectModalOpen,
    integrationConnectModalShown,
  } = useHooks(workspaceId);
  return (
    <>
      <IntegrationTable
        integrations={workspaceIntegrations}
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
      <IntegrationSettingsModal open={false} />
    </>
  );
};

export default Integration;
