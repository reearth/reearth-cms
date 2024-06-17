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
    addLoading,
    integrationConnectModalShown,
    handleIntegrationSettingsModalClose,
    handleIntegrationSettingsModalOpen,
    integrationSettingsModalShown,
    handleUpdateIntegration,
    updateLoading,
    selectedIntegrationMember,
    selection,
    handleSearchTerm,
    setSelection,
    handleIntegrationRemove,
  } = useHooks(workspaceId);

  return (
    <>
      <IntegrationTable
        integrationMembers={workspaceIntegrationMembers}
        selection={selection}
        onSearchTerm={handleSearchTerm}
        onIntegrationSettingsModalOpen={handleIntegrationSettingsModalOpen}
        onIntegrationConnectModalOpen={handleIntegrationConnectModalOpen}
        setSelection={setSelection}
        onIntegrationRemove={handleIntegrationRemove}
      />
      <IntegrationConnectModal
        integrations={integrations}
        open={integrationConnectModalShown}
        loading={addLoading}
        onClose={handleIntegrationConnectModalClose}
        onSubmit={handleIntegrationConnect}
      />
      <IntegrationSettingsModal
        selectedIntegrationMember={selectedIntegrationMember}
        open={integrationSettingsModalShown}
        loading={updateLoading}
        onClose={handleIntegrationSettingsModalClose}
        onSubmit={handleUpdateIntegration}
      />
    </>
  );
};

export default Integration;
