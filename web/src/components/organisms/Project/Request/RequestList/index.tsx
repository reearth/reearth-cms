import RequestListMolecule from "@reearth-cms/components/molecules/Request/List";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";

import useHooks from "./hooks";

const RequestList: React.FC = () => {
  const {
    requests,
    loading,
    collapsedCommentsPanel,
    selectedRequest,
    selection,
    handleSelect,
    collapseCommentsPanel,
    handleRequestSelect,
    handleRequestsReload,
    deleteLoading,
    handleRequestDelete,
    searchTerm,
    handleSearchTerm,
    handleNavigateToRequest,
    totalCount,
    reviewedByMe,
    createdByMe,
    requestState,
    page,
    pageSize,
    handleRequestTableChange,
    columns,
    handleColumnsChange,
    hasCloseRight,
  } = useHooks();

  return (
    <RequestListMolecule
      commentsPanel={
        <CommentsPanel
          resourceId={selectedRequest?.id}
          resourceType={"REQUEST"}
          collapsed={collapsedCommentsPanel}
          onCollapse={collapseCommentsPanel}
          comments={selectedRequest?.comments}
          threadId={selectedRequest?.threadId}
          refetchQueries={["GetRequests"]}
        />
      }
      requests={requests}
      onRequestSelect={handleRequestSelect}
      loading={loading}
      onRequestsReload={handleRequestsReload}
      deleteLoading={deleteLoading}
      onRequestDelete={handleRequestDelete}
      selectedRequest={selectedRequest}
      searchTerm={searchTerm}
      onSearchTerm={handleSearchTerm}
      selection={selection}
      onSelect={handleSelect}
      onEdit={handleNavigateToRequest}
      totalCount={totalCount}
      reviewedByMe={reviewedByMe}
      createdByMe={createdByMe}
      requestState={requestState}
      page={page}
      onRequestTableChange={handleRequestTableChange}
      pageSize={pageSize}
      columns={columns}
      onColumnsChange={handleColumnsChange}
      hasCloseRight={hasCloseRight}
    />
  );
};

export default RequestList;
