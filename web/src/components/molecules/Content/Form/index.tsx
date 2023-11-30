import styled from "@emotion/styled";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useBlocker } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import DatePicker from "@reearth-cms/components/atoms/DatePicker";
import Dropdown, { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import MarkdownInput from "@reearth-cms/components/atoms/Markdown";
import Notification from "@reearth-cms/components/atoms/Notification";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Select from "@reearth-cms/components/atoms/Select";
import Space from "@reearth-cms/components/atoms/Space";
import Switch from "@reearth-cms/components/atoms/Switch";
import Tag from "@reearth-cms/components/atoms/Tag";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import GroupItem from "@reearth-cms/components/molecules//Common/Form/GroupItem";
import MultiValueGroup from "@reearth-cms/components/molecules//Common/MultiValueField/MultiValueGroup";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import AssetItem from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import MultiValueAsset from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueAsset";
import MultiValueBooleanField from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueBooleanField";
import MultiValueSelect from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueSelect";
import FieldTitle from "@reearth-cms/components/molecules/Content/Form/FieldTitle";
import ReferenceFormItem from "@reearth-cms/components/molecules/Content/Form/ReferenceFormItem";
import ContentSidebarWrapper from "@reearth-cms/components/molecules/Content/Form/SidebarWrapper";
import LinkItemRequestModal from "@reearth-cms/components/molecules/Content/LinkItemRequestModal/LinkItemRequestModal";
import PublishItemModal from "@reearth-cms/components/molecules/Content/PublishItemModal";
import RequestCreationModal from "@reearth-cms/components/molecules/Content/RequestCreationModal";
import { Item, FormItem, ItemField } from "@reearth-cms/components/molecules/Content/types";
import { Request, RequestState } from "@reearth-cms/components/molecules/Request/types";
import { FieldType, Group, Model } from "@reearth-cms/components/molecules/Schema/types";
import { Member } from "@reearth-cms/components/molecules/Workspace/types";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Asset/AssetList/hooks";
import { useT } from "@reearth-cms/i18n";
import { transformMomentToString } from "@reearth-cms/utils/format";
import { validateURL } from "@reearth-cms/utils/regex";

export interface Props {
  item?: Item;
  groups?: Group[];
  linkedItemsModalList?: FormItem[];
  showPublishAction?: boolean;
  requests: Request[];
  itemId?: string;
  formItemsData: FormItem[];
  initialFormValues: any;
  initialMetaFormValues: any;
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
  linkItemModalTitle: string;
  linkItemModalTotalCount: number;
  linkItemModalPage: number;
  linkItemModalPageSize: number;
  onReferenceModelUpdate: (modelId?: string) => void;
  onSearchTerm: (term?: string) => void;
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
  onItemCreate: (data: {
    schemaId: string;
    metaSchemaId: string;
    fields: ItemField[];
    metaFields: ItemField[];
  }) => Promise<void>;
  onItemUpdate: (data: { itemId: string; fields: ItemField[] }) => Promise<void>;
  onMetaItemUpdate: (data: {
    itemId: string;
    metaItemId?: string;
    metaSchemaId: string;
    fields: ItemField[];
    metaFields: ItemField[];
  }) => Promise<void>;
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
  item,
  groups,
  linkedItemsModalList,
  showPublishAction,
  requests,
  itemId,
  model,
  formItemsData,
  initialFormValues,
  initialMetaFormValues,
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
  linkItemModalTitle,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  onReferenceModelUpdate,
  onSearchTerm,
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
  onMetaItemUpdate,
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
  const [metaForm] = Form.useForm();
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const changedKeys = useRef(new Set<string>());

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      currentLocation.pathname !== nextLocation.pathname && changedKeys.current.size > 0,
  );

  const handleValuesChange = useCallback(
    (changedValues: any) => {
      const [key, value] = Object.entries(changedValues)[0];
      if (
        (!value && !initialFormValues[key]) ||
        JSON.stringify(value) === JSON.stringify(initialFormValues[key])
      ) {
        changedKeys.current.delete(key);
      } else if (Array.isArray(value) && value.length === 0) {
        return;
      } else {
        changedKeys.current.add(key);
      }
    },
    [initialFormValues],
  );

  useEffect(() => {
    const openNotification = () => {
      const key = `open${Date.now()}`;
      const btn = (
        <Space>
          <Button
            onClick={() => {
              Notification.close(key);
              blocker.reset?.();
            }}>
            {t("Cancel")}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              Notification.close(key);
              blocker.proceed?.();
            }}>
            {t("Leave")}
          </Button>
        </Space>
      );
      Notification.config({
        maxCount: 1,
      });

      Notification.info({
        message: t("This item has unsaved data"),
        description: t("Are you going to leave?"),
        btn,
        key,
        placement: "top",
        // TODO: Change to false when antd is updated
        closeIcon: <span />,
      });
    };
    if (blocker.state === "blocked") {
      openNotification();
    }
  }, [t, blocker]);

  useEffect(() => {
    const handleBeforeUnloadEvent = (event: BeforeUnloadEvent) => {
      if (changedKeys.current.size === 0) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnloadEvent, true);
    return () => window.removeEventListener("beforeunload", handleBeforeUnloadEvent, true);
  }, []);

  useEffect(() => {
    form.setFieldsValue(initialFormValues);
  }, [form, initialFormValues]);

  useEffect(() => {
    metaForm.setFieldsValue(initialMetaFormValues);
  }, [metaForm, initialMetaFormValues]);

  const handleBack = useCallback(() => {
    onBack(model?.id);
  }, [onBack, model]);

  const unpublishedItems = useMemo(
    () => formItemsData?.filter(item => item.status !== "PUBLIC") ?? [],
    [formItemsData],
  );

  const handleSubmit = useCallback(async () => {
    try {
      const modelFieldTypes = new Map(
        (model?.schema.fields || []).map(field => [field.id, field.type]),
      );
      const groupIdsInCurrentModel = new Set();
      model?.schema.fields?.forEach(field => {
        if (field.type === "Group") groupIdsInCurrentModel.add(field.typeProperty?.groupId);
      });
      const groupFieldTypes = new Map();
      groups
        ?.filter(group => groupIdsInCurrentModel.has(group.id))
        .forEach(group => {
          group?.schema.fields?.forEach(field => groupFieldTypes.set(field.id, field.type));
        });
      const values = await form.validateFields();
      const metaValues = await metaForm.validateFields();
      const fields: {
        schemaFieldId: string;
        itemGroupId?: string;
        type: FieldType;
        value: string;
      }[] = [];
      const metaFields: { schemaFieldId: string; type: FieldType; value: string }[] = [];
      // TODO: improve performance
      for (const [key, value] of Object.entries(values)) {
        const isGroup =
          typeof value === "object" && !Array.isArray(value) && !moment.isMoment(value);
        // group fields
        if (value && isGroup) {
          for (const [key1, value1] of Object.entries(value)) {
            const type1 = groupFieldTypes.get(key) || "";
            fields.push({
              value: (moment.isMoment(value1)
                ? transformMomentToString(value1)
                : value1 ?? "") as string,
              schemaFieldId: key,
              itemGroupId: key1,
              type: type1 as FieldType,
            });
          }
          continue;
        }
        // model fields
        const type = modelFieldTypes.get(key) || "";
        fields.push({
          value: (moment.isMoment(value) ? transformMomentToString(value) : value ?? "") as string,
          schemaFieldId: key,
          type: type as FieldType,
        });
      }
      for (const [key, value] of Object.entries(metaValues)) {
        metaFields.push({
          value: (moment.isMoment(value) ? transformMomentToString(value) : value ?? "") as string,
          schemaFieldId: key,
          type: model?.metadataSchema?.fields?.find(field => field.id === key)?.type as FieldType,
        });
      }
      changedKeys.current.clear();
      if (!itemId) {
        await onItemCreate?.({
          schemaId: model?.schema.id as string,
          metaSchemaId: model?.metadataSchema?.id as string,
          metaFields,
          fields,
        });
      } else {
        await onItemUpdate?.({
          itemId: itemId as string,
          fields,
        });
      }
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  }, [
    model?.schema.fields,
    model?.schema.id,
    model?.metadataSchema?.fields,
    model?.metadataSchema?.id,
    groups,
    form,
    metaForm,
    itemId,
    onItemCreate,
    onItemUpdate,
  ]);

  const handleMetaUpdate = useCallback(async () => {
    if (!itemId) return;
    try {
      const values = await form.validateFields();
      const metaValues = await metaForm.validateFields();
      const fields: { schemaFieldId: string; type: FieldType; value: string }[] = [];
      const metaFields: { schemaFieldId: string; type: FieldType; value: string }[] = [];
      for (const [key, value] of Object.entries(values)) {
        fields.push({
          value: (moment.isMoment(value) ? transformMomentToString(value) : value ?? "") as string,
          schemaFieldId: key,
          type: model?.schema.fields.find(field => field.id === key)?.type as FieldType,
        });
      }
      for (const [key, value] of Object.entries(metaValues)) {
        metaFields.push({
          value: (moment.isMoment(value) ? transformMomentToString(value) : value ?? "") as string,
          schemaFieldId: key,
          type: model?.metadataSchema?.fields?.find(field => field.id === key)?.type as FieldType,
        });
      }
      await onMetaItemUpdate?.({
        itemId: itemId,
        metaSchemaId: model?.metadataSchema?.id as string,
        metaItemId: item?.metadata.id,
        fields,
        metaFields,
      });
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  }, [
    form,
    model?.schema.fields,
    item?.metadata?.id,
    model?.metadataSchema?.id,
    itemId,
    metaForm,
    model?.metadataSchema?.fields,
    onMetaItemUpdate,
  ]);

  const items: MenuProps["items"] = useMemo(() => {
    const menuItems = [
      {
        key: "addToRequest",
        label: t("Add to Request"),
        onClick: onAddItemToRequestModalOpen,
      },
      {
        key: "unpublish",
        label: t("Unpublish"),
        onClick: () => itemId && (onUnpublish([itemId]) as any),
      },
    ];
    if (showPublishAction) {
      menuItems.unshift({
        key: "NewRequest",
        label: t("New Request"),
        onClick: onModalOpen,
      });
    }
    return menuItems;
  }, [itemId, showPublishAction, onAddItemToRequestModalOpen, onUnpublish, onModalOpen, t]);

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
      <StyledForm
        form={form}
        layout="vertical"
        initialValues={initialFormValues}
        onValuesChange={handleValuesChange}>
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
                  {!showPublishAction && (
                    <Button type="primary" onClick={onModalOpen}>
                      {t("New Request")}
                    </Button>
                  )}
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
              <StyledFormItem
                key={field.id}
                extra={field.description}
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                ]}
                name={field.id}
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }>
                {field.multiple ? (
                  <MultiValueField
                    rows={3}
                    showCount
                    maxLength={field.typeProperty?.maxLength}
                    FieldInput={TextArea}
                  />
                ) : (
                  <TextArea rows={3} showCount maxLength={field.typeProperty?.maxLength} />
                )}
              </StyledFormItem>
            ) : field.type === "MarkdownText" ? (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                ]}
                name={field.id}
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }>
                {field.multiple ? (
                  <MultiValueField
                    maxLength={field.typeProperty?.maxLength}
                    FieldInput={MarkdownInput}
                  />
                ) : (
                  <MarkdownInput maxLength={field.typeProperty?.maxLength} />
                )}
              </StyledFormItem>
            ) : field.type === "Integer" ? (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                ]}
                name={field.id}
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }>
                {field.multiple ? (
                  <MultiValueField
                    type="number"
                    min={field.typeProperty?.min}
                    max={field.typeProperty?.max}
                    FieldInput={InputNumber}
                  />
                ) : (
                  <InputNumber
                    type="number"
                    min={field.typeProperty?.min}
                    max={field.typeProperty?.max}
                  />
                )}
              </StyledFormItem>
            ) : field.type === "Asset" ? (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                ]}
                name={field.id}
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }>
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
              </StyledFormItem>
            ) : field.type === "Select" ? (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                name={field.id}
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }
                rules={[
                  {
                    required: field.required,
                    message: t("Please select an option!"),
                  },
                ]}>
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
              </StyledFormItem>
            ) : field.type === "Date" ? (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                name={field.id}
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                ]}
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }>
                {field.multiple ? (
                  <MultiValueField type="date" FieldInput={StyledDatePicker} />
                ) : (
                  <StyledDatePicker />
                )}
              </StyledFormItem>
            ) : field.type === "Bool" ? (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                name={field.id}
                valuePropName="checked"
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }>
                {field.multiple ? <MultiValueBooleanField FieldInput={Switch} /> : <Switch />}
              </StyledFormItem>
            ) : field.type === "Reference" ? (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                name={field.id}
                label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />}>
                <ReferenceFormItem
                  key={field.id}
                  correspondingFieldId={field.id}
                  formItemsData={formItemsData}
                  modelId={field.typeProperty?.modelId}
                  onReferenceModelUpdate={onReferenceModelUpdate}
                  linkItemModalTitle={linkItemModalTitle}
                  linkedItemsModalList={linkedItemsModalList}
                  linkItemModalTotalCount={linkItemModalTotalCount}
                  linkItemModalPage={linkItemModalPage}
                  linkItemModalPageSize={linkItemModalPageSize}
                  onSearchTerm={onSearchTerm}
                  onLinkItemTableChange={onLinkItemTableChange}
                />
              </StyledFormItem>
            ) : field.type === "URL" ? (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                name={field.id}
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }
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
                    maxLength={field.typeProperty?.maxLength ?? 500}
                    FieldInput={Input}
                  />
                ) : (
                  <Input showCount={true} maxLength={field.typeProperty?.maxLength ?? 500} />
                )}
              </StyledFormItem>
            ) : field.type === "Group" ? (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                name={field.id}
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }>
                {field.multiple ? (
                  <MultiValueGroup
                    parentField={field}
                    form={form}
                    groups={groups}
                    linkedItemsModalList={linkedItemsModalList}
                    formItemsData={formItemsData}
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
                    linkItemModalTotalCount={linkItemModalTotalCount}
                    linkItemModalPage={linkItemModalPage}
                    linkItemModalPageSize={linkItemModalPageSize}
                    onReferenceModelUpdate={onReferenceModelUpdate}
                    onLinkItemTableChange={onLinkItemTableChange}
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
                  <GroupItem
                    parentField={field}
                    linkedItemsModalList={linkedItemsModalList}
                    formItemsData={formItemsData}
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
                    linkItemModalTotalCount={linkItemModalTotalCount}
                    linkItemModalPage={linkItemModalPage}
                    linkItemModalPageSize={linkItemModalPageSize}
                    onReferenceModelUpdate={onReferenceModelUpdate}
                    onLinkItemTableChange={onLinkItemTableChange}
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
              </StyledFormItem>
            ) : (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                ]}
                name={field.id}
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }>
                {field.multiple ? (
                  <MultiValueField
                    showCount={true}
                    maxLength={field.typeProperty?.maxLength ?? 500}
                    FieldInput={Input}
                  />
                ) : (
                  <Input showCount={true} maxLength={field.typeProperty?.maxLength ?? 500} />
                )}
              </StyledFormItem>
            ),
          )}
        </FormItemsWrapper>
      </StyledForm>
      <SideBarWrapper>
        <Form form={metaForm} layout="vertical" initialValues={initialMetaFormValues}>
          <ContentSidebarWrapper item={item} />
          {model?.metadataSchema?.fields?.map(field =>
            field.type === "Tag" ? (
              <MetaFormItemWrapper key={field.id}>
                <Form.Item
                  extra={field.description}
                  name={field.id}
                  label={
                    <FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />
                  }>
                  {field.multiple ? (
                    <StyledMultipleSelect
                      onBlur={handleMetaUpdate}
                      mode="multiple"
                      showArrow
                      style={{ width: "100%" }}>
                      {field.typeProperty?.tags?.map(
                        (tag: { id: string; name: string; color: string }) => (
                          <Select.Option key={tag.name} value={tag.id}>
                            <Tag color={tag.color.toLowerCase()}>{tag.name}</Tag>
                          </Select.Option>
                        ),
                      )}
                    </StyledMultipleSelect>
                  ) : (
                    <Select
                      onBlur={handleMetaUpdate}
                      showArrow
                      style={{ width: "100%" }}
                      allowClear>
                      {field.typeProperty?.tags?.map(
                        (tag: { id: string; name: string; color: string }) => (
                          <Select.Option key={tag.name} value={tag.id}>
                            <Tag color={tag.color.toLowerCase()}>{tag.name}</Tag>
                          </Select.Option>
                        ),
                      )}
                    </Select>
                  )}
                </Form.Item>
              </MetaFormItemWrapper>
            ) : field.type === "Date" ? (
              <MetaFormItemWrapper key={field.id}>
                <Form.Item
                  extra={field.description}
                  rules={[
                    {
                      required: field.required,
                      message: t("Please input field!"),
                    },
                  ]}
                  name={field.id}
                  label={
                    <FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />
                  }>
                  {field.multiple ? (
                    <MultiValueField
                      onBlur={handleMetaUpdate}
                      type="date"
                      FieldInput={StyledDatePicker}
                    />
                  ) : (
                    <StyledDatePicker onBlur={handleMetaUpdate} />
                  )}
                </Form.Item>
              </MetaFormItemWrapper>
            ) : field.type === "Bool" ? (
              <MetaFormItemWrapper key={field.id}>
                <Form.Item
                  extra={field.description}
                  name={field.id}
                  valuePropName="checked"
                  label={
                    <FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />
                  }>
                  {field.multiple ? (
                    <MultiValueBooleanField onChange={handleMetaUpdate} FieldInput={Switch} />
                  ) : (
                    <Switch onChange={handleMetaUpdate} />
                  )}
                </Form.Item>
              </MetaFormItemWrapper>
            ) : field.type === "Checkbox" ? (
              <MetaFormItemWrapper key={field.id}>
                <Form.Item
                  extra={field.description}
                  name={field.id}
                  valuePropName="checked"
                  label={
                    <FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />
                  }>
                  {field.multiple ? (
                    <MultiValueBooleanField onChange={handleMetaUpdate} FieldInput={Checkbox} />
                  ) : (
                    <Checkbox onChange={handleMetaUpdate} />
                  )}
                </Form.Item>
              </MetaFormItemWrapper>
            ) : field.type === "URL" ? (
              <MetaFormItemWrapper key={field.id}>
                <Form.Item
                  extra={field.description}
                  name={field.id}
                  label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />}
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
                              (valueItem: string) =>
                                !validateURL(valueItem) && valueItem.length > 0,
                            )
                          )
                            return Promise.reject();
                          else if (
                            !Array.isArray(value) &&
                            !validateURL(value) &&
                            value?.length > 0
                          )
                            return Promise.reject();
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}>
                  {field.multiple ? (
                    <MultiValueField
                      onBlur={handleMetaUpdate}
                      showCount={true}
                      maxLength={field.typeProperty?.maxLength ?? 500}
                      FieldInput={Input}
                    />
                  ) : (
                    <Input
                      onBlur={handleMetaUpdate}
                      showCount={true}
                      maxLength={field.typeProperty?.maxLength ?? 500}
                    />
                  )}
                </Form.Item>
              </MetaFormItemWrapper>
            ) : (
              <MetaFormItemWrapper key={field.id}>
                <Form.Item
                  extra={field.description}
                  rules={[
                    {
                      required: field.required,
                      message: t("Please input field!"),
                    },
                  ]}
                  name={field.id}
                  label={
                    <FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />
                  }>
                  {field.multiple ? (
                    <MultiValueField
                      onBlur={handleMetaUpdate}
                      showCount={true}
                      maxLength={field.typeProperty?.maxLength ?? 500}
                      FieldInput={Input}
                    />
                  ) : (
                    <Input
                      onBlur={handleMetaUpdate}
                      showCount={true}
                      maxLength={field.typeProperty?.maxLength ?? 500}
                    />
                  )}
                </Form.Item>
              </MetaFormItemWrapper>
            ),
          )}
        </Form>
      </SideBarWrapper>
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

const StyledFormItem = styled(Form.Item)`
  width: 500px;
  word-wrap: break-word;
`;

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

const FormItemsWrapper = styled.div`
  width: 50%;
  @media (max-width: 1200px) {
    width: 100%;
  }
`;

const SideBarWrapper = styled.div`
  background-color: #fafafa;
  padding: 8px;
  width: 400px;
`;

const MetaFormItemWrapper = styled.div`
  padding: 12px;
  margin-bottom: 8px;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 2px;
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
`;

const StyledMultipleSelect = styled(Select)`
  .ant-select-selection-overflow-item {
    margin-right: 4px;
  }
  .ant-select-selection-item {
    padding: 0;
    margin-right: 0;
    border: 0;
  }
  .ant-select-selection-item-content {
    margin-right: 0;
  }
  .ant-select-selection-item-remove {
    display: none;
  }
  .ant-tag {
    margin-right: 0;
  }
`;

export default ContentForm;
