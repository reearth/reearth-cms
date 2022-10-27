import styled from "@emotion/styled";
import { Dispatch, Key, SetStateAction } from "react";

import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import AssetListTable from "@reearth-cms/components/molecules/Asset/AssetListTable";
import UploadAsset from "@reearth-cms/components/molecules/Asset/UploadAsset";
import { fileFormats, imageFormats } from "@reearth-cms/components/molecules/Common/Asset";

type Props = {
  assetList: Asset[];
  assetsPerPage: number | undefined;
  createAssets: (files: UploadFile[]) => Promise<void>;
  fileList: UploadFile[];
  onSearchTerm: (term?: string) => void;
  onAssetsReload: () => void;
  onEdit: (asset: Asset) => void;
  selection: {
    selectedRowKeys: Key[];
  };
  setSelection: Dispatch<
    SetStateAction<{
      selectedRowKeys: Key[];
    }>
  >;
  setFileList: Dispatch<SetStateAction<UploadFile<File>[]>>;
  setUploading: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  setUploadModalVisibility: Dispatch<SetStateAction<boolean>>;
  uploading: boolean;
  uploadModalVisibility: boolean;
};

const AssetList: React.FC<Props> = ({
  assetList,
  assetsPerPage,
  createAssets,
  fileList,
  onSearchTerm,
  onAssetsReload,
  onEdit,
  selection,
  setSelection,
  setFileList,
  setUploading,
  loading,
  setUploadModalVisibility,
  uploading,
  uploadModalVisibility,
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
        onEdit={onEdit}
        onSearchTerm={onSearchTerm}
        onAssetsReload={onAssetsReload}
        loading={loading}
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
