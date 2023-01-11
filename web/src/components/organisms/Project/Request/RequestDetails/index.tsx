import RequestDetailsMolecule from "@reearth-cms/components/molecules/Request/Details";
import useAssetHooks from "@reearth-cms/components/organisms/Asset/AssetList/hooks";
import useContentHooks from "@reearth-cms/components/organisms/Project/Content/ContentDetails/hooks";

import useHooks from "./hooks";

const RequestDetails: React.FC = () => {
  const {
    me,
    currentRequest,
    handleRequestApprove,
    handleRequestDelete,
    handleCommentCreate,
    handleCommentUpdate,
    handleCommentDelete,
    handleNavigateToRequestsList,
  } = useHooks();

  const {
    assetList,
    fileList,
    loading,
    uploading,
    uploadModalVisibility,
    uploadUrl,
    uploadType,
    handleUploadModalCancel,
    setUploadUrl,
    setUploadType,
    setFileList,
    setUploadModalVisibility,
    handleAssetsCreate,
    handleAssetCreateFromUrl,
    handleAssetsReload,
    handleSearchTerm,
    handleNavigateToAsset,
  } = useAssetHooks();

  const { workspaceUserMembers, handleRequestUpdate } = useContentHooks();

  return (
    <RequestDetailsMolecule
      me={me}
      currentRequest={currentRequest}
      workspaceUserMembers={workspaceUserMembers}
      onRequestApprove={handleRequestApprove}
      onRequestUpdate={handleRequestUpdate}
      onRequestDelete={handleRequestDelete}
      onCommentCreate={handleCommentCreate}
      onCommentUpdate={handleCommentUpdate}
      onCommentDelete={handleCommentDelete}
      onBack={handleNavigateToRequestsList}
      assetList={assetList}
      fileList={fileList}
      loadingAssets={loading}
      uploading={uploading}
      uploadModalVisibility={uploadModalVisibility}
      uploadUrl={uploadUrl}
      uploadType={uploadType}
      onUploadModalCancel={handleUploadModalCancel}
      setUploadUrl={setUploadUrl}
      setUploadType={setUploadType}
      onAssetsCreate={handleAssetsCreate}
      onAssetCreateFromUrl={handleAssetCreateFromUrl}
      onAssetsReload={handleAssetsReload}
      onAssetSearchTerm={handleSearchTerm}
      setFileList={setFileList}
      setUploadModalVisibility={setUploadModalVisibility}
      onNavigateToAsset={handleNavigateToAsset}
    />
  );
};

export default RequestDetails;
