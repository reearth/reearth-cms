import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import {
  ObjectSupportedType,
  EditorSupportedType,
} from "@reearth-cms/components/molecules/Schema/types";

import { FieldType } from "../../types";

import AssetField from "./AssetField";
import BooleanField from "./BooleanField";
import CheckboxField from "./CheckboxField";
import DateField from "./DateField";
import GeometryField from "./GeometryField";
import GroupField from "./GroupField";
import MarkdownField from "./Markdown";
import NumberField from "./NumberField";
import SelectField from "./SelectField";
import TagField from "./TagField";
import TextAreaField from "./TextArea";
import TextField from "./TextField";
import URLField from "./URLField";

type Props = {
  selectedType: FieldType;
  selectedValues?: string[];
  selectedTags?: { id: string; name: string; color: string }[];
  selectedSupportedTypes?: ObjectSupportedType[] | EditorSupportedType;
  maxLength?: number;
  min?: number;
  max?: number;
  multiple: boolean;
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadUrl: { url: string; autoUnzip: boolean };
  uploadType: UploadType;
  totalCount: number;
  page: number;
  pageSize: number;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
  onUploadModalCancel: () => void;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetSearchTerm: (term?: string | undefined) => void;
  onAssetsGet: () => void;
  onAssetsReload: () => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
};

const FieldDefaultInputs: React.FC<Props> = ({
  selectedType,
  selectedValues,
  selectedTags,
  selectedSupportedTypes,
  maxLength,
  min,
  max,
  multiple,
  assetList,
  fileList,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  totalCount,
  page,
  pageSize,
  onAssetTableChange,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onAssetSearchTerm,
  onAssetsGet,
  onAssetsReload,
  onAssetsCreate,
  onAssetCreateFromUrl,
  setFileList,
  setUploadModalVisibility,
  onGetAsset,
}) => {
  switch (selectedType) {
    case "TextArea":
      return <TextAreaField multiple={multiple} maxLength={maxLength} />;
    case "MarkdownText":
      return <MarkdownField multiple={multiple} maxLength={maxLength} />;
    case "Integer":
    case "Number":
      return <NumberField multiple={multiple} min={min} max={max} />;
    case "Bool":
      return <BooleanField multiple={multiple} />;
    case "Date":
      return <DateField multiple={multiple} />;
    case "Tag":
      return <TagField selectedTags={selectedTags} multiple={multiple} />;
    case "Checkbox":
      return <CheckboxField multiple={multiple} />;
    case "Asset":
      return (
        <AssetField
          multiple={multiple}
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
          onAssetTableChange={onAssetTableChange}
          onUploadModalCancel={onUploadModalCancel}
          setUploadUrl={setUploadUrl}
          setUploadType={setUploadType}
          onAssetsCreate={onAssetsCreate}
          onAssetCreateFromUrl={onAssetCreateFromUrl}
          onAssetSearchTerm={onAssetSearchTerm}
          onAssetsGet={onAssetsGet}
          onAssetsReload={onAssetsReload}
          setFileList={setFileList}
          setUploadModalVisibility={setUploadModalVisibility}
          onGetAsset={onGetAsset}
        />
      );
    case "Select":
      return <SelectField selectedValues={selectedValues} multiple={multiple} />;
    case "URL":
      return <URLField multiple={multiple} />;
    case "Group":
      return <GroupField />;
    case "GeometryObject":
    case "GeometryEditor":
      return (
        <GeometryField
          supportedTypes={selectedSupportedTypes}
          isEditor={selectedType === "GeometryEditor"}
          multiple={multiple}
        />
      );
    case "Text":
    default:
      return <TextField multiple={multiple} maxLength={maxLength} />;
  }
};

export default FieldDefaultInputs;
