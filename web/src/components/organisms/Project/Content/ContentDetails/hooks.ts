import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Item } from "@reearth-cms/components/molecules/Content/types";
import { FieldType } from "@reearth-cms/components/molecules/Schema/types";
import {
  Item as GQLItem,
  SchemaFiledType,
  useCreateItemMutation,
  useUpdateItemMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

import { convertItem } from "../convertItem";
import useContentHooks from "../hooks";

export default () => {
  const { currentModel, itemsData } = useContentHooks();
  const navigate = useNavigate();
  const { projectId, workspaceId, itemId } = useParams();
  const [collapsed, collapse] = useState(false);
  const t = useT();

  const handleNavigateToModel = useCallback(
    (modelId?: string) => {
      navigate(`/workspace/${workspaceId}/project/${projectId}/content/${modelId}`);
    },
    [navigate, workspaceId, projectId],
  );
  const [createNewItem, { loading: itemCreationLoading }] = useCreateItemMutation({
    refetchQueries: ["GetItems"],
  });

  const handleItemCreate = useCallback(
    async (data: {
      schemaId: string;
      fields: { schemaFieldId: string; type: FieldType; value: string }[];
    }) => {
      if (!currentModel?.id) return;
      const item = await createNewItem({
        variables: {
          modelId: currentModel.id,
          schemaId: data.schemaId,
          fields: data.fields.map(field => ({ ...field, type: field.type as SchemaFiledType })),
        },
      });
      if (item.errors || !item.data?.createItem) {
        Notification.error({ message: t("Failed to create item.") });
        return;
      }
      navigate(
        `/workspace/${workspaceId}/project/${projectId}/content/${currentModel?.id}/details/${item.data.createItem.item.id}`,
      );
      Notification.success({ message: t("Successfully created Item!") });
    },
    [currentModel, projectId, workspaceId, createNewItem, navigate, t],
  );

  const [updateItem, { loading: itemUpdatingLoading }] = useUpdateItemMutation({
    refetchQueries: ["GetItems"],
  });

  const handleItemUpdate = useCallback(
    async (data: {
      itemId: string;
      fields: { schemaFieldId: string; type: FieldType; value: string }[];
    }) => {
      const item = await updateItem({
        variables: {
          itemId: data.itemId,
          fields: data.fields.map(field => ({ ...field, type: field.type as SchemaFiledType })),
        },
      });
      if (item.errors || !item.data?.updateItem) {
        Notification.error({ message: t("Failed to update item.") });
        return;
      }

      Notification.success({ message: t("Successfully updated Item!") });
    },
    [updateItem, t],
  );

  const currentItem: Item | undefined = useMemo(
    () => convertItem(itemsData?.items.nodes.find(item => item?.id === itemId) as GQLItem),
    [itemId, itemsData?.items.nodes],
  );

  const initialFormValues: { [key: string]: any } = useMemo(() => {
    const initialValues: { [key: string]: any } = {};
    if (!currentItem) {
      currentModel?.schema.fields.forEach(field => {
        switch (field.type) {
          case "Select":
            initialValues[field.id] = field.typeProperty.selectDefaultValue;
            break;
          case "Integer":
            initialValues[field.id] = field.typeProperty.integerDefaultValue;
            break;
          case "Asset":
            initialValues[field.id] = field.typeProperty.assetDefaultValue;
            break;
          default:
            initialValues[field.id] = field.typeProperty.defaultValue;
            break;
        }
      });
    } else {
      currentItem?.fields?.forEach(field => {
        initialValues[field.schemaFieldId] = field.value;
      });
    }
    return initialValues;
  }, [currentItem, currentModel?.schema.fields]);

  return {
    itemId,
    currentModel,
    currentItem,
    initialFormValues,
    itemCreationLoading,
    itemUpdatingLoading,
    collapsed,
    collapse,
    handleItemCreate,
    handleItemUpdate,
    handleNavigateToModel,
  };
};
