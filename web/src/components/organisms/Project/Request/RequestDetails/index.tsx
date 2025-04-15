import RequestDetailsMolecule from "@reearth-cms/components/molecules/Request/Details";
import useAssetHooks from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";
import useContentHooks from "@reearth-cms/components/organisms/Project/Content/ContentDetails/hooks";

import useHooks from "./hooks";

const RequestDetails: React.FC = () => {
  const {
    me,
    hasCommentCreateRight,
    hasCommentUpdateRight,
    hasCommentDeleteRight,
    isCloseActionEnabled,
    isReopenActionEnabled,
    isApproveActionEnabled,
    isAssignActionEnabled,
    currentRequest,
    loading,
    updateRequestLoading,
    deleteLoading,
    approveLoading,
    handleRequestUpdate,
    handleRequestApprove,
    handleRequestDelete,
    handleCommentCreate,
    handleCommentUpdate,
    handleCommentDelete,
    handleNavigateToRequestsList,
    handleNavigateToItemEdit,
  } = useHooks();

  const { handleGetAsset } = useAssetHooks(false);

  const { workspaceUserMembers, handleGroupGet } = useContentHooks();

  return (
    <RequestDetailsMolecule
      me={me}
      hasCommentCreateRight={hasCommentCreateRight}
      hasCommentUpdateRight={hasCommentUpdateRight}
      hasCommentDeleteRight={hasCommentDeleteRight}
      isCloseActionEnabled={isCloseActionEnabled}
      isReopenActionEnabled={isReopenActionEnabled}
      isApproveActionEnabled={isApproveActionEnabled}
      isAssignActionEnabled={isAssignActionEnabled}
      currentRequest={currentRequest}
      workspaceUserMembers={workspaceUserMembers}
      loading={loading}
      deleteLoading={deleteLoading}
      approveLoading={approveLoading}
      updateLoading={updateRequestLoading}
      onRequestApprove={handleRequestApprove}
      onRequestUpdate={handleRequestUpdate}
      onRequestDelete={handleRequestDelete}
      onCommentCreate={handleCommentCreate}
      onCommentUpdate={handleCommentUpdate}
      onCommentDelete={handleCommentDelete}
      onBack={handleNavigateToRequestsList}
      onNavigateToItemEdit={handleNavigateToItemEdit}
      onGetAsset={handleGetAsset}
      onGroupGet={handleGroupGet}
    />
  );
};

export default RequestDetails;
