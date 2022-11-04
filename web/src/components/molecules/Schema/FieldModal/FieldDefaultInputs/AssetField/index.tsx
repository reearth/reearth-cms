import { Dispatch, SetStateAction } from "react";

import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import AssetItem from "@reearth-cms/components/molecules/Common/Form/AssetItem";
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
  onLink: (asset: Asset) => void;
};
const AssetField: React.FC<Props> = ({
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
  onLink,
}) => {
  const t = useT();

  return (
    <AssetItem
      name="defaultValue"
      label={t("Set default value")}
      assetList={assetList}
      onAssetSearchTerm={onAssetSearchTerm}
      onAssetsReload={onAssetsReload}
      loadingAssets={loadingAssets}
      createAssets={createAssets}
      fileList={fileList}
      setFileList={setFileList}
      setUploading={setUploading}
      setUploadModalVisibility={setUploadModalVisibility}
      uploading={uploading}
      uploadModalVisibility={uploadModalVisibility}
      onLink={onLink}
    />
  );
};

export default AssetField;
