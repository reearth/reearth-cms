import styled from "@emotion/styled";

import Form from "@reearth-cms/components/atoms/Form";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset } from "@reearth-cms/components/molecules/Asset/types";
import {
  AssetField,
  // GroupField,
  ReferenceField,
} from "@reearth-cms/components/molecules/Content/Form/fields/ComplexFieldComponents";
import { DefaultField } from "@reearth-cms/components/molecules/Content/Form/fields/FieldComponents";
import { FIELD_TYPE_COMPONENT_MAP } from "@reearth-cms/components/molecules/Content/Form/fields/FieldTypesMap";
import { Schema } from "@reearth-cms/components/molecules/Schema/types";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";

interface Props {
  initialFormValues: any;
  schema?: Schema;
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
  onAssetTableChange: (
    page: number,
    pageSize: number,
    sorter?: { type?: AssetSortType; direction?: SortDirection },
  ) => void;
  onUploadModalCancel: () => void;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsGet: () => void;
  onAssetsReload: () => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
}

const RequestItemForm: React.FC<Props> = ({
  schema,
  initialFormValues,
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
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetsGet,
  onAssetsReload,
  onAssetSearchTerm,
  setFileList,
  setUploadModalVisibility,
  onGetAsset,
}) => {
  const [form] = Form.useForm();
  return (
    <StyledForm form={form} layout="vertical" initialValues={initialFormValues}>
      <div>
        {schema?.fields.map(field => {
          if (field.type === "Asset") {
            return (
              <div key={field.id}>
                <AssetField
                  field={field}
                  disabled={true}
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
                  onAssetsGet={onAssetsGet}
                  onAssetsReload={onAssetsReload}
                  onAssetSearchTerm={onAssetSearchTerm}
                  setFileList={setFileList}
                  setUploadModalVisibility={setUploadModalVisibility}
                  onGetAsset={onGetAsset}
                />
              </div>
            );
          } else if (field.type === "Reference") {
            return (
              <div key={field.id}>
                <ReferenceField field={field} disabled />
              </div>
            );
          } else if (field.type === "Group") {
            return (
              <div key={field.id}>
                {/* <GroupField
                    field={field}
                    onGroupGet={onGroupGet}
                  /> */}
              </div>
            );
          } else {
            const FieldComponent =
              FIELD_TYPE_COMPONENT_MAP[
                field.type as
                  | "Select"
                  | "Date"
                  | "Tag"
                  | "Bool"
                  | "Checkbox"
                  | "URL"
                  | "TextArea"
                  | "MarkdownText"
                  | "Integer"
              ] || DefaultField;
            return (
              <div key={field.id}>
                <FieldComponent field={field} disabled />
              </div>
            );
          }
        })}
      </div>
    </StyledForm>
  );
};

export default RequestItemForm;

const StyledForm = styled(Form)`
  padding: 16px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #fff;
  label {
    width: 100%;
    display: flex;
  }
`;
