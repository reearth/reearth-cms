import { ApolloProvider, ApolloClient, ApolloLink, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

import { useAuth } from "@reearth-cms/auth";
import Notification from "@reearth-cms/components/atoms/Notification";

type Props = {
  children?: React.ReactNode;
};

if (process.env.NODE_ENV === "development") {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

const Provider: React.FC<Props> = ({ children }) => {
  const endpoint = window.REEARTH_CONFIG?.api
    ? `${window.REEARTH_CONFIG.api}/graphql`
    : "/api/graphql";
  const { getAccessToken } = useAuth();

  const authLink = setContext(async (_, { headers }) => {
    // get the authentication token from local storage if it exists
    const accessToken = window.REEARTH_E2E_ACCESS_TOKEN || (await getAccessToken());
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    };
  });

  const uploadLink = createUploadLink({
    uri: endpoint,
  }) as unknown as ApolloLink;

  const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    if (!networkError && !graphQLErrors) return;
    const error = networkError?.message ?? graphQLErrors?.map(e => e.message).join(", ");
    if (error && operation.operationName !== "GetAsset") {
      Notification.error({ message: error });
    }
  });

  const cache = new InMemoryCache({
    typePolicies: {
      Item: {
        keyFields: obj => `${obj.id}-${obj.version}`,
      },
    },
  });

  const httpLink = new HttpLink({ uri: endpoint, credentials: "includes" });

  const client = new ApolloClient({
    link: ApolloLink.from([errorLink, authLink, uploadLink, httpLink]),
    cache,
    devtools: { enabled: process.env.NODE_ENV === "development" },
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default Provider;
