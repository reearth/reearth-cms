import { ApolloProvider, ApolloClient, ApolloLink, InMemoryCache, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { createClient } from "graphql-ws";

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
  const wsEndpoint = endpoint.startsWith("http")
    ? endpoint.replace(/^http/, "ws")
    : `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}${endpoint}`;

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

  const wsLink = new GraphQLWsLink(
    createClient({
      url: wsEndpoint,
      connectionParams: async () => {
        const accessToken = window.REEARTH_E2E_ACCESS_TOKEN || (await getAccessToken());
        return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      },
    }),
  );

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

  const client = new ApolloClient({
    uri: endpoint,
    link: ApolloLink.from([
      errorLink,
      split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },
        wsLink,
        ApolloLink.from([authLink, uploadLink]),
      ),
    ]),
    cache,
    connectToDevTools: process.env.NODE_ENV === "development",
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default Provider;
