import IntegrationConnectModal from "@reearth-cms/components/molecules/Integration/IntegrationConnectModal";
import IntegrationSettingsModal from "@reearth-cms/components/molecules/Integration/IntegrationSettingsModal";
import IntegrationTable from "@reearth-cms/components/molecules/Integration/IntegrationTable";
import { useParams } from "react-router-dom";

import useHooks from "./hooks";

const Integration: React.FC = () => {
  const { workspaceId } = useParams();

  const {
    integrations,
    workspaceIntegrationMembers,
    handleIntegrationConnectModalClose,
    handleIntegrationConnectModalOpen,
    addLoading,
    handleIntegrationConnect,
    deleteLoading,
    handleIntegrationRemove,
    integrationConnectModalShown,
    handleUpdateIntegration,
    updateLoading,
    handleIntegrationSettingsModalClose,
    handleIntegrationSettingsModalOpen,
    integrationSettingsModalShown,
    selectedIntegrationMember,
    selection,
    handleSearchTerm,
    setSelection,
    page,
    pageSize,
    handleTableChange,
    loading,
    handleReload,
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
        deleteLoading={deleteLoading}
        onIntegrationRemove={handleIntegrationRemove}
        page={page}
        pageSize={pageSize}
        onTableChange={handleTableChange}
        loading={loading}
        onReload={handleReload}
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
