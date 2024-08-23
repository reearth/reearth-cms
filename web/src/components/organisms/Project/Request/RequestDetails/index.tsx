import RequestDetailsMolecule from "@reearth-cms/components/molecules/Request/Details";
import useAssetHooks from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";
import useContentHooks from "@reearth-cms/components/organisms/Project/Content/ContentDetails/hooks";
import useSettingsHooks from "@reearth-cms/components/organisms/Settings/General/hooks";

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
  } = useHooks();

  const { handleGetAsset } = useAssetHooks(false);

  const { workspaceUserMembers, updateRequestLoading, handleRequestUpdate, handleGroupGet } =
    useContentHooks();

  const { workspaceSettings, loading: settingsLoading } = useSettingsHooks();

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
      workspaceSettings={workspaceSettings}
      settingsLoading={settingsLoading}
      onRequestApprove={handleRequestApprove}
      onRequestUpdate={handleRequestUpdate}
      onRequestDelete={handleRequestDelete}
      onCommentCreate={handleCommentCreate}
      onCommentUpdate={handleCommentUpdate}
      onCommentDelete={handleCommentDelete}
      onBack={handleNavigateToRequestsList}
      loading={loading}
      onGetAsset={handleGetAsset}
      onGroupGet={handleGroupGet}
    />
  );
};

export default RequestDetails;
