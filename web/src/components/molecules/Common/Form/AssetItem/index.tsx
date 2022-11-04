import styled from "@emotion/styled";
import { useState, Dispatch, SetStateAction } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { FormItemProps, FormItemLabelProps } from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { fileFormats, imageFormats } from "@reearth-cms/components/molecules/Common/Asset";
import LinkToAssetModal from "@reearth-cms/components/molecules/Common/LinkToAssetModal/linkToAssetModal";
import { useT } from "@reearth-cms/i18n";

type Props = {
  assetList: Asset[];
  onAssetSearchTerm: (term?: string | undefined) => void;
  onAssetsReload: () => void;
  loadingAssets: boolean;
  createAssets: (files: UploadFile[]) => Promise<void>;
  fileList: UploadFile[];
  setFileList: Dispatch<SetStateAction<UploadFile<File>[]>>;
  setUploading: Dispatch<SetStateAction<boolean>>;
  setUploadModalVisibility: Dispatch<SetStateAction<boolean>>;
  uploading: boolean;
  uploadModalVisibility: boolean;
} & FormItemProps &
  FormItemLabelProps;

const AssetItem: React.FC<Props> = ({
  name,
  label,
  extra,
  rules,
  assetList,
  onAssetSearchTerm,
  onAssetsReload,
  loadingAssets,
  createAssets,
  fileList,
  setFileList,
  setUploading,
  setUploadModalVisibility,
  uploading,
  uploadModalVisibility,
}) => {
  const t = useT();
  const { Item } = Form;

  const [visible, setVisible] = useState(false);
  const handleClick = () => {
    setVisible(true);
  };
  const handleCancel = () => {
    setVisible(false);
  };
  const handleConnect = (_asset: Asset) => {
    // TODO: implement connect asset with content
  };
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
      // TODO: connect the uploaded asset with content after uploading is done
    });
  };

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

  return (
    <Item name={name} label={label} extra={extra} rules={rules}>
      <AssetButton onClick={handleClick}>
        <div>
          <Icon icon="link" />
          <div style={{ marginTop: 8 }}>{t("Asset")}</div>
        </div>
      </AssetButton>
      <LinkToAssetModal
        visible={visible}
        onCancel={handleCancel}
        assetList={assetList}
        onConnect={handleConnect}
        onSearchTerm={onAssetSearchTerm}
        onAssetsReload={onAssetsReload}
        loading={loadingAssets}
        fileList={fileList}
        uploading={uploading}
        uploadProps={uploadProps}
        uploadModalVisibility={uploadModalVisibility}
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
