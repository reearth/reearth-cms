import styled from "@emotion/styled";
import { useCallback, useEffect, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Dropdown, { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import MarkdownInput from "@reearth-cms/components/atoms/Markdown";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Select from "@reearth-cms/components/atoms/Select";
import Switch from "@reearth-cms/components/atoms/Switch";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import AssetItem from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import MultiValueAsset from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueAsset";
import MultiValueSelect from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueSelect";
import MultiValueSwitch from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueSwitch";
import FieldTitle from "@reearth-cms/components/molecules/Content/Form/FieldTitle";
import ReferenceFormItem from "@reearth-cms/components/molecules/Content/Form/ReferenceFormItem";
import LinkItemRequestModal from "@reearth-cms/components/molecules/Content/LinkItemRequestModal/LinkItemRequestModal";
import PublishItemModal from "@reearth-cms/components/molecules/Content/PublishItemModal";
import RequestCreationModal from "@reearth-cms/components/molecules/Content/RequestCreationModal";
import { FormItem, ItemField } from "@reearth-cms/components/molecules/Content/types";
import { Request, RequestState } from "@reearth-cms/components/molecules/Request/types";
import { FieldType, Model } from "@reearth-cms/components/molecules/Schema/types";
import { Member } from "@reearth-cms/components/molecules/Workspace/types";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Asset/AssetList/hooks";
import { useT } from "@reearth-cms/i18n";
import { validateURL } from "@reearth-cms/utils/regex";

export interface Props {
  linkedItemsModalList?: FormItem[];
  showPublishAction?: boolean;
  requests: Request[];
  itemId?: string;
  formItemsData: FormItem[];
  initialFormValues: any;
  loading: boolean;
  model?: Model;
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadUrl: { url: string; autoUnzip: boolean };
  uploadType: UploadType;
  requestModalShown: boolean;
  requestCreationLoading: boolean;
  addItemToRequestModalShown: boolean;
  workspaceUserMembers: Member[];
  totalCount: number;
  page: number;
  pageSize: number;
  requestModalLoading: boolean;
  requestModalTotalCount: number;
  requestModalPage: number;
  requestModalPageSize: number;
  linkItemModalTotalCount: number;
  linkItemModalPage: number;
  linkItemModalPageSize: number;
  onReferenceModelUpdate: (modelId?: string) => void;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
  onRequestTableChange: (page: number, pageSize: number) => void;
  onAssetTableChange: (
    page: number,
    pageSize: number,
    sorter?: { type?: AssetSortType; direction?: SortDirection },
  ) => void;
  onUploadModalCancel: () => void;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  onItemCreate: (data: { schemaId: string; fields: ItemField[] }) => Promise<void>;
  onItemUpdate: (data: { itemId: string; fields: ItemField[] }) => Promise<void>;
  onBack: (modelId?: string) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsReload: () => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onUnpublish: (itemIds: string[]) => Promise<void>;
  onPublish: (itemIds: string[]) => Promise<void>;
  onRequestCreate: (data: {
    title: string;
    description: string;
    state: RequestState;
    reviewersId: string[];
    items: {
      itemId: string;
    }[];
  }) => Promise<void>;
  onChange: (request: Request, itemIds: string[]) => void;
  onModalClose: () => void;
  onModalOpen: () => void;
  onAddItemToRequestModalClose: () => void;
  onAddItemToRequestModalOpen: () => void;
}

const ContentForm: React.FC<Props> = ({
  linkedItemsModalList,
  showPublishAction,
  requests,
  itemId,
  model,
  formItemsData,
  initialFormValues,
  loading,
  assetList,
  fileList,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  requestModalShown,
  addItemToRequestModalShown,
  workspaceUserMembers,
  totalCount,
  page,
  pageSize,
  onRequestTableChange,
  requestModalLoading,
  requestModalTotalCount,
  requestModalPage,
  requestModalPageSize,
  requestCreationLoading,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  onReferenceModelUpdate,
  onLinkItemTableChange,
  onPublish,
  onUnpublish,
  onAssetTableChange,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onItemCreate,
  onItemUpdate,
  onBack,
  onAssetsReload,
  onAssetSearchTerm,
  setFileList,
  setUploadModalVisibility,
  onRequestCreate,
  onChange,
  onModalClose,
  onModalOpen,
  onAddItemToRequestModalClose,
  onAddItemToRequestModalOpen,
}) => {
  const t = useT();
  const { Option } = Select;
  const [form] = Form.useForm();
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  useEffect(() => {
    form.setFieldsValue(initialFormValues);
  }, [form, initialFormValues]);

  const handleBack = useCallback(() => {
    onBack(model?.id);
  }, [onBack, model]);

  const unpublishedItems = useMemo(
    () => formItemsData?.filter(item => item.status !== "PUBLIC") ?? [],
    [formItemsData],
  );

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

  const items: MenuProps["items"] = [
    {
      key: "addToRequest",
      label: t("Add to Request"),
      onClick: onAddItemToRequestModalOpen,
    },
    {
      key: "unpublish",
      label: t("Unpublish"),
      onClick: () => itemId && onUnpublish([itemId]),
    },
  ];

  const handlePublishSubmit = useCallback(async () => {
    if (!itemId || !unpublishedItems) return;
    if (unpublishedItems.length === 0) {
      onPublish([itemId]);
    } else {
      setPublishModalOpen(true);
    }
  }, [itemId, unpublishedItems, onPublish, setPublishModalOpen]);

  const handlePublishItemClose = useCallback(() => {
    setPublishModalOpen(false);
  }, [setPublishModalOpen]);

  return (
    <>
      <StyledForm form={form} layout="vertical" initialValues={initialFormValues}>
        <PageHeader
          title={model?.name}
          onBack={handleBack}
          extra={
            <>
              <Button htmlType="submit" onClick={handleSubmit} loading={loading}>
                {t("Save")}
              </Button>
              {itemId && (
                <>
                  {showPublishAction && (
                    <Button type="primary" onClick={handlePublishSubmit}>
                      {t("Publish")}
                    </Button>
                  )}
                  <Button type="primary" onClick={onModalOpen}>
                    {t("New Request")}
                  </Button>
                  <Dropdown menu={{ items }} trigger={["click"]}>
                    <Button>
                      <Icon icon="ellipsis" />
                    </Button>
                  </Dropdown>
                </>
              )}
            </>
          }
        />
        <FormItemsWrapper>
          {model?.schema.fields.map(field =>
            field.type === "TextArea" ? (
              <Form.Item
                key={field.id}
                extra={field.description}
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                ]}
                name={field.id}
                label={<FieldTitle title={field.title} isUnique={field.unique} />}>
                {field.multiple ? (
                  <MultiValueField
                    rows={3}
                    showCount
                    maxLength={field.typeProperty.maxLength ?? false}
                    FieldInput={TextArea}
                  />
                ) : (
                  <TextArea rows={3} showCount maxLength={field.typeProperty.maxLength ?? false} />
                )}
              </Form.Item>
            ) : field.type === "MarkdownText" ? (
              <Form.Item
                key={field.id}
                extra={field.description}
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                ]}
                name={field.id}
                label={<FieldTitle title={field.title} isUnique={field.unique} />}>
                {field.multiple ? (
                  <MultiValueField
                    maxLength={field.typeProperty.maxLength ?? false}
                    FieldInput={MarkdownInput}
                  />
                ) : (
                  <MarkdownInput maxLength={field.typeProperty.maxLength ?? false} />
                )}
              </Form.Item>
            ) : field.type === "Integer" ? (
              <Form.Item
                key={field.id}
                extra={field.description}
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                ]}
                name={field.id}
                label={<FieldTitle title={field.title} isUnique={field.unique} />}>
                {field.multiple ? (
                  <MultiValueField
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
                key={field.id}
                extra={field.description}
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                ]}
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
                    totalCount={totalCount}
                    page={page}
                    pageSize={pageSize}
                    onAssetTableChange={onAssetTableChange}
                    onUploadModalCancel={onUploadModalCancel}
                    setUploadUrl={setUploadUrl}
                    setUploadType={setUploadType}
                    onAssetsCreate={onAssetsCreate}
                    onAssetCreateFromUrl={onAssetCreateFromUrl}
                    onAssetsReload={onAssetsReload}
                    onAssetSearchTerm={onAssetSearchTerm}
                    setFileList={setFileList}
                    setUploadModalVisibility={setUploadModalVisibility}
                  />
                ) : (
                  <AssetItem
                    key={field.id}
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
                    onAssetsReload={onAssetsReload}
                    onAssetSearchTerm={onAssetSearchTerm}
                    setFileList={setFileList}
                    setUploadModalVisibility={setUploadModalVisibility}
                  />
                )}
              </Form.Item>
            ) : field.type === "Select" ? (
              <Form.Item
                key={field.id}
                extra={field.description}
                name={field.id}
                label={<FieldTitle title={field.title} isUnique={field.unique} />}>
                {field.multiple ? (
                  <MultiValueSelect selectedValues={field.typeProperty?.values} />
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
            ) : field.type === "Bool" ? (
              <Form.Item
                key={field.id}
                extra={field.description}
                name={field.id}
                valuePropName="checked"
                label={<FieldTitle title={field.title} isUnique={field.unique} />}>
                {field.multiple ? <MultiValueSwitch /> : <Switch />}
              </Form.Item>
            ) : field.type === "Reference" ? (
              <Form.Item
                key={field.id}
                extra={field.description}
                name={field.id}
                label={<FieldTitle title={field.title} isUnique={field.unique} />}>
                <ReferenceFormItem
                  key={field.id}
                  formItemsData={formItemsData}
                  modelId={field.typeProperty.modelId}
                  onReferenceModelUpdate={onReferenceModelUpdate}
                  linkedItemsModalList={linkedItemsModalList}
                  linkItemModalTotalCount={linkItemModalTotalCount}
                  linkItemModalPage={linkItemModalPage}
                  linkItemModalPageSize={linkItemModalPageSize}
                  onLinkItemTableChange={onLinkItemTableChange}
                />
              </Form.Item>
            ) : field.type === "URL" ? (
              <Form.Item
                key={field.id}
                extra={field.description}
                name={field.id}
                label={<FieldTitle title={field.title} isUnique={field.unique} />}
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                  {
                    message: "URL is not valid",
                    validator: async (_, value) => {
                      if (value) {
                        if (
                          Array.isArray(value) &&
                          value.some(
                            (valueItem: string) => !validateURL(valueItem) && valueItem.length > 0,
                          )
                        )
                          return Promise.reject();
                        else if (!Array.isArray(value) && !validateURL(value) && value?.length > 0)
                          return Promise.reject();
                      }
                      return Promise.resolve();
                    },
                  },
                ]}>
                {field.multiple ? (
                  <MultiValueField
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
                key={field.id}
                extra={field.description}
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                ]}
                name={field.id}
                label={<FieldTitle title={field.title} isUnique={field.unique} />}>
                {field.multiple ? (
                  <MultiValueField
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
      {itemId && (
        <>
          <RequestCreationModal
            unpublishedItems={unpublishedItems}
            itemId={itemId}
            open={requestModalShown}
            onClose={onModalClose}
            onSubmit={onRequestCreate}
            requestCreationLoading={requestCreationLoading}
            workspaceUserMembers={workspaceUserMembers}
          />
          <LinkItemRequestModal
            itemIds={[itemId]}
            onChange={onChange}
            onLinkItemRequestModalCancel={onAddItemToRequestModalClose}
            visible={addItemToRequestModalShown}
            linkedRequest={undefined}
            requestList={requests}
            onRequestTableChange={onRequestTableChange}
            requestModalLoading={requestModalLoading}
            requestModalTotalCount={requestModalTotalCount}
            requestModalPage={requestModalPage}
            requestModalPageSize={requestModalPageSize}
          />
          <PublishItemModal
            unpublishedItems={unpublishedItems}
            itemId={itemId}
            open={publishModalOpen}
            onClose={handlePublishItemClose}
            onSubmit={onPublish}
          />
        </>
      )}
    </>
  );
};

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

export default ContentForm;
