import { useMemo } from "react";

import { useGetGroupQuery, Group } from "@reearth-cms/gql/graphql-client-api";
import { fromGraphQLGroup } from "@reearth-cms/utils/values";

export default (groupId: string) => {
  const { data } = useGetGroupQuery({
    fetchPolicy: "no-cache",
    variables: { id: groupId ?? "" },
    skip: !groupId,
  });

  const group = useMemo(() => {
    return fromGraphQLGroup(data?.node as Group);
  }, [data?.node]);

  return {
    group,
  };
};
