import moment from "moment";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useBlocker } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Form from "@reearth-cms/components/atoms/Form";
import Notification from "@reearth-cms/components/atoms/Notification";
import Space from "@reearth-cms/components/atoms/Space";
import {
  Item,
  FormItem,
  ItemField,
  ItemValue,
} from "@reearth-cms/components/molecules/Content/types";
import { FieldType, Group, Model, Field } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { transformMomentToString } from "@reearth-cms/utils/format";

export default (
  formItemsData: FormItem[],
  initialFormValues: any,
  initialMetaFormValues: any,
  onItemCreate: (data: {
    schemaId: string;
    metaSchemaId?: string;
    fields: ItemField[];
    metaFields: ItemField[];
  }) => Promise<void>,
  onItemUpdate: (data: { itemId: string; fields: ItemField[] }) => Promise<void>,
  onMetaItemUpdate: (data: { metaItemId: string; metaFields: ItemField[] }) => Promise<void>,
  onBack: (modelId?: string) => void,
  onUnpublish: (itemIds: string[]) => Promise<void>,
  onPublish: (itemIds: string[]) => Promise<void>,
  onModalOpen: () => void,
  onAddItemToRequestModalOpen: () => void,
  item?: Item,
  groups?: Group[],
  showPublishAction?: boolean,
  itemId?: string,
  model?: Model,
) => {
  const t = useT();
  const [form] = Form.useForm();
  const [metaForm] = Form.useForm();
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const changedKeys = useRef(new Set<string>());

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      currentLocation.pathname !== nextLocation.pathname && changedKeys.current.size > 0,
  );

  const checkIfSingleGroupField = useCallback(
    (key: string, value: any) => {
      return (
        initialFormValues[key] &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !moment.isMoment(value) &&
        value !== null
      );
    },
    [initialFormValues],
  );

  const emptyConvert = useCallback((value: any) => {
    if (value === "" || value === null || (Array.isArray(value) && value.length === 0)) {
      return undefined;
    } else {
      return value;
    }
  }, []);

  const handleValuesChange = useCallback(
    (changedValues: any) => {
      const [key, value] = Object.entries(changedValues)[0];
      if (checkIfSingleGroupField(key, value)) {
        const [groupFieldKey, groupFieldValue] = Object.entries(initialFormValues[key])[0];
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

  const inputValueGet = useCallback((value: ItemValue, multiple: boolean) => {
    if (multiple) {
      if (Array.isArray(value)) {
        return value.map(v => (moment.isMoment(v) ? transformMomentToString(v) : v));
      } else {
        return [];
      }
    } else {
      return moment.isMoment(value) ? transformMomentToString(value) : value ?? "";
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      const modelFields = new Map((model?.schema.fields || []).map(field => [field.id, field]));
      const groupIdsInCurrentModel = new Set();
      model?.schema.fields?.forEach(field => {
        if (field.type === "Group") groupIdsInCurrentModel.add(field.typeProperty?.groupId);
      });
      const groupFields = new Map<string, Field>();
      groups
        ?.filter(group => groupIdsInCurrentModel.has(group.id))
        .forEach(group => {
          group?.schema.fields?.forEach(field => groupFields.set(field.id, field));
        });
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
            value: moment.isMoment(value) ? transformMomentToString(value) : value ?? "",
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
    inputValueGet,
    onItemUpdate,
    onItemCreate,
  ]);

  const handleMetaUpdate = useCallback(async () => {
    if (!itemId || !item?.metadata?.id) return;
    try {
      const metaValues = await metaForm.validateFields();
      const metaFields: { schemaFieldId: string; type: FieldType; value: string }[] = [];
      for (const [key, value] of Object.entries(metaValues)) {
        metaFields.push({
          value: (moment.isMoment(value) ? transformMomentToString(value) : value ?? "") as string,
          schemaFieldId: key,
          type: model?.metadataSchema?.fields?.find(field => field.id === key)?.type as FieldType,
        });
      }
      await onMetaItemUpdate?.({
        metaItemId: item.metadata.id,
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

  return {
    items,
    form,
    metaForm,
    unpublishedItems,
    publishModalOpen,
    handleValuesChange,
    handleBack,
    handleSubmit,
    handleMetaUpdate,
    handlePublishSubmit,
    handlePublishItemClose,
  };
};
