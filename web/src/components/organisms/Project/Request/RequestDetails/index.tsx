import RequestDetailsMolecule from "@reearth-cms/components/molecules/Request/Details";
import useAssetHooks from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";
import useContentHooks from "@reearth-cms/components/organisms/Project/Content/ContentDetails/hooks";

import useHooks from "./hooks";

const RequestDetails: React.FC = () => {
  const {
    approveLoading,
    currentRequest,
    deleteLoading,
    handleCommentCreate,
    handleCommentDelete,
    handleCommentUpdate,
    handleNavigateToItemEdit,
    handleNavigateToRequestsList,
    handleRequestApprove,
    handleRequestDelete,
    handleRequestUpdate,
    hasCommentCreateRight,
    hasCommentDeleteRight,
    hasCommentUpdateRight,
    isApproveActionEnabled,
    isAssignActionEnabled,
    isCloseActionEnabled,
    isReopenActionEnabled,
    loading,
    me,
    updateRequestLoading,
  } = useHooks();

  const { handleGetAsset } = useAssetHooks(false);

  const { handleGroupGet, workspaceUserMembers } = useContentHooks();

  return (
    <RequestDetailsMolecule
      approveLoading={approveLoading}
      currentRequest={currentRequest}
      deleteLoading={deleteLoading}
      hasCommentCreateRight={hasCommentCreateRight}
      hasCommentDeleteRight={hasCommentDeleteRight}
      hasCommentUpdateRight={hasCommentUpdateRight}
      isApproveActionEnabled={isApproveActionEnabled}
      isAssignActionEnabled={isAssignActionEnabled}
      isCloseActionEnabled={isCloseActionEnabled}
      isReopenActionEnabled={isReopenActionEnabled}
      loading={loading}
      me={me}
      onBack={handleNavigateToRequestsList}
      onCommentCreate={handleCommentCreate}
      onCommentDelete={handleCommentDelete}
      onCommentUpdate={handleCommentUpdate}
      onGetAsset={handleGetAsset}
      onGroupGet={handleGroupGet}
      onNavigateToItemEdit={handleNavigateToItemEdit}
      onRequestApprove={handleRequestApprove}
      onRequestDelete={handleRequestDelete}
      onRequestUpdate={handleRequestUpdate}
      updateLoading={updateRequestLoading}
      workspaceUserMembers={workspaceUserMembers}
    />
  );
};

export default RequestDetails;
