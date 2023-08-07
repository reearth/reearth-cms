import { useCallback } from "react";

import { useCheckIfItemIsReferencedLazyQuery } from "@reearth-cms/gql/graphql-client-api";

export default () => {
  const [checkIfItemIsReferenced, { data }] = useCheckIfItemIsReferencedLazyQuery({
    fetchPolicy: "no-cache",
  });

  const handleCheckItemReference = useCallback(
    async (value?: string) => await checkIfItemIsReferenced({ variables: { itemId: value ?? "" } }),
    [checkIfItemIsReferenced],
  );

  return {
    isReferenced: data?.checkIfItemIsReferenced,
    handleCheckItemReference,
  };
};
