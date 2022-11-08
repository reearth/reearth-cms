import styled from "@emotion/styled";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { FormItemProps, FormItemLabelProps } from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { fileFormats, imageFormats } from "@reearth-cms/components/molecules/Common/Asset";
import LinkAssetModal from "@reearth-cms/components/molecules/Common/LinkAssetModal/LinkAssetModal";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

type Props = {
  assetList: Asset[];
  fileList: UploadFile[];
  defaultValue?: string;
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  createAssets: (files: UploadFile[]) => Promise<void>;
  onLink: (asset: Asset) => void;
  onAssetsReload: () => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  setFileList: Dispatch<SetStateAction<UploadFile<File>[]>>;
  setUploading: Dispatch<SetStateAction<boolean>>;
  setUploadModalVisibility: Dispatch<SetStateAction<boolean>>;
} & FormItemProps &
  FormItemLabelProps;

const AssetItem: React.FC<Props> = ({
  name,
  label,
  extra,
  rules,
  assetList,
  fileList,
  defaultValue,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  createAssets,
  onLink,
  onAssetsReload,
  onAssetSearchTerm,
  setFileList,
  setUploading,
  setUploadModalVisibility,
}) => {
  const t = useT();
  const { Item } = Form;
  const { visible, handleClick, handleCancel, displayUploadModal, hideUploadModal, handleUpload } =
    useHooks(fileList, createAssets, setFileList, setUploading, setUploadModalVisibility);
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
    setAssetValue(assetList.find(asset => asset.id === defaultValue));
  }, [defaultValue, assetList, setAssetValue]);

  return (
    <Item name={name} label={label} extra={extra} rules={rules}>
      {assetValue ? (
        assetValue.previewType === "IMAGE" ? (
          <AssetButton onClick={handleClick} style={{ marginLeft: 8 }}>
            <img src={assetValue.url} alt={assetValue.fileName} />
          </AssetButton>
        ) : (
          <AssetButton onClick={handleClick} style={{ marginLeft: 8 }}>
            <div>
              <Icon icon="file" />
              <div style={{ marginTop: 8, overflow: "hidden" }}>{assetValue.fileName}</div>
            </div>
          </AssetButton>
        )
      ) : (
        <AssetButton onClick={handleClick}>
          <div>
            <Icon icon="link" />
            <div style={{ marginTop: 8 }}>{t("Asset")}</div>
          </div>
        </AssetButton>
      )}
      <LinkAssetModal
        visible={visible}
        onCancel={handleCancel}
        assetList={assetList}
        fileList={fileList}
        loading={loadingAssets}
        uploading={uploading}
        uploadProps={uploadProps}
        uploadModalVisibility={uploadModalVisibility}
        onLink={onLink}
        onAssetsReload={onAssetsReload}
        onSearchTerm={onAssetSearchTerm}
        displayUploadModal={displayUploadModal}
        hideUploadModal={hideUploadModal}
        handleUpload={handleUpload}
      />
    </Item>
  );
};

const AssetButton = styled(Button)`
  width: 100px;
  height: 100px;
`;

export default AssetItem;
