import styled from "@emotion/styled";
import { useCallback, useEffect, Dispatch, SetStateAction } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Select from "@reearth-cms/components/atoms/Select";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import AssetItem from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import { ItemField } from "@reearth-cms/components/molecules/Content/types";
import { FieldType, Model } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { validateURL } from "@reearth-cms/utils/regex";

export interface Props {
  itemId?: string;
  initialFormValues: any;
  loading: boolean;
  model?: Model;
  onItemCreate: (data: { schemaId: string; fields: ItemField[] }) => Promise<void>;
  onItemUpdate: (data: { itemId: string; fields: ItemField[] }) => Promise<void>;
  onBack: (modelId?: string) => void;
  assetList: Asset[];
  onAssetSearchTerm: (term?: string | undefined) => void;
  onAssetsReload: () => void;
  loadingAssets: boolean;
  createAssets: (files: UploadFile[]) => Promise<void>;
  fileList: UploadFile[];
  setFileList: Dispatch<SetStateAction<UploadFile<File>[]>>;
  setUploading: Dispatch<SetStateAction<boolean>>;
  setUploadModalVisibility: Dispatch<SetStateAction<boolean>>;
  uploading: boolean;
  uploadModalVisibility: boolean;
}

const ContentForm: React.FC<Props> = ({
  itemId,
  model,
  initialFormValues,
  loading,
  onItemCreate,
  onItemUpdate,
  onBack,
  assetList,
  onAssetSearchTerm,
  onAssetsReload,
  loadingAssets,
  createAssets,
  fileList,
  setFileList,
  setUploading,
  setUploadModalVisibility,
  uploading,
  uploadModalVisibility,
}) => {
  const t = useT();
  const { Option } = Select;

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(initialFormValues);
  }, [form, initialFormValues]);

  const handleBack = useCallback(() => {
    onBack(model?.id);
  }, [onBack, model]);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const fields: { schemaFieldId: string; type: FieldType; value: string }[] = [];
      for (const [key, value] of Object.entries(values)) {
        fields.push({
          value: (value || "") as string,
          schemaFieldId: key,
          type: model?.schema.fields.find(field => field.id === key)?.type as FieldType,
        });
      }
      if (!itemId) {
        await onItemCreate?.({ schemaId: model?.schema.id as string, fields });
      } else {
        await onItemUpdate?.({ itemId: itemId as string, fields });
      }
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  }, [form, model?.schema.fields, model?.schema.id, itemId, onItemCreate, onItemUpdate]);

  const handleLink = (_asset: Asset) => {
    // TODO: implement link asset with content
    console.log("link from content");
  };

  return (
    <Form form={form} layout="vertical" initialValues={initialFormValues}>
      <PageHeader
        title={model?.name}
        onBack={handleBack}
        extra={
          <Button htmlType="submit" onClick={handleSubmit} loading={loading}>
            {t("Save")}
          </Button>
        }
      />
      <FormItemsWrapper>
        {model?.schema.fields.map(field =>
          field.type === "TextArea" || field.type === "MarkdownText" ? (
            <Form.Item
              extra={field.description}
              rules={[
                {
                  required: field.required,
                  message: t("Please input field!"),
                },
              ]}
              name={field.id}
              label={field.title}>
              <TextArea rows={3} showCount maxLength={field.typeProperty.maxLength ?? 500} />
            </Form.Item>
          ) : field.type === "Integer" ? (
            <Form.Item
              extra={field.description}
              rules={[
                {
                  required: field.required,
                  message: t("Please input field!"),
                },
              ]}
              name={field.id}
              label={field.title}>
              <InputNumber
                type="number"
                min={field.typeProperty.min}
                max={field.typeProperty.max}
              />
            </Form.Item>
          ) : field.type === "Asset" ? (
            <AssetItem
              extra={field.description}
              rules={[
                {
                  required: field.required,
                  message: t("Please input field!"),
                },
              ]}
              name={field.id}
              label={field.title}
              assetList={assetList}
              onAssetSearchTerm={onAssetSearchTerm}
              onAssetsReload={onAssetsReload}
              loadingAssets={loadingAssets}
              createAssets={createAssets}
              fileList={fileList}
              setFileList={setFileList}
              setUploading={setUploading}
              setUploadModalVisibility={setUploadModalVisibility}
              uploading={uploading}
              uploadModalVisibility={uploadModalVisibility}
              onLink={handleLink}
            />
          ) : field.type === "Select" ? (
            <Form.Item extra={field.description} name={field.id} label={field.title}>
              <Select>
                {field.typeProperty?.values?.map((value: string) => (
                  <Option key={value} value={value}>
                    {value}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ) : field.type === "URL" ? (
            <Form.Item
              extra={field.description}
              name={field.id}
              label={field.title}
              rules={[
                {
                  required: field.required,
                  message: t("Please input field!"),
                },
                {
                  message: "URL is not valid",
                  validator: async (_, value) => {
                    if (!validateURL(value) && value.length > 0) return Promise.reject();
                    return Promise.resolve();
                  },
                },
              ]}>
              <Input showCount={true} maxLength={field.typeProperty.maxLength ?? 500} />
            </Form.Item>
          ) : (
            <Form.Item
              extra={field.description}
              rules={[
                {
                  required: field.required,
                  message: t("Please input field!"),
                },
              ]}
              name={field.id}
              label={field.title}>
              <Input showCount={true} maxLength={field.typeProperty.maxLength ?? 500} />
            </Form.Item>
          ),
        )}
      </FormItemsWrapper>
    </Form>
  );
};

const FormItemsWrapper = styled.div`
  width: 50%;
  @media (max-width: 1200px) {
    width: 100%;
  }
`;

export default ContentForm;
