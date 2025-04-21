import { ApolloProvider, ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { useMemo } from "react";

import { useAuth } from "@reearth-cms/auth";
import Notification from "@reearth-cms/components/atoms/Notification";

type Props = {
  children?: React.ReactNode;
};

const Provider: React.FC<Props> = ({ children }) => {
  const endpoint = window.REEARTH_CONFIG?.api
    ? `${window.REEARTH_CONFIG.api}/graphql`
    : "/api/graphql";

  const { getAccessToken } = useAuth();

  const authLink = useMemo(
    () =>
      setContext(async (_, { headers }) => {
        const token = window.REEARTH_E2E_ACCESS_TOKEN || (await getAccessToken());
        return {
          headers: {
            ...headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        };
      }),
    [getAccessToken],
  );

  const uploadLink = useMemo(
    () =>
      createUploadLink({
        uri: endpoint,
      }) as unknown as ApolloLink,
    [endpoint],
  );

  const errorLink = useMemo(
    () =>
      onError(({ graphQLErrors, networkError, operation }) => {
        if (!networkError && !graphQLErrors) return;
        const error = networkError?.message || graphQLErrors?.map(e => e.message).join(", ");
        if (error && operation.operationName !== "GetAsset") {
          Notification.error({ message: error });
        }
      }),
    [],
  );

  const cache = useMemo(
    () =>
      new InMemoryCache({
        typePolicies: {
          Item: {
            keyFields: obj => `${obj.id}-${obj.version}`,
          },
        },
      }),
    [],
  );

  const client = useMemo(
    () =>
      new ApolloClient({
        link: ApolloLink.from([errorLink, authLink, uploadLink]),
        cache,
        connectToDevTools: process.env.NODE_ENV === "development",
      }),
    [authLink, errorLink, uploadLink, cache],
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default Provider;
