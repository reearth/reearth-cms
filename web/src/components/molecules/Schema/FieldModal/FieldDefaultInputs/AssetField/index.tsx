import { Dispatch, SetStateAction } from "react";

import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import AssetItem from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import { useT } from "@reearth-cms/i18n";

type Props = {
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  defaultValue?: string;
  uploadUrl: string;
  uploadType: UploadType;
  hideUploadModal: () => void;
  setUploadUrl: (url: string) => void;
  setUploadType: (type: UploadType) => void;
  onAssetCreate: (files: UploadFile[]) => Promise<void>;
  onAssetCreateFromUrl: (url: string) => Promise<Asset | undefined>;
  onAssetSearchTerm: (term?: string | undefined) => void;
  onAssetsReload: () => void;
  onLink: (asset?: Asset) => void;
  setFileList: Dispatch<SetStateAction<UploadFile<File>[]>>;
  setUploading: Dispatch<SetStateAction<boolean>>;
  setUploadModalVisibility: Dispatch<SetStateAction<boolean>>;
};
const AssetField: React.FC<Props> = ({
  assetList,
  fileList,
  defaultValue,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  hideUploadModal,
  setUploadUrl,
  setUploadType,
  onAssetCreate,
  onAssetCreateFromUrl,
  onAssetSearchTerm,
  onAssetsReload,
  onLink,
  setFileList,
  setUploading,
  setUploadModalVisibility,
}) => {
  const t = useT();

  return (
    <AssetItem
      name="defaultValue"
      label={t("Set default value")}
      defaultValue={defaultValue}
      assetList={assetList}
      fileList={fileList}
      loadingAssets={loadingAssets}
      uploading={uploading}
      uploadModalVisibility={uploadModalVisibility}
      uploadUrl={uploadUrl}
      uploadType={uploadType}
      hideUploadModal={hideUploadModal}
      setUploadUrl={setUploadUrl}
      setUploadType={setUploadType}
      onAssetCreate={onAssetCreate}
      onAssetCreateFromUrl={onAssetCreateFromUrl}
      onLink={onLink}
      onAssetSearchTerm={onAssetSearchTerm}
      onAssetsReload={onAssetsReload}
      setFileList={setFileList}
      setUploading={setUploading}
      setUploadModalVisibility={setUploadModalVisibility}
    />
  );
};

export default AssetField;
