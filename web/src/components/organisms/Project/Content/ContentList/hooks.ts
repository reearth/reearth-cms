import { useMemo } from "react";

import { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import { ContentTableField, Item } from "@reearth-cms/components/molecules/Content/types";
import { useGetItemsQuery } from "@reearth-cms/gql/graphql-client-api";
import { useModel } from "@reearth-cms/state";

export default () => {
  const [currentModel] = useModel();
  const { data } = useGetItemsQuery({
    variables: { schemaID: currentModel?.schema.id ?? "", first: 100 },
    skip: !currentModel?.schema.id,
  });

  const contentTableFields = useMemo((): ContentTableField[] | undefined => {
    return data?.items.nodes
      ?.map(item =>
        item
          ? {
              ...item,
              fields: item?.fields?.reduce(
                (obj, field) => Object.assign(obj, { [field.schemaFieldID]: field.value }),
                {},
              ),
            }
          : undefined,
      )
      .filter((contentTableField): contentTableField is ContentTableField => !!contentTableField);
  }, [data?.items.nodes]);

  const contentTableColumns = useMemo((): ProColumns<Item>[] | undefined => {
    return currentModel?.schema.fields.map(field => ({
      title: field.title,
      dataIndex: ["fields", field.id],
      key: field.id,
    }));
  }, [currentModel?.schema.fields]);

  return {
    currentModel,
    contentTableFields,
    contentTableColumns,
  };
};
