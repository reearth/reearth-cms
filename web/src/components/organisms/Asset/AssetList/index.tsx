import { useParams } from "react-router-dom";

import { UploadProps } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import AssetListBody from "@reearth-cms/components/molecules/Asset/AssetList/AssetListBody";
import UploadAsset from "@reearth-cms/components/molecules/Asset/UploadAsset";
import { fileFormats, imageFormats } from "@reearth-cms/components/molecules/Common/Asset";

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

  const displayUploadModal = () => {
    setUploadModalVisibility(true);
  };
  const hideUploadModal = () => {
    setUploadModalVisibility(false);
    setUploading(false);
    setFileList([]);
  };

  const handleUpload = () => {
    setUploading(true);
    createAssets(fileList).finally(() => {
      hideUploadModal();
    });
  };

  const handleEdit = (asset: Asset) => {
    navigate(`/workspace/${workspaceId}/project/${projectId}/asset/${asset.id}`);
  };

  const uploadProps: UploadProps = {
    name: "file",
    multiple: true,
    directory: false,
    showUploadList: true,
    accept: imageFormats + "," + fileFormats,
    listType: "picture",
    onRemove: file => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (_file, files) => {
      setFileList([...fileList, ...files]);
      return false;
    },
    fileList,
  };

  return (
    <AssetListBody
      pageHeader={{
        title: "Asset",
        extra: (
          <UploadAsset
            fileList={fileList}
            uploading={uploading}
            uploadProps={uploadProps}
            uploadModalVisibility={uploadModalVisibility}
            displayUploadModal={displayUploadModal}
            hideUploadModal={hideUploadModal}
            handleUpload={handleUpload}
          />
        ),
      }}
      tableProps={{
        assetList,
        assetsPerPage,
        handleEdit,
        handleSearchTerm,
        selection,
        setSelection,
      }}
    />
  );
};

export default AssetList;
