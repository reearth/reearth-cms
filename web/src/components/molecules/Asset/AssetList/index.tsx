import styled from "@emotion/styled";

import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { UploadProps } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import AssetListTable from "@reearth-cms/components/molecules/Asset/AssetListTable";
import UploadAsset from "@reearth-cms/components/molecules/Asset/UploadAsset";
import { fileFormats, imageFormats } from "@reearth-cms/components/molecules/Common/Asset";

type Props = {
  workspaceId: string | undefined;
  projectId: string | undefined;
  assetList: any;
  createAssets: any;
  assetsPerPage: any;
  navigate: any;
  handleSearchTerm: any;
  selection: any;
  setSelection: any;
  fileList: any;
  setFileList: any;
  uploading: any;
  setUploading: any;
  uploadModalVisibility: any;
  setUploadModalVisibility: any;
};

const AssetList: React.FC<Props> = ({
  workspaceId,
  projectId,
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
}) => {
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
    <Wrapper>
      <PageHeader
        title="Asset"
        extra={
          <UploadAsset
            fileList={fileList}
            uploading={uploading}
            uploadProps={uploadProps}
            uploadModalVisibility={uploadModalVisibility}
            displayUploadModal={displayUploadModal}
            hideUploadModal={hideUploadModal}
            handleUpload={handleUpload}
          />
        }
      />
      <AssetListTable
        assetList={assetList}
        assetsPerPage={assetsPerPage}
        handleEdit={handleEdit}
        handleSearchTerm={handleSearchTerm}
        selection={selection}
        setSelection={setSelection}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: white;
  height: 100%;
`;

export default AssetList;
