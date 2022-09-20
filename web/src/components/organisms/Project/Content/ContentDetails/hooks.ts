import { useCallback } from "react";

import { FieldType } from "@reearth-cms/components/molecules/Schema/types";
import { SchemaFiledType, useCreateItemMutation } from "@reearth-cms/gql/graphql-client-api";
import { useModel } from "@reearth-cms/state";

export default () => {
  const [currentModel, setModel] = useModel();

  const [createNewItem] = useCreateItemMutation({
    refetchQueries: ["GetItems"],
  });

  const handleItemCreate = useCallback(
    async (data: {
      schemaID: string;
      fields: { schemaFieldID: string; type: FieldType; value: string }[];
    }) => {
      console.log("dd");

      console.log(data);

      if (!data.schemaID) return;
      console.log("here");

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

  return {
    currentModel,
    setModel,
    handleItemCreate,
  };
};
