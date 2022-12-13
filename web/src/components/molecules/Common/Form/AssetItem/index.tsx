import styled from "@emotion/styled";
import { useEffect, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { fileFormats, imageFormats } from "@reearth-cms/components/molecules/Common/Asset";
import LinkAssetModal from "@reearth-cms/components/molecules/Common/LinkAssetModal/LinkAssetModal";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

type Props = {
  assetList: Asset[];
  fileList: UploadFile[];
  value?: string;
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadUrl: string;
  uploadType: UploadType;
  onUploadModalCancel: () => void;
  setUploadUrl: (url: string) => void;
  setUploadType: (type: UploadType) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string) => Promise<Asset | undefined>;
  onAssetsReload: () => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onChange?: (value: string) => void;
  onNavigateToAsset: (asset: Asset) => void;
};

const AssetItem: React.FC<Props> = ({
  assetList,
  fileList,
  value,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetsReload,
  onAssetSearchTerm,
  setFileList,
  setUploadModalVisibility,
  onChange,
  onNavigateToAsset,
}) => {
  const t = useT();
  const {
    visible,
    handleClick,
    handleLinkAssetModalCancel,
    displayUploadModal,
    handleUploadAndLink,
  } = useHooks(
    fileList,
    uploadUrl,
    uploadType,
    onAssetsCreate,
    onAssetCreateFromUrl,
    setUploadModalVisibility,
    onChange,
  );
  const [assetValue, setAssetValue] = useState<Asset>();

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    directory: false,
    showUploadList: true,
    accept: imageFormats + "," + fileFormats,
    listType: "picture",
    onRemove: _file => {
      setFileList([]);
    },
    beforeUpload: file => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  useEffect(() => {
    setAssetValue(assetList.find(asset => asset.id === value));
  }, [value, assetList, setAssetValue]);

  return (
    <AssetWrapper>
      {assetValue ? (
        <>
          <AssetDetailsWrapper>
            <AssetButton onClick={handleClick}>
              <div>
                <Icon icon="folder" size={24} />
                <div style={{ marginTop: 8, overflow: "hidden" }}>{assetValue.fileName}</div>
              </div>
            </AssetButton>
            <AssetName type="link" onClick={() => onNavigateToAsset(assetValue)}>
              {assetValue.fileName}
            </AssetName>
          </AssetDetailsWrapper>
          <AssetIcon
            type="link"
            icon={<Icon icon="arrowSquareOut" size={20} />}
            onClick={() => onNavigateToAsset(assetValue)}
          />
        </>
      ) : (
        <AssetButton onClick={handleClick}>
          <div>
            <Icon icon="linkSolid" size={14} />
            <div style={{ marginTop: 4 }}>{t("Asset")}</div>
          </div>
        </AssetButton>
      )}
      <LinkAssetModal
        visible={visible}
        onLinkAssetModalCancel={handleLinkAssetModalCancel}
        linkedAsset={assetValue}
        assetList={assetList}
        fileList={fileList}
        loading={loadingAssets}
        uploading={uploading}
        uploadProps={uploadProps}
        uploadModalVisibility={uploadModalVisibility}
        uploadUrl={uploadUrl}
        uploadType={uploadType}
        setUploadUrl={setUploadUrl}
        setUploadType={setUploadType}
        onChange={onChange}
        onAssetsReload={onAssetsReload}
        onSearchTerm={onAssetSearchTerm}
        displayUploadModal={displayUploadModal}
        onUploadModalCancel={onUploadModalCancel}
        onUploadAndLink={handleUploadAndLink}
      />
    </AssetWrapper>
  );
};

const AssetButton = styled(Button)`
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
`;

const AssetWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const AssetIcon = styled(Button)`
  color: #000000d9;
  margin-top: 4px;
  top: 3px;
`;

const AssetName = styled(Button)`
  color: #1890ff;
  margin-left: 12px;
`;

const AssetDetailsWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export default AssetItem;
