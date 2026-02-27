import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import {
  EditorSupportedType,
  ObjectSupportedType,
} from "@reearth-cms/components/molecules/Schema/types";

import { SchemaFieldType } from "../../types";
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
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  max?: number;
  maxLength?: number;
  min?: number;
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
  selectedSupportedTypes?: EditorSupportedType | ObjectSupportedType[];
  selectedTags?: { color: string; id: string; name: string; }[];
  selectedType: SchemaFieldType;
  selectedValues?: string[];
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

const FieldDefaultInputs: React.FC<Props> = ({
  assetList,
  fileList,
  loadingAssets,
  max,
  maxLength,
  min,
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
  selectedSupportedTypes,
  selectedTags,
  selectedType,
  selectedValues,
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
  switch (selectedType) {
    case "TextArea":
      return <TextAreaField maxLength={maxLength} multiple={multiple} />;
    case "MarkdownText":
      return <MarkdownField maxLength={maxLength} multiple={multiple} />;
    case "Integer":
    case "Number":
      return <NumberField max={max} min={min} multiple={multiple} />;
    case "Bool":
      return <BooleanField multiple={multiple} />;
    case "Date":
      return <DateField multiple={multiple} />;
    case "Tag":
      return <TagField multiple={multiple} selectedTags={selectedTags} />;
    case "Checkbox":
      return <CheckboxField multiple={multiple} />;
    case "Asset":
      return (
        <AssetField
          assetList={assetList}
          fileList={fileList}
          loadingAssets={loadingAssets}
          multiple={multiple}
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
      );
    case "Select":
      return <SelectField multiple={multiple} selectedValues={selectedValues} />;
    case "URL":
      return <URLField multiple={multiple} />;
    case "Group":
      return <GroupField />;
    case "GeometryObject":
    case "GeometryEditor":
      return (
        <GeometryField
          isEditor={selectedType === "GeometryEditor"}
          multiple={multiple}
          supportedTypes={selectedSupportedTypes}
        />
      );
    case "Text":
    default:
      return <TextField maxLength={maxLength} multiple={multiple} />;
  }
};

export default FieldDefaultInputs;
