import { useCallback } from "react";

import { useSearchItemQuery } from "@reearth-cms/gql/graphql-client-api";
import { useModel, useProject } from "@reearth-cms/state";

export default () => {
  const [currentModel] = useModel();
  const [currentProject] = useProject();
  const {
    data: itemsData,
    refetch,
    loading: itemsDataLoading,
  } = useSearchItemQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      query: { project: currentProject?.id as string, schema: currentModel?.schema.id ?? "" },
      pagination: { first: 1000 },
    },
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
