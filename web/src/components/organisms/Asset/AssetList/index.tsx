import { useParams } from "react-router-dom";

import AssetListBody from "@reearth-cms/components/molecules/Asset/AssetList";

import useHooks from "./hooks";

const AssetList: React.FC = () => {
  const { workspaceId, projectId } = useParams();
  const {
    assetList,
    createAssets,
    assetsPerPage,
    navigate,
    handleSearchTerm,
    selection,
    setSelection,
    fileList,
    setFileList,
    uploading,
    setUploading,
    uploadModalVisibility,
    setUploadModalVisibility,
  } = useHooks(projectId);

  return (
    <AssetListBody
      workspaceId={workspaceId}
      projectId={projectId}
      assetList={assetList}
      createAssets={createAssets}
      assetsPerPage={assetsPerPage}
      navigate={navigate}
      handleSearchTerm={handleSearchTerm}
      selection={selection}
      setSelection={setSelection}
      fileList={fileList}
      setFileList={setFileList}
      uploading={uploading}
      setUploading={setUploading}
      uploadModalVisibility={uploadModalVisibility}
      setUploadModalVisibility={setUploadModalVisibility}
    />
  );
};

export default AssetList;
