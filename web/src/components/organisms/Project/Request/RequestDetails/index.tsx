import RequestDetailsMolecule from "@reearth-cms/components/molecules/Request/Details";
import useAssetHooks from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";
import useContentHooks from "@reearth-cms/components/organisms/Project/Content/ContentDetails/hooks";

import useHooks from "./hooks";

const RequestDetails: React.FC = () => {
  const {
    me,
    isCloseActionEnabled,
    isApproveActionEnabled,
    currentRequest,
    loading,
    deleteLoading,
    approveLoading,
    handleRequestApprove,
    handleRequestDelete,
    handleCommentCreate,
    handleCommentUpdate,
    handleCommentDelete,
    handleNavigateToRequestsList,
    handleNavigateToItemEdit,
  } = useHooks();

  const { handleGetAsset } = useAssetHooks(false);

  const { workspaceUserMembers, updateRequestLoading, handleRequestUpdate, handleGroupGet } =
    useContentHooks();

  return (
    <RequestDetailsMolecule
      me={me}
      isCloseActionEnabled={isCloseActionEnabled}
      isApproveActionEnabled={isApproveActionEnabled}
      currentRequest={currentRequest}
      workspaceUserMembers={workspaceUserMembers}
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
      loading={loading}
      onGetAsset={handleGetAsset}
      onGroupGet={handleGroupGet}
    />
  );
};

export default RequestDetails;
