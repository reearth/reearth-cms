import { useParams } from "react-router-dom";

import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import AssetListBody from "@reearth-cms/components/molecules/Asset/AssetList";

import useHooks from "./hooks";

const AssetList: React.FC = () => {
  const { workspaceId, projectId } = useParams();
  const {
    assetList,
    assetsPerPage,
    createAssets,
    handleSearchTerm,
    fileList,
    navigate,
    selection,
    setSelection,
    setFileList,
    setUploading,
    setUploadModalVisibility,
    uploading,
    uploadModalVisibility,
  } = useHooks(projectId);

  const handleEdit = (asset: Asset) => {
    navigate(`/workspace/${workspaceId}/project/${projectId}/asset/${asset.id}`);
  };

  return (
    <AssetListBody
      assetList={assetList}
      assetsPerPage={assetsPerPage}
      createAssets={createAssets}
      fileList={fileList}
      onSearchTerm={handleSearchTerm}
      onEdit={handleEdit}
      selection={selection}
      setSelection={setSelection}
      setFileList={setFileList}
      setUploading={setUploading}
      setUploadModalVisibility={setUploadModalVisibility}
      uploading={uploading}
      uploadModalVisibility={uploadModalVisibility}
    />
  );
};

export default AssetList;
