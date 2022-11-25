import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";

import { FieldType } from "../../types";

import AssetField from "./AssetField";
import IntegerField from "./IntegerField";
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
  onLink: (asset?: Asset) => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  onAssetsReload: () => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onUploadAndLink: (input: { alsoLink: boolean; onLink?: (_asset?: Asset) => void }) => void;
}

const FieldDefaultInputs: React.FC<Props> = ({
  selectedType,
  selectedValues,
  assetList,
  defaultValue,
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
  onLink,
  setFileList,
  setUploadModalVisibility,
  onUploadAndLink,
}) => {
  return selectedType ? (
    selectedType === "TextArea" || selectedType === "MarkdownText" ? (
      <TextAreaField />
    ) : selectedType === "Integer" ? (
      <IntegerField />
    ) : selectedType === "Asset" ? (
      <AssetField
        assetList={assetList}
        defaultValue={defaultValue}
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
