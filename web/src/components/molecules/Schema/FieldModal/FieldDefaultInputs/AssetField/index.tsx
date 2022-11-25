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
  onUploadModalCancel: () => void;
  setUploadUrl: (url: string) => void;
  setUploadType: (type: UploadType) => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  onAssetsReload: () => void;
  onLink: (asset?: Asset) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onUploadAndLink: (input: { alsoLink: boolean; onLink?: (_asset?: Asset) => void }) => void;
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
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onAssetSearchTerm,
  onAssetsReload,
  onLink,
  setFileList,
  setUploadModalVisibility,
  onUploadAndLink,
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
      onUploadModalCancel={onUploadModalCancel}
      setUploadUrl={setUploadUrl}
      setUploadType={setUploadType}
      onLink={onLink}
      onAssetSearchTerm={onAssetSearchTerm}
      onAssetsReload={onAssetsReload}
      setFileList={setFileList}
      setUploadModalVisibility={setUploadModalVisibility}
      onUploadAndLink={onUploadAndLink}
    />
  );
};

export default AssetField;
