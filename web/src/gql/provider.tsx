import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  HttpLink,
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
} from "@apollo/client";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { ApolloProvider } from "@apollo/client/react";
import { getMainDefinition } from "@apollo/client/utilities";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";
import { createClient } from "graphql-ws";

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
  const wsEndpoint = endpoint.startsWith("http")
    ? endpoint.replace(/^http/, "ws")
    : `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}${endpoint}`;

  const authLink = new SetContextLink(async (prevContext, _operation) => {
    // get the authentication token from local storage if it exists
    const accessToken = window.REEARTH_E2E_ACCESS_TOKEN || (await getAccessToken());
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...prevContext.headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    };
  });

  const uploadLink = new UploadHttpLink({ uri: endpoint });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: wsEndpoint,
      connectionParams: async () => {
        const accessToken = window.REEARTH_E2E_ACCESS_TOKEN || (await getAccessToken());
        return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      },
      on: {
        connected: () => console.log("[GQL_WS] Connected"),
        closed: event => console.log("[GQL_WS] Closed: ", event),
        error: error => console.error("[GQL_WS] Error: ", error),
      },
    }),
  );

  const errorLink = new ErrorLink(({ error, operation }) => {
    if (!error) return;

    let message = "";

    if (CombinedGraphQLErrors.is(error)) {
      message = error.errors.map(e => e.message).join(", ");
    } else if (CombinedProtocolErrors.is(error)) {
      message = error.errors.map(e => e.message).join(", ");
    } else {
      message = error.message;
    }

    if (!!message && operation.operationName !== "GetAsset") {
      Notification.error({ message });
    }
  });

  const cache = new InMemoryCache({
    typePolicies: {
      Item: {
        keyFields: obj => `${obj.id}-${obj.version}`,
      },
    },
  });

  const httpLink = new HttpLink({ uri: endpoint, credentials: "include" });

  const client = new ApolloClient({
    link: ApolloLink.from([
      errorLink,
      ApolloLink.split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" && definition.operation === "subscription"
          );
        },
        ApolloLink.from([wsLink, httpLink]),
        ApolloLink.from([authLink, uploadLink]),
      ),
    ]),
    cache,
    devtools: { enabled: process.env.NODE_ENV === "development" },
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default Provider;
