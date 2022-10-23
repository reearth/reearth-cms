import { useCallback } from "react";

import { useGetItemsQuery } from "@reearth-cms/gql/graphql-client-api";
import { useModel } from "@reearth-cms/state";

export default () => {
  const [currentModel] = useModel();
  const { data: itemsData, refetch } = useGetItemsQuery({
    variables: { schemaId: currentModel?.schema.id ?? "", first: 100 },
    skip: !currentModel?.schema.id,
  });

  const handleItemsReload = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    handleItemsReload,
    currentModel,
    itemsData,
  };
};
