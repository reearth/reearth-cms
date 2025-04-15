import { useParams } from "react-router-dom";

import IntegrationWrapper from "@reearth-cms/components/molecules/Integration";

import useHooks from "./hooks";

const Integration: React.FC = () => {
  const { workspaceId } = useParams();

  const {
    loading,
    workspaceIntegrations,
    handleSearchTerm,
    handleReload,
    setSelectedIntegration,
    deleteLoading,
    handleIntegrationRemove,
    page,
    pageSize,
    handleTableChange,
    hasConnectRight,
    hasUpdateRight,
    hasDeleteRight,
    myIntegrations,
    addLoading,
    handleIntegrationConnect,
    selectedIntegration,
    updateLoading,
    handleUpdateIntegration,
  } = useHooks(workspaceId);

  return (
    <IntegrationWrapper
      loading={loading}
      workspaceIntegrations={workspaceIntegrations}
      onSearchTerm={handleSearchTerm}
      onReload={handleReload}
      setSelectedIntegration={setSelectedIntegration}
      onIntegrationRemove={handleIntegrationRemove}
      deleteLoading={deleteLoading}
      page={page}
      pageSize={pageSize}
      onTableChange={handleTableChange}
      hasConnectRight={hasConnectRight}
      hasUpdateRight={hasUpdateRight}
      hasDeleteRight={hasDeleteRight}
      myIntegrations={myIntegrations}
      addLoading={addLoading}
      onIntegrationConnect={handleIntegrationConnect}
      selectedIntegration={selectedIntegration}
      updateLoading={updateLoading}
      onUpdateIntegration={handleUpdateIntegration}
    />
  );
};

export default Integration;
