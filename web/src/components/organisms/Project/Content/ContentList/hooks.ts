import { useMemo } from "react";

import { Item } from "@reearth-cms/components/molecules/Content/types";
import { useGetItemsQuery } from "@reearth-cms/gql/graphql-client-api";
import { useModel } from "@reearth-cms/state";

export default () => {
  const [currentModel] = useModel();
  const { data } = useGetItemsQuery({
    variables: { schemaID: currentModel?.schema.id ?? "", first: 100 },
    skip: !currentModel?.schema.id,
  });

  const items = useMemo(() => {
    return data?.items.nodes
      ?.map<Item | undefined>(item =>
        item
          ? {
              id: item.id,
              schemaID: item.schemaID,
              fields: item.fields,
            }
          : undefined,
      )
      .filter((item): item is Item => !!item);
  }, [data?.items.nodes]);

  return {
    items,
  };
};
