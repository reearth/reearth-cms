import Form from "@reearth-cms/components/atoms/Form";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import AssetItem from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import MultiValueAsset from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueAsset";
import FieldTitle from "@reearth-cms/components/molecules/Content/Form/FieldTitle";
import { ItemAsset } from "@reearth-cms/components/molecules/Content/types";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import { requiredValidator } from "../utils";

type AssetFieldProps = {
  field: Field;
  itemGroupId?: string;
  assetList?: Asset[];
  itemAssets?: ItemAsset[];
  fileList?: UploadFile[];
  loadingAssets?: boolean;
  uploading?: boolean;
  uploadModalVisibility?: boolean;
  uploadUrl?: { url: string; autoUnzip: boolean };
  uploadType?: UploadType;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  disabled: boolean;
  onAssetTableChange?: (page: number, pageSize: number, sorter?: SortType) => void;
  onUploadModalCancel?: () => void;
  setUploadUrl?: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType?: (type: UploadType) => void;
  onAssetsCreate?: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl?: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsGet?: () => void;
  onAssetsReload?: () => void;
  onAssetSearchTerm?: (term?: string | undefined) => void;
  setFileList?: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility?: (visible: boolean) => void;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
};

const AssetField: React.FC<AssetFieldProps> = ({
  field,
  itemGroupId,
  assetList,
  itemAssets,
  fileList,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  totalCount,
  page,
  pageSize,
  disabled,
  onAssetTableChange,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetsGet,
  onAssetsReload,
  onAssetSearchTerm,
  setFileList,
  setUploadModalVisibility,
  onGetAsset,
}) => {
  const t = useT();

  return (
    <Form.Item
      extra={field.description}
      rules={[
        {
          required: field.required,
          validator: requiredValidator,
          message: t("Please input field!"),
        },
      ]}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />}>
      {field.multiple ? (
        <MultiValueAsset
          itemAssets={itemAssets}
          assetList={assetList}
          fileList={fileList}
          loadingAssets={loadingAssets}
          uploading={uploading}
          uploadModalVisibility={uploadModalVisibility}
          uploadUrl={uploadUrl}
          uploadType={uploadType}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          disabled={disabled}
          onAssetTableChange={onAssetTableChange}
          onUploadModalCancel={onUploadModalCancel}
          setUploadUrl={setUploadUrl}
          setUploadType={setUploadType}
          onAssetsCreate={onAssetsCreate}
          onAssetCreateFromUrl={onAssetCreateFromUrl}
          onAssetsGet={onAssetsGet}
          onAssetsReload={onAssetsReload}
          onAssetSearchTerm={onAssetSearchTerm}
          setFileList={setFileList}
          setUploadModalVisibility={setUploadModalVisibility}
          onGetAsset={onGetAsset}
        />
      ) : (
        <AssetItem
          key={field.id}
          itemAssets={itemAssets}
          assetList={assetList}
          fileList={fileList}
          loadingAssets={loadingAssets}
          uploading={uploading}
          uploadModalVisibility={uploadModalVisibility}
          uploadUrl={uploadUrl}
          uploadType={uploadType}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          disabled={disabled}
          onAssetTableChange={onAssetTableChange}
          onUploadModalCancel={onUploadModalCancel}
          setUploadUrl={setUploadUrl}
          setUploadType={setUploadType}
          onAssetsCreate={onAssetsCreate}
          onAssetCreateFromUrl={onAssetCreateFromUrl}
          onAssetsGet={onAssetsGet}
          onAssetsReload={onAssetsReload}
          onAssetSearchTerm={onAssetSearchTerm}
          setFileList={setFileList}
          setUploadModalVisibility={setUploadModalVisibility}
          onGetAsset={onGetAsset}
        />
      )}
    </Form.Item>
  );
};

export default AssetField;
