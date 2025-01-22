import { useParams } from "react-router-dom";

import IntegrationWrapper from "@reearth-cms/components/molecules/Integration";

import useHooks from "./hooks";

const Integration: React.FC = () => {
  const { workspaceId } = useParams();

  const {
    loading,
    workspaceIntegrationMembers,
    handleSearchTerm,
    handleReload,
    setSelectedIntegrationMember,
    deleteLoading,
    handleIntegrationRemove,
    page,
    pageSize,
    handleTableChange,
    hasConnectRight,
    hasUpdateRight,
    hasDeleteRight,

    integrations,
    addLoading,
    handleIntegrationConnect,

    selectedIntegrationMember,
    updateLoading,
    handleUpdateIntegration,
  } = useHooks(workspaceId);

  return (
    <IntegrationWrapper
      loading={loading}
      integrationMembers={workspaceIntegrationMembers}
      onSearchTerm={handleSearchTerm}
      onReload={handleReload}
      setSelectedIntegrationMember={setSelectedIntegrationMember}
      onIntegrationRemove={handleIntegrationRemove}
      deleteLoading={deleteLoading}
      page={page}
      pageSize={pageSize}
      onTableChange={handleTableChange}
      hasConnectRight={hasConnectRight}
      hasUpdateRight={hasUpdateRight}
      hasDeleteRight={hasDeleteRight}
      integrations={integrations}
      addLoading={addLoading}
      handleIntegrationConnect={handleIntegrationConnect}
      selectedIntegrationMember={selectedIntegrationMember}
      updateLoading={updateLoading}
      handleUpdateIntegration={handleUpdateIntegration}
    />
  );
};

export default Integration;
