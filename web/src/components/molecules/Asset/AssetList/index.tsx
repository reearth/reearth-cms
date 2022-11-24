import styled from "@emotion/styled";
import { Dispatch, Key, SetStateAction, useCallback } from "react";

import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import AssetListTable from "@reearth-cms/components/molecules/Asset/AssetListTable";
import UploadAsset from "@reearth-cms/components/molecules/Asset/UploadAsset";
import { fileFormats, imageFormats } from "@reearth-cms/components/molecules/Common/Asset";

export type UploadType = "local" | "url";

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
  uploadUrl: string;
  uploadType: UploadType;
  onUploadModalCancel: () => void;
  setUploadUrl: (url: string) => void;
  setUploadType: (type: UploadType) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string) => Promise<Asset | undefined>;
  onAssetDelete: (assetIds: string[]) => Promise<void>;
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
  uploadUrl,
  uploadType,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetDelete,
  onSearchTerm,
  onEdit,
  setSelection,
  setFileList,
  setUploading,
  setUploadModalVisibility,
  onAssetsReload,
}) => {
  const displayUploadModal = useCallback(() => {
    setUploadModalVisibility(true);
  }, [setUploadModalVisibility]);

  const handleUpload = useCallback(async () => {
    setUploading(true);

    try {
      switch (uploadType) {
        case "url":
          await onAssetCreateFromUrl(uploadUrl);
          break;
        case "local":
        default:
          await onAssetsCreate(fileList);
          break;
      }
      onUploadModalCancel();
    } catch (error) {
      onUploadModalCancel();
    }
  }, [
    setUploading,
    uploadType,
    onUploadModalCancel,
    onAssetCreateFromUrl,
    uploadUrl,
    onAssetsCreate,
    fileList,
  ]);

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
                uploadUrl={uploadUrl}
                uploadType={uploadType}
                setUploadUrl={setUploadUrl}
                setUploadType={setUploadType}
                uploadModalVisibility={uploadModalVisibility}
                displayUploadModal={displayUploadModal}
                onUploadModalCancel={onUploadModalCancel}
                onUpload={handleUpload}
              />
            }
          />
          <AssetListTable
            assetList={assetList}
            assetsPerPage={assetsPerPage}
            selection={selection}
            loading={loading}
            onEdit={onEdit}
            onSearchTerm={onSearchTerm}
            setSelection={setSelection}
            onAssetsReload={onAssetsReload}
            onAssetDelete={onAssetDelete}
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
