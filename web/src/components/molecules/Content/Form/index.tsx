import styled from "@emotion/styled";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useBlocker } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import Dropdown, { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Form, { FormInstance, ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Notification from "@reearth-cms/components/atoms/Notification";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Space from "@reearth-cms/components/atoms/Space";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import { emptyConvert } from "@reearth-cms/components/molecules/Common/Form/utils";
import Metadata from "@reearth-cms/components/molecules/Content/Form/Metadata";
import LinkItemRequestModal from "@reearth-cms/components/molecules/Content/LinkItemRequestModal/LinkItemRequestModal";
import PublishItemModal from "@reearth-cms/components/molecules/Content/PublishItemModal";
import RequestCreationModal from "@reearth-cms/components/molecules/Content/RequestCreationModal";
import {
  Item,
  FormItem,
  ItemField,
  ItemValue,
  VersionedItem,
  FormValues,
} from "@reearth-cms/components/molecules/Content/types";
import { selectedTagIdsGet } from "@reearth-cms/components/molecules/Content/utils";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import {
  Request,
  RequestItem,
  RequestState,
} from "@reearth-cms/components/molecules/Request/types";
import { Group, Field } from "@reearth-cms/components/molecules/Schema/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";
import { transformDayjsToString, dateTimeFormat } from "@reearth-cms/utils/format";

import FieldWrapper from "./FieldWrapper";
import Versions from "./Versions";

const { TabPane } = Tabs;

type Props = {
  title: string;
  item?: Item;
  hasRequestCreateRight: boolean;
  hasRequestUpdateRight: boolean;
  hasPublishRight: boolean;
  hasItemUpdateRight: boolean;
  loadingReference: boolean;
  linkedItemsModalList?: FormItem[];
  showPublishAction: boolean;
  requests: Request[];
  itemId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialFormValues: Record<string, any>;
  initialMetaFormValues: Record<string, unknown>;
  versions: VersionedItem[];
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
  workspaceUserMembers: UserMember[];
  totalCount: number;
  page: number;
  pageSize: number;
  publishLoading: boolean;
  requestModalLoading: boolean;
  requestModalTotalCount: number;
  requestModalPage: number;
  requestModalPageSize: number;
  linkItemModalTitle: string;
  linkItemModalTotalCount: number;
  linkItemModalPage: number;
  linkItemModalPageSize: number;
  onReferenceModelUpdate: (modelId: string, referenceFieldId: string) => void;
  onSearchTerm: (term?: string) => void;
  onLinkItemTableReload: () => void;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
  onRequestTableChange: (page: number, pageSize: number) => void;
  onRequestSearchTerm: (term: string) => void;
  onRequestTableReload: () => void;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
  onUploadModalCancel: () => void;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  onItemCreate: (data: {
    schemaId: string;
    metaSchemaId?: string;
    fields: ItemField[];
    metaFields: ItemField[];
  }) => Promise<void>;
  onItemUpdate: (data: { itemId: string; fields: ItemField[] }) => Promise<void>;
  onMetaItemUpdate: (data: { metaItemId?: string; metaFields: ItemField[] }) => Promise<void>;
  onBack: () => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsGet: () => void;
  onAssetsReload: () => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onGetVersionedItem: (version: string) => Promise<FormValues>;
  onUnpublish: (itemIds: string[]) => Promise<void>;
  onPublish: (itemIds: string[]) => Promise<void>;
  onRequestCreate: (data: {
    title: string;
    description: string;
    state: RequestState;
    reviewersId: string[];
    items: RequestItem[];
  }) => Promise<void>;
  onChange: (request: Request, items: RequestItem[]) => Promise<void>;
  onModalClose: () => void;
  onModalOpen: () => void;
  onAddItemToRequestModalClose: () => void;
  onAddItemToRequestModalOpen: () => void;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
  onCheckItemReference: (
    itemId: string,
    correspondingFieldId: string,
    groupId?: string,
  ) => Promise<boolean>;
  onNavigateToRequest: (id: string) => void;
};

const ContentForm: React.FC<Props> = ({
  title,
  item,
  hasRequestCreateRight,
  hasRequestUpdateRight,
  hasPublishRight,
  hasItemUpdateRight,
  loadingReference,
  linkedItemsModalList,
  showPublishAction,
  requests,
  itemId,
  model,
  initialFormValues,
  initialMetaFormValues,
  versions,
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
  onLinkItemTableReload,
  onRequestTableChange,
  onRequestSearchTerm,
  onRequestTableReload,
  publishLoading,
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
  onGetVersionedItem,
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
  onAssetsGet,
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
  onGetAsset,
  onGroupGet,
  onCheckItemReference,
  onNavigateToRequest,
}) => {
  const t = useT();
  const [form] = Form.useForm();
  const [metaForm] = Form.useForm();
  const [versionForm] = Form.useForm();
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(!!itemId);
  const changedKeys = useRef(new Set<string>());
  const referencedItems = useMemo(() => item?.referencedItems ?? [], [item?.referencedItems]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      currentLocation.pathname !== nextLocation.pathname && changedKeys.current.size > 0,
  );

  const checkIfSingleGroupField = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (key: string, value: any) => {
      return (
        initialFormValues[key] &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !dayjs.isDayjs(value) &&
        value !== null
      );
    },
    [initialFormValues],
  );

  const handleFormValidate = useCallback(async (form: FormInstance) => {
    try {
      await form.validateFields();
    } catch (e) {
      if ((e as ValidateErrorEntity).errorFields.length > 0) {
        setIsDisabled(true);
        throw e;
      }
    }
  }, []);

  const handleValuesChange = useCallback(
    async (changedValues: Record<string, unknown>) => {
      try {
        await handleFormValidate(form);
      } catch (e) {
        console.error(e);
        return;
      }

      if (!itemId) {
        try {
          await handleFormValidate(metaForm);
          setIsDisabled(false);
        } catch (e) {
          console.error(e);
        }
        return;
      }

      for (const [key, value] of Object.entries(changedValues)) {
        if (checkIfSingleGroupField(key, value)) {
          const [groupFieldKey, changedFieldValue] = Object.entries(value as object)[0];
          const groupFieldValue = initialFormValues[key][groupFieldKey];
          if (
            JSON.stringify(emptyConvert(changedFieldValue)) ===
            JSON.stringify(emptyConvert(groupFieldValue))
          ) {
            changedKeys.current.delete(key);
          } else if (changedFieldValue !== undefined) {
            changedKeys.current.add(key);
          }
        } else if (
          JSON.stringify(emptyConvert(value)) ===
          JSON.stringify(emptyConvert(initialFormValues[key]))
        ) {
          changedKeys.current.delete(key);
        } else {
          changedKeys.current.add(key);
        }
      }
      setIsDisabled(changedKeys.current.size === 0);
    },
    [checkIfSingleGroupField, form, handleFormValidate, initialFormValues, itemId, metaForm],
  );

  useEffect(() => {
    const openNotification = () => {
      const key = `open${Date.now()}`;
      const btn = (
        <Space>
          <Button
            onClick={() => {
              Notification.destroy();
              blocker.reset?.();
            }}>
            {t("Cancel")}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              Notification.destroy();
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
        closeIcon: false,
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
    };

    window.addEventListener("beforeunload", handleBeforeUnloadEvent, true);
    return () => window.removeEventListener("beforeunload", handleBeforeUnloadEvent, true);
  }, []);

  const allFormsValidate = useCallback(async () => {
    try {
      await handleFormValidate(form);
      await handleFormValidate(metaForm);
      setIsDisabled(false);
    } catch (e) {
      console.error(e);
    }
  }, [form, handleFormValidate, metaForm]);

  useEffect(() => {
    form.setFieldsValue(initialFormValues);
    metaForm.setFieldsValue(initialMetaFormValues);
    if (!itemId) {
      allFormsValidate();
    }
  }, [allFormsValidate, form, initialFormValues, initialMetaFormValues, itemId, metaForm]);

  const unpublishedItems = useMemo(
    () => referencedItems?.filter(item => item.status !== "PUBLIC") ?? [],
    [referencedItems],
  );

  const inputValueGet = useCallback((value: ItemValue, field: Field) => {
    if (field.multiple) {
      if (Array.isArray(value)) {
        if (field.type === "Tag") {
          const tags = field.typeProperty?.tags;
          return tags ? selectedTagIdsGet(value as string[], tags) : [];
        } else {
          return value.map(v =>
            v === "" ? undefined : dayjs.isDayjs(v) ? transformDayjsToString(v) : v,
          );
        }
      } else {
        return [];
      }
    } else {
      return dayjs.isDayjs(value) ? transformDayjsToString(value) : (value ?? "");
    }
  }, []);

  const modelFields = useMemo(
    () => new Map((model?.schema.fields || []).map(field => [field.id, field])),
    [model?.schema.fields],
  );

  const metaFieldsMap = useMemo(
    () => new Map((model?.metadataSchema.fields || []).map(field => [field.id, field])),
    [model?.metadataSchema.fields],
  );

  const metaFieldsGet = useCallback(async () => {
    const result: ItemField[] = [];
    const metaValues = await metaForm.validateFields();
    for (const [key, value] of Object.entries(metaValues)) {
      const metaField = metaFieldsMap.get(key);
      if (metaField) {
        result.push({
          value: inputValueGet(value as ItemValue, metaField),
          schemaFieldId: key,
          type: metaField.type,
        });
      }
    }
    return result;
  }, [inputValueGet, metaFieldsMap, metaForm]);

  const [versionedItem, setVersionedItem] = useState<VersionedItem>();

  const versionClick = useCallback(
    async (versionedItem: VersionedItem) => {
      const res = await onGetVersionedItem(versionedItem.version);
      versionForm.setFieldsValue(res);
      setVersionedItem(versionedItem);
    },
    [onGetVersionedItem, versionForm],
  );

  const versionedItemClose = useCallback(() => {
    setVersionedItem(undefined);
  }, []);

  const handleRestore = useCallback(() => {
    const restore = () => {
      const values = versionForm.getFieldsValue();
      form.setFieldsValue(values);
      handleValuesChange(values);
      Notification.destroy();
      versionedItemClose();
    };

    Notification.info({
      message: t("Are you sure you want to restore this version’s content?"),
      description: t(
        "After saving, a new version will be created while keeping the current version unchanged.",
      ),
      btn: (
        <Space>
          <Button
            onClick={() => {
              Notification.destroy();
            }}>
            {t("Cancel")}
          </Button>
          <Button type="primary" onClick={restore}>
            {t("Restore")}
          </Button>
        </Space>
      ),
      placement: "top",
      closeIcon: false,
    });
  }, [form, handleValuesChange, t, versionForm, versionedItemClose]);

  const handleSubmit = useCallback(async () => {
    try {
      const groupFields = new Map<string, Field>();
      if (model) {
        await Promise.all(
          model.schema.fields.map(async field => {
            if (field.typeProperty?.groupId) {
              const group = await onGroupGet(field.typeProperty.groupId);
              group?.schema.fields?.forEach(field => groupFields.set(field.id, field));
            }
          }),
        );
      }

      const values = await form.validateFields();
      const fields: ItemField[] = [];
      for (const [key, value] of Object.entries(values)) {
        const modelField = modelFields.get(key);
        if (modelField) {
          fields.push({
            value: inputValueGet(value as ItemValue, modelField),
            schemaFieldId: key,
            type: modelField.type,
          });
        } else if (typeof value === "object" && value !== null) {
          for (const [groupFieldKey, groupFieldValue] of Object.entries(value)) {
            const groupField = groupFields.get(key);
            if (groupField) {
              fields.push({
                value: inputValueGet(groupFieldValue, groupField),
                schemaFieldId: key,
                itemGroupId: groupFieldKey,
                type: groupField.type,
              });
            }
          }
        }
      }

      if (itemId) {
        await onItemUpdate?.({
          itemId: itemId,
          fields,
        });
      } else if (model?.schema.id) {
        const metaFields = await metaFieldsGet();
        await onItemCreate?.({
          schemaId: model?.schema.id,
          metaSchemaId: model?.metadataSchema?.id,
          metaFields,
          fields,
        });
      }

      changedKeys.current.clear();
      setIsDisabled(true);
      versionedItemClose();
    } catch (e) {
      console.error(e);
    }
  }, [
    model,
    form,
    itemId,
    versionedItemClose,
    onGroupGet,
    modelFields,
    inputValueGet,
    onItemUpdate,
    metaFieldsGet,
    onItemCreate,
  ]);

  const handleMetaUpdate = useCallback(async () => {
    try {
      const metaFields = await metaFieldsGet();
      await onMetaItemUpdate({
        metaItemId: item?.metadata?.id,
        metaFields,
      });
      setIsDisabled(true);
    } catch (info) {
      console.error(info);
    }
  }, [metaFieldsGet, onMetaItemUpdate, item?.metadata?.id]);

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMetaValuesChange = useCallback(
    async (changedValues: Record<string, unknown>) => {
      if (itemId) {
        if (timeout.current) {
          clearTimeout(timeout.current);
          timeout.current = null;
        }
        const [key, value] = Object.entries(changedValues)[0];
        const initialValue = initialMetaFormValues[key];
        if (Array.isArray(value)) {
          // use checkIfEmpty
          const noEmptyValuesLength = value.filter(
            v => !(v === undefined || v === null || v === ""),
          ).length;
          if (
            noEmptyValuesLength === value.length ||
            (noEmptyValuesLength && !initialValue) ||
            (Array.isArray(initialValue) && noEmptyValuesLength !== initialValue.length)
          ) {
            timeout.current = setTimeout(handleMetaUpdate, 800);
          }
        } else if (value !== initialValue) {
          timeout.current = setTimeout(handleMetaUpdate, 800);
        }
      } else {
        allFormsValidate();
      }
    },
    [allFormsValidate, handleMetaUpdate, initialMetaFormValues, itemId],
  );

  const isInReview = useMemo(
    () => item?.status === "REVIEW" || item?.status === "PUBLIC_REVIEW",
    [item?.status],
  );

  const items: MenuProps["items"] = useMemo(() => {
    const menuItems = [
      {
        key: "addToRequest",
        label: t("Add to Request"),
        onClick: onAddItemToRequestModalOpen,
        disabled: isInReview || item?.status === "PUBLIC" || !hasRequestUpdateRight,
      },
      {
        key: "unpublish",
        label: t("Unpublish"),
        onClick: () => {
          if (itemId) onUnpublish([itemId]);
        },
        disabled: item?.status === "DRAFT" || item?.status === "REVIEW" || !hasPublishRight,
      },
    ];
    if (showPublishAction) {
      menuItems.unshift({
        key: "NewRequest",
        label: t("New Request"),
        onClick: onModalOpen,
        disabled: isInReview || item?.status === "PUBLIC" || !hasRequestCreateRight,
      });
    }
    return menuItems;
  }, [
    t,
    onAddItemToRequestModalOpen,
    isInReview,
    item?.status,
    hasRequestUpdateRight,
    hasPublishRight,
    showPublishAction,
    itemId,
    onUnpublish,
    onModalOpen,
    hasRequestCreateRight,
  ]);

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

  const fieldDisabled = useMemo(
    () => !!itemId && !hasItemUpdateRight,
    [hasItemUpdateRight, itemId],
  );

  const [activeKey, setActiveKey] = useState<string>();

  const formWrapperRef = useRef<HTMLDivElement>(null);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  useEffect(() => {
    if (formWrapperRef.current)
      setScrollbarWidth(formWrapperRef.current?.offsetWidth - formWrapperRef.current?.clientWidth);
  }, []);

  const itemHeightsRef = useRef<Record<string, number>>({});
  const [itemHeights, setItemHeights] = useState<Record<string, number>>({});

  const handleItemHeightChange = useCallback((id: string, height: number) => {
    itemHeightsRef.current = { ...itemHeightsRef.current, [id]: height };
    const _height = id.startsWith("version")
      ? Math.max(
          itemHeightsRef.current[id] ?? 0,
          itemHeightsRef.current[id.substring(id.indexOf("_") + 1)] ?? 0,
        )
      : Math.max(itemHeightsRef.current[id] ?? 0, itemHeightsRef.current[`version_${id}`] ?? 0);
    const _id = id.startsWith("version") ? id.substring(id.indexOf("_") + 1) : id;

    setItemHeights(prev => ({ ...prev, [_id]: _height }));
  }, []);

  return (
    <>
      <Wrapper>
        <HeaderWrapper>
          <StyledPageHeader
            title={title}
            onBack={onBack}
            extra={
              <>
                <Button onClick={handleSubmit} loading={loading} disabled={isDisabled}>
                  {t("Save")}
                </Button>
                {itemId && (
                  <>
                    {showPublishAction && (
                      <Tooltip
                        placement="bottom"
                        title={
                          isInReview
                            ? t(
                                "The item is currently under request review and cannot be published.",
                              )
                            : null
                        }>
                        <Button
                          type="primary"
                          onClick={handlePublishSubmit}
                          loading={publishLoading}
                          disabled={isInReview || item?.status === "PUBLIC" || !hasPublishRight}>
                          {t("Publish")}
                        </Button>
                      </Tooltip>
                    )}
                    {!showPublishAction && (
                      <Tooltip
                        placement="bottom"
                        title={
                          isInReview
                            ? t(
                                "The item is currently under request review and cannot have a new request.",
                              )
                            : null
                        }>
                        <Button
                          type="primary"
                          onClick={onModalOpen}
                          disabled={
                            isInReview || item?.status === "PUBLIC" || !hasRequestCreateRight
                          }>
                          {t("New Request")}
                        </Button>
                      </Tooltip>
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
          {versionedItem && (
            <VersionHeader
              title={`${t("Version history")} / ${dateTimeFormat(versionedItem?.timestamp, "YYYY-MM-DD, HH:mm")}`}
              onBack={versionedItemClose}
              extra={
                <Button onClick={handleRestore} type="link">
                  {t("Restore")}
                </Button>
              }
            />
          )}
        </HeaderWrapper>
        <FormWrapper ref={formWrapperRef}>
          <StyledForm
            form={form}
            layout="vertical"
            initialValues={initialFormValues}
            onValuesChange={handleValuesChange}
            scrollbarWidth={scrollbarWidth}>
            {model?.schema.fields.map(field => (
              <FieldWrapper
                key={field.id}
                field={field}
                disabled={fieldDisabled}
                itemHeights={itemHeights}
                onItemHeightChange={handleItemHeightChange}
                assetProps={{
                  assetList,
                  itemAssets: item?.assets,
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
                }}
                referenceProps={{
                  referencedItems,
                  loading: loadingReference,
                  linkedItemsModalList,
                  linkItemModalTitle,
                  linkItemModalTotalCount,
                  linkItemModalPage,
                  linkItemModalPageSize,
                  onReferenceModelUpdate,
                  onSearchTerm,
                  onLinkItemTableReload,
                  onLinkItemTableChange,
                  onCheckItemReference,
                }}
                groupProps={{ form, onGroupGet }}
              />
            ))}
          </StyledForm>
          {versionedItem && (
            <VersionForm
              form={versionForm}
              layout="vertical"
              name="version"
              scrollbarWidth={scrollbarWidth}>
              {model?.schema.fields.map(field => (
                <FieldWrapper
                  key={field.id}
                  field={field}
                  disabled
                  itemHeights={itemHeights}
                  onItemHeightChange={handleItemHeightChange}
                  assetProps={{ onGetAsset }}
                  referenceProps={{ referencedItems }}
                  groupProps={{ form, onGroupGet }}
                />
              ))}
            </VersionForm>
          )}
        </FormWrapper>
      </Wrapper>
      {!versionedItem && (model?.metadataSchema.fields || item?.id) && (
        <StyledTabs activeKey={activeKey} onTabClick={key => setActiveKey(key)}>
          <TabPane tab={t("Meta Data")} key="meta">
            <Form
              form={metaForm}
              layout="vertical"
              initialValues={initialMetaFormValues}
              onValuesChange={handleMetaValuesChange}>
              <TabContent>
                <Metadata
                  item={item}
                  fields={model?.metadataSchema.fields ?? []}
                  disabled={fieldDisabled}
                />
              </TabContent>
            </Form>
          </TabPane>
          {versions.length && (
            <TabPane tab={t("Version History")} key="history">
              <TabContent>
                <Versions
                  versions={versions}
                  versionClick={versionClick}
                  onNavigateToRequest={onNavigateToRequest}
                />
              </TabContent>
            </TabPane>
          )}
        </StyledTabs>
      )}
      {itemId && (
        <>
          <RequestCreationModal
            open={requestModalShown}
            requestCreationLoading={requestCreationLoading}
            item={{ itemId, version: item?.version }}
            unpublishedItems={unpublishedItems}
            workspaceUserMembers={workspaceUserMembers}
            onClose={onModalClose}
            onSubmit={onRequestCreate}
          />
          <LinkItemRequestModal
            items={[{ itemId, version: item?.version }]}
            onChange={onChange}
            onLinkItemRequestModalCancel={onAddItemToRequestModalClose}
            visible={addItemToRequestModalShown}
            requestList={requests}
            onRequestTableChange={onRequestTableChange}
            requestModalLoading={requestModalLoading}
            requestModalTotalCount={requestModalTotalCount}
            requestModalPage={requestModalPage}
            requestModalPageSize={requestModalPageSize}
            onRequestSearchTerm={onRequestSearchTerm}
            onRequestTableReload={onRequestTableReload}
          />
          <PublishItemModal
            open={publishModalOpen}
            loading={publishLoading}
            itemId={itemId}
            unpublishedItems={unpublishedItems}
            onClose={handlePublishItemClose}
            onSubmit={onPublish}
          />
        </>
      )}
    </>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-flow: column;
  flex: 1;
  min-width: 0;
  height: 100%;
`;

const HeaderWrapper = styled.div`
  background-color: #fff;
  display: flex;
`;

const StyledPageHeader = styled(PageHeader)`
  flex: 1;
  min-width: 0;
`;

const VersionHeader = styled(StyledPageHeader)`
  background-color: #fafafa !important;
`;

const FormWrapper = styled.div`
  border-top: 1px solid #00000008;
  overflow: hidden auto;
  display: flex;
  flex: 1;
  scrollbar-gutter: stable;
`;

const StyledTabs = styled(Tabs)`
  max-height: 100%;
  background-color: #fafafa;
  width: 272px;
  border-left: 1px solid #f0f0f0;
  .ant-tabs-nav {
    margin-bottom: 0;
    padding-left: 20px;
    background-color: #fff;
  }
  .ant-tabs-content-holder {
    overflow-y: auto;
  }
`;

const StyledForm = styled(Form)<{ scrollbarWidth: number }>`
  flex: 1;
  min-width: 0;
  padding: 36px;
  background: #fff;
  min-height: 100%;
  height: fit-content;
  label {
    width: 100%;
    display: flex;
  }
  :last-child {
    margin-right: ${({ scrollbarWidth }) => `-${scrollbarWidth}px`};
  }
`;

const VersionForm = styled(StyledForm)`
  background: #fafafa;
`;

const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
`;

export default ContentForm;
