import { useParams } from "react-router-dom";

import IntegrationWrapper from "@reearth-cms/components/molecules/Integration";

import useHooks from "./hooks";

const Integration: React.FC = () => {
  const { workspaceId } = useParams();

  const {
    addLoading,
    deleteLoading,
    handleIntegrationConnect,
    handleIntegrationRemove,
    handleSearchTerm,
    handleTableChange,
    handleUpdateIntegration,
    hasConnectRight,
    hasDeleteRight,
    hasUpdateRight,
    loading,
    myIntegrations,
    page,
    pageSize,
    selectedIntegration,
    setSelectedIntegration,
    updateLoading,
    workspaceIntegrations,
  } = useHooks(workspaceId);

  return (
    <IntegrationWrapper
      addLoading={addLoading}
      deleteLoading={deleteLoading}
      hasConnectRight={hasConnectRight}
      hasDeleteRight={hasDeleteRight}
      hasUpdateRight={hasUpdateRight}
      loading={loading}
      myIntegrations={myIntegrations}
      onIntegrationConnect={handleIntegrationConnect}
      onIntegrationRemove={handleIntegrationRemove}
      onSearchTerm={handleSearchTerm}
      onTableChange={handleTableChange}
      onUpdateIntegration={handleUpdateIntegration}
      page={page}
      pageSize={pageSize}
      selectedIntegration={selectedIntegration}
      setSelectedIntegration={setSelectedIntegration}
      updateLoading={updateLoading}
      workspaceIntegrations={workspaceIntegrations}
    />
  );
};

export default Integration;
