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
      <IntegrationTable
        onSearchTerm={handleSearchTerm}
        onIntegrationSettingsModalOpen={handleIntegrationSettingsModalOpen}
        integrationMembers={workspaceIntegrationMembers}
        onIntegrationConnectModalOpen={handleIntegrationConnectModalOpen}
      />
      <IntegrationConnectModal
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
