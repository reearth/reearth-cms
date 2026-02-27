import Form from "@reearth-cms/components/atoms/Form";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import AssetItem from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import MultiValueAsset from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueAsset";
import { useT } from "@reearth-cms/i18n";

type Props = {
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  multiple: boolean;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetSearchTerm: (term?: string | undefined) => void;
  onAssetsGet: () => void;
  onAssetsReload: () => void;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onUploadModalCancel: () => void;
  page: number;
  pageSize: number;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  setUploadType: (type: UploadType) => void;
  setUploadUrl: (uploadUrl: { autoUnzip: boolean; url: string; }) => void;
  totalCount: number;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadType: UploadType;
  uploadUrl: { autoUnzip: boolean; url: string; };
};
const AssetField: React.FC<Props> = ({
  assetList,
  fileList,
  loadingAssets,
  multiple,
  onAssetCreateFromUrl,
  onAssetsCreate,
  onAssetSearchTerm,
  onAssetsGet,
  onAssetsReload,
  onAssetTableChange,
  onGetAsset,
  onUploadModalCancel,
  page,
  pageSize,
  setFileList,
  setUploadModalVisibility,
  setUploadType,
  setUploadUrl,
  totalCount,
  uploading,
  uploadModalVisibility,
  uploadType,
  uploadUrl,
}) => {
  const t = useT();

  return (
    <Form.Item label={t("Set default value")} name="defaultValue">
      {multiple ? (
        <MultiValueAsset
          assetList={assetList}
          fileList={fileList}
          loadingAssets={loadingAssets}
          onAssetCreateFromUrl={onAssetCreateFromUrl}
          onAssetsCreate={onAssetsCreate}
          onAssetSearchTerm={onAssetSearchTerm}
          onAssetsGet={onAssetsGet}
          onAssetsReload={onAssetsReload}
          onAssetTableChange={onAssetTableChange}
          onGetAsset={onGetAsset}
          onUploadModalCancel={onUploadModalCancel}
          page={page}
          pageSize={pageSize}
          setFileList={setFileList}
          setUploadModalVisibility={setUploadModalVisibility}
          setUploadType={setUploadType}
          setUploadUrl={setUploadUrl}
          totalCount={totalCount}
          uploading={uploading}
          uploadModalVisibility={uploadModalVisibility}
          uploadType={uploadType}
          uploadUrl={uploadUrl}
        />
      ) : (
        <AssetItem
          assetList={assetList}
          fileList={fileList}
          loadingAssets={loadingAssets}
          onAssetCreateFromUrl={onAssetCreateFromUrl}
          onAssetsCreate={onAssetsCreate}
          onAssetSearchTerm={onAssetSearchTerm}
          onAssetsGet={onAssetsGet}
          onAssetsReload={onAssetsReload}
          onAssetTableChange={onAssetTableChange}
          onGetAsset={onGetAsset}
          onUploadModalCancel={onUploadModalCancel}
          page={page}
          pageSize={pageSize}
          setFileList={setFileList}
          setUploadModalVisibility={setUploadModalVisibility}
          setUploadType={setUploadType}
          setUploadUrl={setUploadUrl}
          totalCount={totalCount}
          uploading={uploading}
          uploadModalVisibility={uploadModalVisibility}
          uploadType={uploadType}
          uploadUrl={uploadUrl}
        />
      )}
    </Form.Item>
  );
};

export default AssetField;
