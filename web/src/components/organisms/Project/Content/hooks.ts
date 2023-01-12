import { useCallback } from "react";

import { useGetItemsQuery } from "@reearth-cms/gql/graphql-client-api";
import { useModel } from "@reearth-cms/state";

export default () => {
  const [currentModel] = useModel();
  const {
    data: itemsData,
    refetch,
    loading: itemsDataLoading,
  } = useGetItemsQuery({
    notifyOnNetworkStatusChange: true,
    variables: { schemaId: currentModel?.schema.id ?? "", pagination: { first: 1000 } },
    skip: !currentModel?.schema.id,
  });

  const handleItemsReload = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    handleItemsReload,
    itemsDataLoading,
    currentModel,
    itemsData,
  };
};
