import styled from "@emotion/styled";
import { Dispatch, Key, SetStateAction } from "react";

import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import AssetListTable from "@reearth-cms/components/molecules/Asset/AssetListTable";
import UploadAsset from "@reearth-cms/components/molecules/Asset/UploadAsset";
import { fileFormats, imageFormats } from "@reearth-cms/components/molecules/Common/Asset";

type Props = {
  assetList: Asset[];
  assetsPerPage: number | undefined;
  fileList: UploadFile[];
  selection: {
    selectedRowKeys: Key[];
  };
  uploading: boolean;
  uploadModalVisibility: boolean;
  loading: boolean;
  createAssets: (files: UploadFile[]) => Promise<void>;
  onSearchTerm: (term?: string) => void;
  onEdit: (asset: Asset) => void;
  setSelection: Dispatch<
    SetStateAction<{
      selectedRowKeys: Key[];
    }>
  >;
  setFileList: Dispatch<SetStateAction<UploadFile<File>[]>>;
  setUploading: Dispatch<SetStateAction<boolean>>;
  setUploadModalVisibility: Dispatch<SetStateAction<boolean>>;
  onAssetsReload: () => void;
};

const AssetList: React.FC<Props> = ({
  assetList,
  assetsPerPage,
  fileList,
  selection,
  uploading,
  uploadModalVisibility,
  loading,
  createAssets,
  onSearchTerm,
  onEdit,
  setSelection,
  setFileList,
  setUploading,
  setUploadModalVisibility,
  onAssetsReload,
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
    <ComplexInnerContents
      center={
        <Wrapper>
          <StyledPageHeader
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
            selection={selection}
            setSelection={setSelection}
            onAssetsReload={onAssetsReload}
            loading={loading}
          />
        </Wrapper>
      }
    />
  );
};

export default AssetList;

const Wrapper = styled.div`
  background: #fff;
  width: 100%;
  height: 100%;
`;

const StyledPageHeader = styled(PageHeader)`
  margin: 0 8px;
`;
