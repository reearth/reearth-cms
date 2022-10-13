import { useCallback, useMemo } from "react";

import { FieldType } from "@reearth-cms/components/molecules/Schema/types";
import {
  SchemaFiledType,
  useCreateItemMutation,
  useUpdateItemMutation,
} from "@reearth-cms/gql/graphql-client-api";

import useContentHooks from "../hooks";

type Props = {
  itemId: string | undefined;
};

export default ({ itemId }: Props) => {
  const { currentModel, itemsData } = useContentHooks();

  const [createNewItem] = useCreateItemMutation({
    refetchQueries: ["GetItems"],
  });

  const handleItemCreate = useCallback(
    async (data: {
      schemaId: string;
      fields: { schemaFieldId: string; type: FieldType; value: string }[];
    }) => {
      const item = await createNewItem({
        variables: {
          schemaId: data.schemaId,
          fields: data.fields.map(field => ({ ...field, type: field.type as SchemaFiledType })),
        },
      });
      if (item.errors || !item.data?.createItem) {
        // TODO: notification
        return;
      }
    },
    [createNewItem],
  );

  const [updateItem] = useUpdateItemMutation({
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
        // TODO: notification
        return;
      }
    },
    [updateItem],
  );

  const initialFormValues: { [key: string]: any } = useMemo(() => {
    const initialValues: { [key: string]: any } = {};
    if (!itemId) {
      currentModel?.schema.fields.forEach(field => {
        switch (field.type) {
          case "Select":
            initialValues[field.id] = field.typeProperty.selectDefaultValue;
            break;
          case "Integer":
            initialValues[field.id] = field.typeProperty.integerDefaultValue;
            break;
          default:
            initialValues[field.id] = field.typeProperty.defaultValue;
            break;
        }
      });
    } else {
      const item = itemsData?.items.nodes.find(item => item?.id === itemId);
      item?.fields?.forEach(field => {
        initialValues[field.schemaFieldId] = field.value;
      });
    }
    return initialValues;
  }, [itemsData?.items.nodes, itemId, currentModel?.schema.fields]);

  return {
    initialFormValues,
    currentModel,
    handleItemCreate,
    handleItemUpdate,
  };
};
