import RequestListMolecule from "@reearth-cms/components/molecules/Request/List";
import useCommentHooks from "@reearth-cms/components/organisms/Common/CommentsPanel/hooks";

import useHooks from "./hooks";

const RequestList: React.FC = () => {
  const {
    userId,
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

  const { handleCommentCreate, handleCommentUpdate, handleCommentDelete, ...commentProps } =
    useCommentHooks({
      resourceType: "REQUEST",
      refetchQueries: ["GetRequests"],
    });

  return (
    <RequestListMolecule
      userId={userId}
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
      commentCollapsed={collapsedCommentsPanel}
      onCollapseComment={collapseCommentsPanel}
      commentProps={{
        onCommentCreate: handleCommentCreate,
        onCommentUpdate: handleCommentUpdate,
        onCommentDelete: handleCommentDelete,
        ...commentProps,
      }}
    />
  );
};

export default RequestList;
