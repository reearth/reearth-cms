import RequestListMolecule from "@reearth-cms/components/molecules/Request/List";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";

import useHooks from "./hooks";

const RequestList: React.FC = () => {
  const {
    collapseCommentsPanel,
    collapsedCommentsPanel,
    columns,
    createdByMe,
    deleteLoading,
    handleColumnsChange,
    handleNavigateToRequest,
    handleRequestDelete,
    handleRequestSelect,
    handleRequestsReload,
    handleRequestTableChange,
    handleSearchTerm,
    handleSelect,
    hasCloseRight,
    loading,
    page,
    pageSize,
    requests,
    requestState,
    reviewedByMe,
    searchTerm,
    selectedRequest,
    selection,
    totalCount,
  } = useHooks();

  return (
    <RequestListMolecule
      columns={columns}
      commentsPanel={
        <CommentsPanel
          collapsed={collapsedCommentsPanel}
          comments={selectedRequest?.comments}
          onCollapse={collapseCommentsPanel}
          refetchQueries={["GetRequests"]}
          resourceId={selectedRequest?.id}
          resourceType={"REQUEST"}
          threadId={selectedRequest?.threadId}
        />
      }
      createdByMe={createdByMe}
      deleteLoading={deleteLoading}
      hasCloseRight={hasCloseRight}
      loading={loading}
      onColumnsChange={handleColumnsChange}
      onEdit={handleNavigateToRequest}
      onRequestDelete={handleRequestDelete}
      onRequestSelect={handleRequestSelect}
      onRequestsReload={handleRequestsReload}
      onRequestTableChange={handleRequestTableChange}
      onSearchTerm={handleSearchTerm}
      onSelect={handleSelect}
      page={page}
      pageSize={pageSize}
      requests={requests}
      requestState={requestState}
      reviewedByMe={reviewedByMe}
      searchTerm={searchTerm}
      selectedRequest={selectedRequest}
      selection={selection}
      totalCount={totalCount}
    />
  );
};

export default RequestList;
