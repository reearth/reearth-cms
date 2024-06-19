import styled from "@emotion/styled";
import { Cartesian3, Viewer as CesiumViewer, Cartographic, Math, SceneMode } from "cesium";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useBlocker } from "react-router-dom";
import {
  CesiumComponentRef,
  CesiumMovementEvent,
  Viewer,
  ScreenSpaceCameraController,
  RootEventTarget,
} from "resium";

import Button from "@reearth-cms/components/atoms/Button";
import Dropdown, { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Marker from "@reearth-cms/components/atoms/Icon/Icons/mapPinFilled.svg";
import Notification from "@reearth-cms/components/atoms/Notification";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Space from "@reearth-cms/components/atoms/Space";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset } from "@reearth-cms/components/molecules/Asset/types";
import ContentSidebarWrapper from "@reearth-cms/components/molecules/Content/Form/SidebarWrapper";
import LinkItemRequestModal from "@reearth-cms/components/molecules/Content/LinkItemRequestModal/LinkItemRequestModal";
import PublishItemModal from "@reearth-cms/components/molecules/Content/PublishItemModal";
import RequestCreationModal from "@reearth-cms/components/molecules/Content/RequestCreationModal";
import {
  Item,
  FormItem,
  ItemField,
  ItemValue,
} from "@reearth-cms/components/molecules/Content/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { Request, RequestState } from "@reearth-cms/components/molecules/Request/types";
import { FieldType, Group, Field } from "@reearth-cms/components/molecules/Schema/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";
import { useT } from "@reearth-cms/i18n";
import { transformDayjsToString } from "@reearth-cms/utils/format";

import { AssetField, GroupField, ReferenceField } from "./fields/ComplexFieldComponents";
import { DefaultField } from "./fields/FieldComponents";
import { FIELD_TYPE_COMPONENT_MAP } from "./fields/FieldTypesMap";

interface Props {
  item?: Item;
  loadingReference: boolean;
  linkedItemsModalList?: FormItem[];
  showPublishAction: boolean;
  requests: Request[];
  itemId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialFormValues: Record<string, any>;
  initialMetaFormValues: Record<string, unknown>;
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
  onChange: (request: Request, itemIds: string[]) => Promise<void>;
  onModalClose: () => void;
  onModalOpen: () => void;
  onAddItemToRequestModalClose: () => void;
  onAddItemToRequestModalOpen: () => void;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
  onCheckItemReference: (value: string, correspondingFieldId: string) => Promise<boolean>;
}

const ContentForm: React.FC<Props> = ({
  item,
  loadingReference,
  linkedItemsModalList,
  showPublishAction,
  requests,
  itemId,
  model,
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
  onLinkItemTableReload,
  onRequestTableChange,
  onRequestSearchTerm,
  onRequestTableReload,
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
}) => {
  const t = useT();
  const [form] = Form.useForm();
  const [metaForm] = Form.useForm();
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const changedKeys = useRef(new Set<string>());
  const formItemsData = useMemo(() => item?.referencedItems ?? [], [item?.referencedItems]);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emptyConvert = useCallback((value: any) => {
    if (value === "" || value === null || (Array.isArray(value) && value.length === 0)) {
      return undefined;
    } else {
      return value;
    }
  }, []);

  const handleValuesChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (changedValues: any) => {
      const [key, value] = Object.entries(changedValues)[0];
      if (checkIfSingleGroupField(key, value)) {
        const [groupFieldKey, groupFieldValue] = Object.entries(initialFormValues[key])[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const changedFieldValue = (value as any)[groupFieldKey];
        if (
          JSON.stringify(emptyConvert(changedFieldValue)) ===
          JSON.stringify(emptyConvert(groupFieldValue))
        ) {
          changedKeys.current.delete(key);
        } else if (changedFieldValue !== undefined) {
          changedKeys.current.add(key);
        }
      } else if (
        JSON.stringify(emptyConvert(value)) === JSON.stringify(emptyConvert(initialFormValues[key]))
      ) {
        changedKeys.current.delete(key);
      } else {
        changedKeys.current.add(key);
      }
      setIsDisabled(changedKeys.current.size === 0);
    },
    [checkIfSingleGroupField, emptyConvert, initialFormValues],
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

  useEffect(() => {
    form.setFieldsValue(initialFormValues);
  }, [form, initialFormValues]);

  useEffect(() => {
    metaForm.setFieldsValue(initialMetaFormValues);
  }, [metaForm, initialMetaFormValues]);

  const unpublishedItems = useMemo(
    () => formItemsData?.filter(item => item.status !== "PUBLIC") ?? [],
    [formItemsData],
  );

  const inputValueGet = useCallback((value: ItemValue, multiple: boolean) => {
    if (multiple) {
      if (Array.isArray(value)) {
        return value.map(v => (dayjs.isDayjs(v) ? transformDayjsToString(v) : v));
      } else {
        return [];
      }
    } else {
      return dayjs.isDayjs(value) ? transformDayjsToString(value) : value ?? "";
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsDisabled(true);
    try {
      const modelFields = new Map((model?.schema.fields || []).map(field => [field.id, field]));
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
            value: inputValueGet(value as ItemValue, modelField.multiple),
            schemaFieldId: key,
            type: modelField.type,
          });
        } else if (typeof value === "object" && value !== null) {
          for (const [groupFieldKey, groupFieldValue] of Object.entries(value)) {
            const groupField = groupFields.get(key);
            if (groupField) {
              fields.push({
                value: inputValueGet(groupFieldValue, groupField.multiple),
                schemaFieldId: key,
                itemGroupId: groupFieldKey,
                type: groupField.type,
              });
            }
          }
        }
      }

      const metaValues = await metaForm.validateFields();
      const metaFields: ItemField[] = [];
      for (const [key, value] of Object.entries(metaValues)) {
        const type = model?.metadataSchema?.fields?.find(field => field.id === key)?.type;
        if (type) {
          metaFields.push({
            value: dayjs.isDayjs(value) ? transformDayjsToString(value) : value ?? "",
            schemaFieldId: key,
            type,
          });
        }
      }

      changedKeys.current.clear();

      if (itemId) {
        await onItemUpdate?.({
          itemId: itemId,
          fields,
        });
      } else if (model?.schema.id) {
        await onItemCreate?.({
          schemaId: model?.schema.id,
          metaSchemaId: model?.metadataSchema?.id,
          metaFields,
          fields,
        });
      }
    } catch (_) {
      setIsDisabled(false);
    }
  }, [model, form, metaForm, itemId, onGroupGet, inputValueGet, onItemUpdate, onItemCreate]);

  const handleMetaUpdate = useCallback(async () => {
    if (!itemId) return;
    try {
      const metaValues = await metaForm.validateFields();
      const metaFields: { schemaFieldId: string; type: FieldType; value: string }[] = [];
      for (const [key, value] of Object.entries(metaValues)) {
        metaFields.push({
          value: (dayjs.isDayjs(value) ? transformDayjsToString(value) : value ?? "") as string,
          schemaFieldId: key,
          type: model?.metadataSchema?.fields?.find(field => field.id === key)?.type as FieldType,
        });
      }
      await onMetaItemUpdate({
        metaItemId: item?.metadata?.id,
        metaFields,
      });
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  }, [itemId, item, metaForm, onMetaItemUpdate, model?.metadataSchema?.fields]);

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
        onClick: () => {
          if (itemId) onUnpublish([itemId]);
        },
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

  const viewer = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const positionsRef = useRef<number[][]>([]);
  type GeoType = "point" | "polyline" | "polygon";
  type ModeType = "add" | "edit" | "delete";
  const [geoValues, setGeoValues] = useState<Map<string, number[]>>(new Map());
  const [geoType, setGeoType] = useState<GeoType>();
  const [mode, setMode] = useState<ModeType>();

  const geoTypeSet = useCallback((geoType?: GeoType) => {
    setGeoType(geoType);
    setMode(geoType && "add");
  }, []);

  const pinButtonClick = useCallback(() => {
    geoTypeSet(geoType ? undefined : "point");
  }, [geoType, geoTypeSet]);

  const editButtonClick = useCallback(() => {
    setMode(prev => (prev === "edit" ? undefined : "edit"));
    setEnableTranslate(prev => !prev);
  }, []);

  const deleteButtonClick = useCallback(() => {
    setMode(prev => (prev === "delete" ? undefined : "delete"));
    setEnableTranslate(true);
  }, []);

  const handleClick = useCallback(
    (_movement: CesiumMovementEvent) => {
      if (!geoType) return;
      if (_movement.position && viewer.current?.cesiumElement) {
        const ellipsoid = viewer.current.cesiumElement.scene.globe.ellipsoid;
        const cartesian = viewer.current.cesiumElement.camera.pickEllipsoid(
          _movement.position,
          ellipsoid,
        );
        if (cartesian) {
          const cartographic = Cartographic.fromCartesian(cartesian);
          const lon = Math.toDegrees(cartographic.longitude);
          const lat = Math.toDegrees(cartographic.latitude);
          if (geoType === "point") {
            const entity = viewer.current.cesiumElement.entities.add({
              position: cartesian,
              billboard: {
                image: Marker,
                width: 30,
                height: 30,
              },
            });
            geoTypeSet();
            setGeoValues(prev => {
              prev.set(entity.id, [lon, lat]);
              return new Map(prev);
            });
          } else {
            positionsRef.current?.push([lon, lat]);
            if (geoType === "polyline") {
              viewer.current.cesiumElement.entities.add({
                position: cartesian,
                polyline: {
                  positions: Cartesian3.fromDegreesArray(positionsRef.current.flat()),
                },
              });
            } else {
              viewer.current.cesiumElement.entities.add({
                position: cartesian,
                polygon: {
                  hierarchy: Cartesian3.fromDegreesArray(positionsRef.current.flat()),
                  extrudedHeight: 50000,
                },
              });
            }
          }
        }
      }
    },
    [geoType, geoTypeSet],
  );

  const handleZoom = useCallback((isZoomIn: boolean) => {
    if (viewer.current?.cesiumElement) {
      const ellipsoid = viewer.current.cesiumElement.scene.globe.ellipsoid;
      const camera = viewer.current.cesiumElement.camera;
      const cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
      const moveRate = cameraHeight / 10;
      if (isZoomIn) {
        camera.moveForward(moveRate);
      } else {
        camera.moveBackward(moveRate);
      }
    }
  }, []);

  const [enableTranslate, setEnableTranslate] = useState(true);
  const [entityId, setEntityId] = useState("");

  const onMouseDown = useCallback(
    (_: CesiumMovementEvent, target: RootEventTarget) => {
      if (!("id" in target) || typeof target.id === "string") return;
      if (mode === "edit") {
        if (target?.id) {
          setEntityId(target.id.id);
          setEnableTranslate(false);
        } else {
          setEntityId("");
          setEnableTranslate(true);
        }
      } else if (mode === "delete" && viewer.current?.cesiumElement && target?.id) {
        const id = target.id.id;
        viewer.current.cesiumElement.entities.removeById(id);
        setGeoValues(prev => {
          prev.delete(id);
          return new Map(prev);
        });
      }
    },
    [mode],
  );

  const onMouseMove = useCallback(
    (movement: CesiumMovementEvent, _: RootEventTarget) => {
      if (entityId && viewer.current?.cesiumElement && movement.endPosition) {
        const cartesian = viewer.current.cesiumElement.camera.pickEllipsoid(
          movement.endPosition,
          viewer.current.cesiumElement.scene.globe.ellipsoid,
        );
        const point = viewer.current.cesiumElement.entities.getById(entityId);
        if (point && cartesian) {
          point.position = cartesian as any;
          const cartographic = Cartographic.fromCartesian(cartesian);
          const lon = Math.toDegrees(cartographic.longitude);
          const lat = Math.toDegrees(cartographic.latitude);
          setGeoValues(prev => {
            prev.set(entityId, [lon, lat]);
            return new Map(prev);
          });
        }
      }
    },
    [entityId],
  );

  const onMouseUp = useCallback(() => {
    setEntityId("");
  }, []);

  const [fullScreen, setFullScreen] = useState(false);

  const handleFullScreen = useCallback(() => {
    setFullScreen(prev => !prev);
  }, []);

  return (
    <>
      <StyledForm
        form={form}
        layout="vertical"
        initialValues={initialFormValues}
        onValuesChange={handleValuesChange}>
        <PageHeader
          title={model?.name}
          onBack={onBack}
          extra={
            <>
              <Button onClick={handleSubmit} loading={loading} disabled={!!itemId && isDisabled}>
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
          <ViewerWrapper fullScreen={fullScreen}>
            <TopButton
              top={7}
              left={200}
              icon={<Icon icon="mapPin" size={22} />}
              onClick={pinButtonClick}
              selected={mode === "add"}
            />
            {geoValues.size > 0 && (
              <>
                <TopButton
                  top={7}
                  left={250}
                  icon={<Icon icon="edit" size={20} />}
                  onClick={editButtonClick}
                  selected={mode === "edit"}
                />
                <TopButton
                  top={7}
                  left={300}
                  icon={<Icon icon="trash" size={20} />}
                  onClick={deleteButtonClick}
                  selected={mode === "delete"}
                />
              </>
            )}
            <RightButton
              top={50}
              right={5}
              icon={<Icon icon="plus" />}
              onClick={() => {
                handleZoom(true);
              }}
            />
            <RightButton
              top={90}
              right={5}
              icon={<Icon icon="minus" />}
              onClick={() => {
                handleZoom(false);
              }}
            />
            <RightButton
              bottom={20}
              right={5}
              icon={<Icon icon="fullscreen" />}
              onClick={handleFullScreen}
            />
            <StyledViewer
              infoBox={false}
              navigationHelpButton={false}
              homeButton={false}
              projectionPicker={false}
              sceneModePicker={true}
              sceneMode={SceneMode.SCENE2D}
              baseLayerPicker={true}
              fullscreenButton={false}
              vrButton={false}
              selectionIndicator={true}
              timeline={false}
              animation={false}
              geocoder={false}
              shouldAnimate={true}
              onClick={handleClick}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              ref={viewer}>
              <ScreenSpaceCameraController enableTranslate={enableTranslate} />
            </StyledViewer>
          </ViewerWrapper>
          {model?.schema.fields.map(field => {
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

            if (field.type === "Asset") {
              return (
                <StyledFormItemWrapper key={field.id}>
                  <AssetField
                    field={field}
                    assetList={assetList}
                    itemAssets={item?.assets}
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
                </StyledFormItemWrapper>
              );
            } else if (field.type === "Reference") {
              return (
                <StyledFormItemWrapper key={field.id}>
                  <ReferenceField
                    field={field}
                    loading={loadingReference}
                    linkedItemsModalList={linkedItemsModalList}
                    formItemsData={formItemsData}
                    linkItemModalTitle={linkItemModalTitle}
                    linkItemModalTotalCount={linkItemModalTotalCount}
                    linkItemModalPage={linkItemModalPage}
                    linkItemModalPageSize={linkItemModalPageSize}
                    onReferenceModelUpdate={onReferenceModelUpdate}
                    onSearchTerm={onSearchTerm}
                    onLinkItemTableReload={onLinkItemTableReload}
                    onLinkItemTableChange={onLinkItemTableChange}
                    onCheckItemReference={onCheckItemReference}
                  />
                </StyledFormItemWrapper>
              );
            } else if (field.type === "Group") {
              return (
                <StyledFormItemWrapper key={field.id}>
                  <GroupField
                    field={field}
                    form={form}
                    loadingReference={loadingReference}
                    linkedItemsModalList={linkedItemsModalList}
                    linkItemModalTitle={linkItemModalTitle}
                    formItemsData={formItemsData}
                    itemAssets={item?.assets}
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
                    onSearchTerm={onSearchTerm}
                    onReferenceModelUpdate={onReferenceModelUpdate}
                    onLinkItemTableReload={onLinkItemTableReload}
                    onLinkItemTableChange={onLinkItemTableChange}
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
                    onGroupGet={onGroupGet}
                    onCheckItemReference={onCheckItemReference}
                  />
                </StyledFormItemWrapper>
              );
            } else {
              return (
                <StyledFormItemWrapper key={field.id}>
                  <FieldComponent field={field} />
                </StyledFormItemWrapper>
              );
            }
          })}
        </FormItemsWrapper>
      </StyledForm>
      <SideBarWrapper>
        <Form form={metaForm} layout="vertical" initialValues={initialMetaFormValues}>
          <ContentSidebarWrapper item={item} />
          {model?.metadataSchema?.fields?.map(field => {
            const FieldComponent =
              FIELD_TYPE_COMPONENT_MAP[
                field.type as "Tag" | "Date" | "Bool" | "Checkbox" | "URL"
              ] || DefaultField;
            return (
              <MetaFormItemWrapper key={field.id}>
                <FieldComponent field={field} onMetaUpdate={handleMetaUpdate} />
              </MetaFormItemWrapper>
            );
          })}
        </Form>
      </SideBarWrapper>
      {itemId && (
        <>
          <RequestCreationModal
            open={requestModalShown}
            requestCreationLoading={requestCreationLoading}
            itemId={itemId}
            unpublishedItems={unpublishedItems}
            workspaceUserMembers={workspaceUserMembers}
            onClose={onModalClose}
            onSubmit={onRequestCreate}
          />
          <LinkItemRequestModal
            itemIds={[itemId]}
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

const StyledFormItemWrapper = styled.div`
  width: 500px;
  word-wrap: break-word;
`;

const StyledForm = styled(Form)`
  width: 100%;
  height: 100%;
  background: #fff;
  label {
    width: 100%;
    display: flex;
  }
`;

const FormItemsWrapper = styled.div`
  max-height: calc(100% - 72px);
  overflow-y: auto;
  padding: 36px;
`;

const ViewerWrapper = styled.div<{ fullScreen: boolean }>`
  position: relative;
  ${({ fullScreen }) =>
    fullScreen &&
    "position: fixed; left: 0; right: 0; top: 0; bottom: 0; background-color: #00000080; z-index: 1;"};
`;

const StyledViewer = styled(Viewer)`
  height: 100%;
`;

const RightButton = styled(Button)<{
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}>`
  position: absolute;
  top: ${({ top }) => (top ? `${top}px` : undefined)};
  right: ${({ right }) => (right ? `${right}px` : undefined)};
  bottom: ${({ bottom }) => (bottom ? `${bottom}px` : undefined)};
  left: ${({ left }) => (left ? `${left}px` : undefined)};
  z-index: 1;
`;

const TopButton = styled(RightButton)<{ selected: boolean }>`
  color: ${({ selected }) => (selected ? "#1677ff" : "#434343")};
  background-color: ${({ selected }) => (selected ? "#e6f4ff" : undefined)};
`;

const SideBarWrapper = styled.div`
  background-color: #fafafa;
  padding: 8px;
  width: 400px;
  max-height: 100%;
  overflow-y: auto;
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

export default ContentForm;
