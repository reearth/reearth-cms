import { Dispatch, SetStateAction } from "react";

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
  hideUploadModal: () => void;
  setUploadUrl: (url: string) => void;
  setUploadType: (type: UploadType) => void;
  onAssetCreate: (files: UploadFile[]) => Promise<void>;
  onAssetCreateFromUrl: (url: string) => Promise<Asset | undefined>;
  onLink: (asset?: Asset) => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  onAssetsReload: () => void;
  setFileList: Dispatch<SetStateAction<UploadFile<File>[]>>;
  setUploading: Dispatch<SetStateAction<boolean>>;
  setUploadModalVisibility: Dispatch<SetStateAction<boolean>>;
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
  hideUploadModal,
  setUploadUrl,
  setUploadType,
  onAssetSearchTerm,
  onAssetsReload,
  onLink,
  onAssetCreate,
  onAssetCreateFromUrl,
  setFileList,
  setUploading,
  setUploadModalVisibility,
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
