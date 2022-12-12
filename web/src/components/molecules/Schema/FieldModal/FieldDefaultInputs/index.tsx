import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";

import { FieldType } from "../../types";

import AssetField from "./AssetField";
import IntegerField from "./IntegerField";
import MarkdownField from "./Markdown";
import SelectField from "./SelectField";
import TextAreaField from "./TextArea";
import TextField from "./TextField";
import URLField from "./URLField";

export interface Props {
  selectedType: FieldType;
  selectedValues: string[];
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  uploading: boolean;
  defaultValue?: string;
  uploadModalVisibility: boolean;
  uploadUrl: string;
  uploadType: UploadType;
  onUploadModalCancel: () => void;
  setUploadUrl: (url: string) => void;
  setUploadType: (type: UploadType) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string) => Promise<Asset | undefined>;
  onAssetSearchTerm: (term?: string | undefined) => void;
  onAssetsReload: () => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
}

const FieldDefaultInputs: React.FC<Props> = ({
  selectedType,
  selectedValues,
  assetList,
  fileList,
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
  onAssetsCreate,
  onAssetCreateFromUrl,
  setFileList,
  setUploadModalVisibility,
}) => {
  return selectedType ? (
    selectedType === "TextArea" ? (
      <TextAreaField />
    ) : selectedType === "MarkdownText" ? (
      <MarkdownField />
    ) : selectedType === "Integer" ? (
      <IntegerField />
    ) : selectedType === "Asset" ? (
      <AssetField
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
        onAssetsCreate={onAssetsCreate}
        onAssetCreateFromUrl={onAssetCreateFromUrl}
        onAssetSearchTerm={onAssetSearchTerm}
        onAssetsReload={onAssetsReload}
        setFileList={setFileList}
        setUploadModalVisibility={setUploadModalVisibility}
      />
    ) : selectedType === "Select" ? (
      <SelectField selectedValues={selectedValues} />
    ) : selectedType === "URL" ? (
      <URLField />
    ) : (
      <TextField />
    )
  ) : null;
};

export default FieldDefaultInputs;
