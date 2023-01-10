import styled from "@emotion/styled";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import MarkdownInput from "@reearth-cms/components/atoms/Markdown";
import Select from "@reearth-cms/components/atoms/Select";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import AssetItem from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import MultiValueAsset from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueAsset";
import MultiValueSelect from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueSelect";
import FieldTitle from "@reearth-cms/components/molecules/Content/Form/FieldTitle";

export interface Props {
  initialFormValues: any;
  schema?: any;
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadUrl: string;
  uploadType: UploadType;
  onUploadModalCancel: () => void;
  setUploadUrl: (url: string) => void;
  setUploadType: (type: UploadType) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string) => Promise<Asset | undefined>;
  onAssetsReload: () => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onNavigateToAsset: (asset: Asset) => void;
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
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetsReload,
  onAssetSearchTerm,
  setFileList,
  setUploadModalVisibility,
  onNavigateToAsset,
}) => {
  const { Option } = Select;
  const [form] = Form.useForm();
  return (
    <StyledForm form={form} disabled={true} layout="vertical" initialValues={initialFormValues}>
      <FormItemsWrapper>
        {schema?.fields.map((field: any) =>
          field.type === "TextArea" ? (
            <Form.Item
              extra={field.description}
              name={field.id}
              label={<FieldTitle title={field.title} isUnique={field.unique} />}>
              {field.multiple ? (
                <MultiValueField
                  disabled={true}
                  rows={3}
                  showCount
                  maxLength={field.typeProperty.maxLength ?? false}
                  FieldInput={TextArea}
                />
              ) : (
                <TextArea
                  disabled={true}
                  rows={3}
                  showCount
                  maxLength={field.typeProperty.maxLength ?? false}
                />
              )}
            </Form.Item>
          ) : field.type === "MarkdownText" ? (
            <Form.Item
              extra={field.description}
              name={field.id}
              label={<FieldTitle title={field.title} isUnique={field.unique} />}>
              {field.multiple ? (
                <MultiValueField
                  disabled={true}
                  maxLength={field.typeProperty.maxLength ?? false}
                  FieldInput={MarkdownInput}
                />
              ) : (
                <MarkdownInput disabled={true} maxLength={field.typeProperty.maxLength ?? false} />
              )}
            </Form.Item>
          ) : field.type === "Integer" ? (
            <Form.Item
              extra={field.description}
              name={field.id}
              label={<FieldTitle title={field.title} isUnique={field.unique} />}>
              {field.multiple ? (
                <MultiValueField
                  disabled={true}
                  type="number"
                  min={field.typeProperty.min}
                  max={field.typeProperty.max}
                  FieldInput={InputNumber}
                />
              ) : (
                <InputNumber
                  type="number"
                  min={field.typeProperty.min}
                  max={field.typeProperty.max}
                />
              )}
            </Form.Item>
          ) : field.type === "Asset" ? (
            <Form.Item
              extra={field.description}
              name={field.id}
              label={<FieldTitle title={field.title} isUnique={field.unique} />}>
              {field.multiple ? (
                <MultiValueAsset
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
                  onAssetsReload={onAssetsReload}
                  onAssetSearchTerm={onAssetSearchTerm}
                  setFileList={setFileList}
                  setUploadModalVisibility={setUploadModalVisibility}
                  onNavigateToAsset={onNavigateToAsset}
                />
              ) : (
                <AssetItem
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
                  onAssetsReload={onAssetsReload}
                  onAssetSearchTerm={onAssetSearchTerm}
                  setFileList={setFileList}
                  setUploadModalVisibility={setUploadModalVisibility}
                  onNavigateToAsset={onNavigateToAsset}
                />
              )}
            </Form.Item>
          ) : field.type === "Select" ? (
            <Form.Item
              extra={field.description}
              name={field.id}
              label={<FieldTitle title={field.title} isUnique={field.unique} />}>
              {field.multiple ? (
                <MultiValueSelect disabled={true} selectedValues={field.typeProperty?.values} />
              ) : (
                <Select allowClear>
                  {field.typeProperty?.values?.map((value: string) => (
                    <Option key={value} value={value}>
                      {value}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : field.type === "URL" ? (
            <Form.Item
              extra={field.description}
              name={field.id}
              label={<FieldTitle title={field.title} isUnique={field.unique} />}>
              {field.multiple ? (
                <MultiValueField
                  disabled={true}
                  showCount={true}
                  maxLength={field.typeProperty.maxLength ?? 500}
                  FieldInput={Input}
                />
              ) : (
                <Input showCount={true} maxLength={field.typeProperty.maxLength ?? 500} />
              )}
            </Form.Item>
          ) : (
            <Form.Item
              extra={field.description}
              name={field.id}
              label={<FieldTitle title={field.title} isUnique={field.unique} />}>
              {field.multiple ? (
                <MultiValueField
                  disabled={true}
                  showCount={true}
                  maxLength={field.typeProperty.maxLength ?? 500}
                  FieldInput={Input}
                />
              ) : (
                <Input showCount={true} maxLength={field.typeProperty.maxLength ?? 500} />
              )}
            </Form.Item>
          ),
        )}
      </FormItemsWrapper>
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
`;

const FormItemsWrapper = styled.div`
  width: 50%;
  @media (max-width: 1200px) {
    width: 100%;
  }
`;
