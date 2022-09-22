import { useCallback, useMemo } from "react";

import { FieldType } from "@reearth-cms/components/molecules/Schema/types";
import {
  SchemaFiledType,
  useCreateItemMutation,
  useGetItemsQuery,
  useUpdateItemMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useModel } from "@reearth-cms/state";

type Props = {
  schemaID: string | undefined;
  itemID: string | undefined;
};

export default ({ schemaID, itemID }: Props) => {
  const [currentModel, setModel] = useModel();

  const [createNewItem] = useCreateItemMutation({
    refetchQueries: ["GetItems"],
  });

  const handleItemCreate = useCallback(
    async (data: {
      schemaID: string;
      fields: { schemaFieldID: string; type: FieldType; value: string }[];
    }) => {
      if (!data.schemaID) return;

      const item = await createNewItem({
        variables: {
          schemaID: data.schemaID,
          fields: data.fields.map(field => ({ ...field, type: field.type as SchemaFiledType })),
        },
      });
      if (item.errors || !item.data?.createItem) {
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
      itemID: string;
      fields: { schemaFieldID: string; type: FieldType; value: string }[];
    }) => {
      if (!data.itemID) return;
      const item = await updateItem({
        variables: {
          itemID: data.itemID,
          fields: data.fields.map(field => ({ ...field, type: field.type as SchemaFiledType })),
        },
      });
      if (item.errors || !item.data?.updateItem) {
        return;
      }
    },
    [updateItem],
  );

  const { data } = useGetItemsQuery({
    variables: { schemaID: schemaID ?? "", first: 100 },
    skip: !schemaID,
  });
  const initialValues = useMemo(() => {
    const itemConst = data?.items.nodes.find(item => item?.id === itemID);

    const initialValuesReturn: any = {};
    itemConst?.fields?.forEach(field => {
      initialValuesReturn[field.schemaFieldID] = field.value;
    });
    return initialValuesReturn;
  }, [data?.items.nodes, itemID]);

  const defaultValues = useMemo(() => {
    const defaultValuesReturn: any = {};
    currentModel?.schema.fields.forEach(field => {
      if (field.type === "Select") {
        defaultValuesReturn[field.id] = field.typeProperty.selectDefaultValue;
      } else if (field.type === "Integer") {
        console.log(field.typeProperty);

        defaultValuesReturn[field.id] = field.typeProperty.integerDefaultValue;
      } else {
        defaultValuesReturn[field.id] = field.typeProperty.defaultValue;
      }
    });
    return defaultValuesReturn;
  }, [currentModel?.schema.fields]);

  return {
    initialValues,
    defaultValues,
    currentModel,
    setModel,
    handleItemCreate,
    handleItemUpdate,
  };
};
