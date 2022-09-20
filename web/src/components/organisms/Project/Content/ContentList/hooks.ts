import { useMemo } from "react";

import { Item } from "@reearth-cms/components/molecules/Content/types";
import { useGetItemsQuery } from "@reearth-cms/gql/graphql-client-api";

type Props = {
  schemaID: string | undefined;
};

export default ({ schemaID }: Props) => {
  const { data } = useGetItemsQuery({
    variables: { schemaID: schemaID ?? "", first: 100 },
    skip: !schemaID,
  });

  const items = useMemo(() => {
    return (data?.items.nodes ?? [])
      .map<Item | undefined>(item =>
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

  console.log(items);

  return {
    items,
  };
};
