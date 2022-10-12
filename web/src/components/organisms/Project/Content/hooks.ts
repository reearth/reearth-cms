import { useGetItemsQuery } from "@reearth-cms/gql/graphql-client-api";
import { useModel } from "@reearth-cms/state";

export default () => {
  const [currentModel] = useModel();
  const { data: itemsData } = useGetItemsQuery({
    variables: { schemaID: currentModel?.schema.id ?? "", first: 100 },
    skip: !currentModel?.schema.id,
  });

  return {
    currentModel,
    itemsData,
  };
};
