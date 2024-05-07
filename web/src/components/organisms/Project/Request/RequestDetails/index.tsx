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
    loading: loadingRequest,
    handleRequestApprove,
    handleRequestDelete,
    handleCommentCreate,
    handleCommentUpdate,
    handleCommentDelete,
    handleNavigateToRequestsList,
  } = useHooks();

  const { handleGetAsset } = useAssetHooks(false);

  const { workspaceUserMembers, handleRequestUpdate } = useContentHooks();

  return (
    <RequestDetailsMolecule
      me={me}
      isCloseActionEnabled={isCloseActionEnabled}
      isApproveActionEnabled={isApproveActionEnabled}
      currentRequest={currentRequest}
      workspaceUserMembers={workspaceUserMembers}
      onRequestApprove={handleRequestApprove}
      onRequestUpdate={handleRequestUpdate}
      onRequestDelete={handleRequestDelete}
      onCommentCreate={handleCommentCreate}
      onCommentUpdate={handleCommentUpdate}
      onCommentDelete={handleCommentDelete}
      onBack={handleNavigateToRequestsList}
      loading={loadingRequest}
      onGetAsset={handleGetAsset}
    />
  );
};

export default RequestDetails;
