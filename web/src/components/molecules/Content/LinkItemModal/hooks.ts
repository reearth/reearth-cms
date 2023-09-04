import { useCallback } from "react";

// import { useCheckIfItemIsReferencedLazyQuery } from "@reearth-cms/gql/graphql-client-api";

export default () => {
  // const [checkIfItemIsReferenced, { data }] = useCheckIfItemIsReferencedLazyQuery({
  //   fetchPolicy: "no-cache",
  // });

  // const handleCheckItemReference = useCallback(
  //   async (value?: string) => await checkIfItemIsReferenced({ variables: { itemId: value ?? "" } }),
  //   [checkIfItemIsReferenced],
  // );

  const handleCheckItemReference = useCallback(async (value?: string) => true, []);

  return {
    isReferenced: true, // data?.checkIfItemIsReferenced,
    handleCheckItemReference,
  };
};
