import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  HttpLink,
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
} from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

import { useAuth } from "@reearth-cms/auth";
import Notification from "@reearth-cms/components/atoms/Notification";
import { ApolloProvider } from "@apollo/client/react";

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

  const authLink = new SetContextLink(async (prevContext, operation) => {
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

  const uploadLink = createUploadLink({
    uri: endpoint,
  }) as unknown as ApolloLink;

  const errorLink = new ErrorLink(({ error, operation }) => {
    if (!error) return;

    let message: string = "";

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
    link: ApolloLink.from([errorLink, authLink, uploadLink, httpLink]),
    cache,
    devtools: { enabled: process.env.NODE_ENV === "development" },
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default Provider;
