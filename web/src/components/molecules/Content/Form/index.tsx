import styled from "@emotion/styled";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  FormItem,
  FormValues,
  Item,
  ItemField,
  ItemValue,
  VersionedItem,
} from "@reearth-cms/components/molecules/Content/types";
import { selectedTagIdsGet } from "@reearth-cms/components/molecules/Content/utils";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import {
  Request,
  RequestItem,
  RequestState,
} from "@reearth-cms/components/molecules/Request/types";
import { Field, Group } from "@reearth-cms/components/molecules/Schema/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat, transformDayjsToString } from "@reearth-cms/utils/format";

import FieldWrapper from "./FieldWrapper";
import Versions from "./Versions";

const { TabPane } = Tabs;

type Props = {
  addItemToRequestModalShown: boolean;
  assetList: Asset[];
  fileList: UploadFile[];
  hasItemUpdateRight: boolean;
  hasPublishRight: boolean;
  hasRequestCreateRight: boolean;
  hasRequestUpdateRight: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialFormValues: Record<string, any>;
  initialMetaFormValues: Record<string, unknown>;
  item?: Item;
  itemId?: string;
  linkedItemsModalList?: FormItem[];
  linkItemModalPage: number;
  linkItemModalPageSize: number;
  linkItemModalTitle: string;
  linkItemModalTotalCount: number;
  loading: boolean;
  loadingAssets: boolean;
  loadingReference: boolean;
  model?: Model;
  onAddItemToRequestModalClose: () => void;
  onAddItemToRequestModalOpen: () => void;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetSearchTerm: (term?: string | undefined) => void;
  onAssetsGet: () => void;
  onAssetsReload: () => void;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
  onBack: () => void;
  onChange: (request: Request, items: RequestItem[]) => Promise<void>;
  onCheckItemReference: (
    itemId: string,
    correspondingFieldId: string,
    groupId?: string,
  ) => Promise<boolean>;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onGetVersionedItem: (version: string) => Promise<FormValues>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
  onItemCreate: (data: {
    fields: ItemField[];
    metaFields: ItemField[];
    metaSchemaId?: string;
    schemaId: string;
  }) => Promise<void>;
  onItemUpdate: (data: { fields: ItemField[]; itemId: string; }) => Promise<void>;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
  onLinkItemTableReload: () => void;
  onMetaItemUpdate: (data: { metaFields: ItemField[]; metaItemId?: string; }) => Promise<void>;
  onModalClose: () => void;
  onModalOpen: () => void;
  onNavigateToRequest: (id: string) => void;
  onPublish: (itemIds: string[]) => Promise<void>;
  onReferenceModelUpdate: (modelId: string, referenceFieldId: string) => void;
  onRequestCreate: (data: {
    description: string;
    items: RequestItem[];
    reviewersId: string[];
    state: RequestState;
    title: string;
  }) => Promise<void>;
  onRequestSearchTerm: (term: string) => void;
  onRequestTableChange: (page: number, pageSize: number) => void;
  onRequestTableReload: () => void;
  onSearchTerm: (term?: string) => void;
  onUnpublish: (itemIds: string[]) => Promise<void>;
  onUploadModalCancel: () => void;
  page: number;
  pageSize: number;
  publishLoading: boolean;
  requestCreationLoading: boolean;
  requestModalLoading: boolean;
  requestModalPage: number;
  requestModalPageSize: number;
  requestModalShown: boolean;
  requestModalTotalCount: number;
  requests: Request[];
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  setUploadType: (type: UploadType) => void;
  setUploadUrl: (uploadUrl: { autoUnzip: boolean; url: string; }) => void;
  showPublishAction: boolean;
  title: string;
  totalCount: number;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadType: UploadType;
  uploadUrl: { autoUnzip: boolean; url: string; };
  versions: VersionedItem[];
  workspaceUserMembers: UserMember[];
};

const ContentForm: React.FC<Props> = ({
  addItemToRequestModalShown,
  assetList,
  fileList,
  hasItemUpdateRight,
  hasPublishRight,
  hasRequestCreateRight,
  hasRequestUpdateRight,
  initialFormValues,
  initialMetaFormValues,
  item,
  itemId,
  linkedItemsModalList,
  linkItemModalPage,
  linkItemModalPageSize,
  linkItemModalTitle,
  linkItemModalTotalCount,
  loading,
  loadingAssets,
  loadingReference,
  model,
  onAddItemToRequestModalClose,
  onAddItemToRequestModalOpen,
  onAssetCreateFromUrl,
  onAssetsCreate,
  onAssetSearchTerm,
  onAssetsGet,
  onAssetsReload,
  onAssetTableChange,
  onBack,
  onChange,
  onCheckItemReference,
  onGetAsset,
  onGetVersionedItem,
  onGroupGet,
  onItemCreate,
  onItemUpdate,
  onLinkItemTableChange,
  onLinkItemTableReload,
  onMetaItemUpdate,
  onModalClose,
  onModalOpen,
  onNavigateToRequest,
  onPublish,
  onReferenceModelUpdate,
  onRequestCreate,
  onRequestSearchTerm,
  onRequestTableChange,
  onRequestTableReload,
  onSearchTerm,
  onUnpublish,
  onUploadModalCancel,
  page,
  pageSize,
  publishLoading,
  requestCreationLoading,
  requestModalLoading,
  requestModalPage,
  requestModalPageSize,
  requestModalShown,
  requestModalTotalCount,
  requests,
  setFileList,
  setUploadModalVisibility,
  setUploadType,
  setUploadUrl,
  showPublishAction,
  title,
  totalCount,
  uploading,
  uploadModalVisibility,
  uploadType,
  uploadUrl,
  versions,
  workspaceUserMembers,
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
            onClick={() => {
              Notification.destroy();
              blocker.proceed?.();
            }}
            type="primary">
            {t("Leave")}
          </Button>
        </Space>
      );
      Notification.config({
        maxCount: 1,
      });

      Notification.info({
        btn,
        closeIcon: false,
        description: t("Are you going to leave?"),
        key,
        message: t("This item has unsaved data"),
        placement: "top",
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
          schemaFieldId: key,
          type: metaField.type,
          value: inputValueGet(value as ItemValue, metaField),
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
      btn: (
        <Space>
          <Button
            onClick={() => {
              Notification.destroy();
            }}>
            {t("Cancel")}
          </Button>
          <Button onClick={restore} type="primary">
            {t("Restore")}
          </Button>
        </Space>
      ),
      closeIcon: false,
      description: t(
        "After saving, a new version will be created while keeping the current version unchanged.",
      ),
      message: t("Are you sure you want to restore this version's content?"),
      placement: "top",
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
            schemaFieldId: key,
            type: modelField.type,
            value: inputValueGet(value as ItemValue, modelField),
          });
        } else if (typeof value === "object" && value !== null) {
          for (const [groupFieldKey, groupFieldValue] of Object.entries(value)) {
            const groupField = groupFields.get(key);
            if (groupField) {
              fields.push({
                itemGroupId: groupFieldKey,
                schemaFieldId: key,
                type: groupField.type,
                value: inputValueGet(groupFieldValue, groupField),
              });
            }
          }
        }
      }

      if (itemId) {
        await onItemUpdate?.({
          fields,
          itemId: itemId,
        });
      } else if (model?.schema.id) {
        const metaFields = await metaFieldsGet();
        await onItemCreate?.({
          fields,
          metaFields,
          metaSchemaId: model?.metadataSchema?.id,
          schemaId: model?.schema.id,
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
        metaFields,
        metaItemId: item?.metadata?.id,
      });
      setIsDisabled(true);
    } catch (info) {
      console.error(info);
    }
  }, [metaFieldsGet, onMetaItemUpdate, item?.metadata?.id]);

  const timeout = useRef<null | ReturnType<typeof setTimeout>>(null);

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
        disabled: isInReview || item?.status === "PUBLIC" || !hasRequestUpdateRight,
        key: "addToRequest",
        label: t("Add to Request"),
        onClick: onAddItemToRequestModalOpen,
      },
      {
        disabled: item?.status === "DRAFT" || item?.status === "REVIEW" || !hasPublishRight,
        key: "unpublish",
        label: t("Unpublish"),
        onClick: () => {
          if (itemId) onUnpublish([itemId]);
        },
      },
    ];
    if (showPublishAction) {
      menuItems.unshift({
        disabled: isInReview || item?.status === "PUBLIC" || !hasRequestCreateRight,
        key: "NewRequest",
        label: t("New Request"),
        onClick: onModalOpen,
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
            extra={
              <>
                <Button disabled={isDisabled} loading={loading} onClick={handleSubmit}>
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
                          disabled={isInReview || item?.status === "PUBLIC" || !hasPublishRight}
                          loading={publishLoading}
                          onClick={handlePublishSubmit}
                          type="primary">
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
                          disabled={
                            isInReview || item?.status === "PUBLIC" || !hasRequestCreateRight
                          }
                          onClick={onModalOpen}
                          type="primary">
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
            onBack={onBack}
            title={title}
          />
          {versionedItem && (
            <VersionHeader
              extra={
                <Button onClick={handleRestore} type="link">
                  {t("Restore")}
                </Button>
              }
              onBack={versionedItemClose}
              title={`${t("Version history")} / ${dateTimeFormat(versionedItem?.timestamp, "YYYY-MM-DD, HH:mm")}`}
            />
          )}
        </HeaderWrapper>
        <FormWrapper ref={formWrapperRef}>
          <StyledForm
            form={form}
            initialValues={initialFormValues}
            layout="vertical"
            onValuesChange={handleValuesChange}
            scrollbarWidth={scrollbarWidth}>
            {model?.schema.fields.map(field => (
              <FieldWrapper
                assetProps={{
                  assetList,
                  fileList,
                  itemAssets: item?.assets,
                  loadingAssets,
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
                  setFileList,
                  setUploadModalVisibility,
                  setUploadType,
                  setUploadUrl,
                  totalCount,
                  uploading,
                  uploadModalVisibility,
                  uploadType,
                  uploadUrl,
                }}
                disabled={fieldDisabled}
                field={field}
                groupProps={{ form, onGroupGet }}
                itemHeights={itemHeights}
                key={field.id}
                onItemHeightChange={handleItemHeightChange}
                referenceProps={{
                  linkedItemsModalList,
                  linkItemModalPage,
                  linkItemModalPageSize,
                  linkItemModalTitle,
                  linkItemModalTotalCount,
                  loading: loadingReference,
                  onCheckItemReference,
                  onLinkItemTableChange,
                  onLinkItemTableReload,
                  onReferenceModelUpdate,
                  onSearchTerm,
                  referencedItems,
                }}
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
                  assetProps={{ onGetAsset }}
                  disabled
                  field={field}
                  groupProps={{ form, onGroupGet }}
                  itemHeights={itemHeights}
                  key={field.id}
                  onItemHeightChange={handleItemHeightChange}
                  referenceProps={{ referencedItems }}
                />
              ))}
            </VersionForm>
          )}
        </FormWrapper>
      </Wrapper>
      {!versionedItem && (model?.metadataSchema.fields || item?.id) && (
        <StyledTabs activeKey={activeKey} onTabClick={key => setActiveKey(key)}>
          <TabPane key="meta" tab={t("Meta Data")}>
            <Form
              form={metaForm}
              initialValues={initialMetaFormValues}
              layout="vertical"
              onValuesChange={handleMetaValuesChange}>
              <TabContent>
                <Metadata
                  disabled={fieldDisabled}
                  fields={model?.metadataSchema.fields ?? []}
                  item={item}
                />
              </TabContent>
            </Form>
          </TabPane>
          {versions.length && (
            <TabPane key="history" tab={t("Version History")}>
              <TabContent>
                <Versions
                  onNavigateToRequest={onNavigateToRequest}
                  versionClick={versionClick}
                  versions={versions}
                />
              </TabContent>
            </TabPane>
          )}
        </StyledTabs>
      )}
      {itemId && (
        <>
          <RequestCreationModal
            item={{ itemId, version: item?.version }}
            onClose={onModalClose}
            onSubmit={onRequestCreate}
            open={requestModalShown}
            requestCreationLoading={requestCreationLoading}
            unpublishedItems={unpublishedItems}
            workspaceUserMembers={workspaceUserMembers}
          />
          <LinkItemRequestModal
            items={[{ itemId, version: item?.version }]}
            onChange={onChange}
            onLinkItemRequestModalCancel={onAddItemToRequestModalClose}
            onRequestSearchTerm={onRequestSearchTerm}
            onRequestTableChange={onRequestTableChange}
            onRequestTableReload={onRequestTableReload}
            requestList={requests}
            requestModalLoading={requestModalLoading}
            requestModalPage={requestModalPage}
            requestModalPageSize={requestModalPageSize}
            requestModalTotalCount={requestModalTotalCount}
            visible={addItemToRequestModalShown}
          />
          <PublishItemModal
            itemId={itemId}
            loading={publishLoading}
            onClose={handlePublishItemClose}
            onSubmit={onPublish}
            open={publishModalOpen}
            unpublishedItems={unpublishedItems}
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
