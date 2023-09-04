import { useCallback } from "react";

import { useIsItemReferencedLazyQuery } from "@reearth-cms/gql/graphql-client-api";

export default () => {
  const [checkIfItemIsReferenced, { data }] = useIsItemReferencedLazyQuery({
    fetchPolicy: "no-cache",
  });

  const handleCheckItemReference = useCallback(
    async (value?: string, correspondingFieldId: string) =>
      await checkIfItemIsReferenced({ variables: { itemId: value ?? "", correspondingFieldId } }),
    [checkIfItemIsReferenced],
  );

  return {
    isReferenced: data?.isItemReferenced,
    handleCheckItemReference,
  };
};
