import {
  ApolloClient,
  ApolloLink,
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { ApolloProvider } from "@apollo/client/react";
import { getMainDefinition } from "@apollo/client/utilities";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";
import { print } from "graphql";
import { createClient as createSSEClient } from "graphql-sse";
import { createClient } from "graphql-ws";

import { useAuth } from "@reearth-cms/auth";
import Notification from "@reearth-cms/components/atoms/Notification";

type Props = {
  children?: React.ReactNode;
};
function _getHttpProtocol(): "HTTP/2" | "HTTP/3" | "HTTP/1.1" | "HTTP/1.0" | "Unknown" {
  const navEntry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  if (!navEntry) return "Unknown";

  switch (navEntry.nextHopProtocol) {
    case "h2":
      return "HTTP/2";
    case "h3":
      return "HTTP/3";
    case "http/1.1":
      return "HTTP/1.1";
    case "http/1.0":
      return "HTTP/1.0";
    default:
      return "Unknown";
  }
}
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
    const accessToken = window.REEARTH_E2E_ACCESS_TOKEN || (await getAccessToken());
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

  const sseClient = createSSEClient({
    url: endpoint,
    singleConnection: false,
    headers: async (): Promise<Record<string, string>> => {
      const accessToken = window.REEARTH_E2E_ACCESS_TOKEN || (await getAccessToken());
      return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    },
  });

  const sseLink = new ApolloLink(
    operation =>
      new Observable(observer => {
        let cancelled = false;
        let iterator: AsyncIterableIterator<unknown> | null = null;

        (async () => {
          try {
            iterator = sseClient.iterate({
              query: print(operation.query),
              variables: operation.variables,
              operationName: operation.operationName ?? undefined,
            });

            for await (const result of iterator) {
              if (cancelled) break;
              observer.next(result as { data?: Record<string, unknown> | null });
            }

            if (!cancelled) observer.complete();
          } catch (err) {
            if (!cancelled) observer.error(err);
          }
        })();

        return () => {
          cancelled = true;
          iterator?.return?.();
        };
      }),
  );

  const isE2E = () => !!window.REEARTH_E2E_ACCESS_TOKEN;

  const gqlLog = (entry: Record<string, unknown>) => {
    if (isE2E()) {
      console.warn("[GQL_LOG]", JSON.stringify({ ...entry, timestamp: new Date().toISOString() }));
    }
  };

  const retryLink = new RetryLink({
    delay: {
      initial: 500,
      max: 3000,
      jitter: true,
    },
    attempts: (attempt, operation, error) => {
      const isRetryable =
        !!error && /Failed to fetch|NetworkError|Network request failed/.test(error.message ?? "");
      if (attempt > 1 && isRetryable) {
        gqlLog({
          type: "retry",
          operation: operation.operationName,
          attempt,
          error: error.message,
        });
      }
      return attempt <= 3 && isRetryable;
    },
  });

  const loggingLink = new ErrorLink(({ error, operation }) => {
    if (!error || !isE2E()) return;

    let errorType = "unknown";
    let message = "";

    if (CombinedGraphQLErrors.is(error)) {
      errorType = "graphql";
      message = error.errors.map(e => e.message).join(", ");
    } else if (CombinedProtocolErrors.is(error)) {
      errorType = "protocol";
      message = error.errors.map(e => e.message).join(", ");
    } else {
      errorType = /Failed to fetch|NetworkError|Network request failed/.test(error.message ?? "")
        ? "network"
        : "unknown";
      message = error.message;
    }

    gqlLog({ type: "error", operation: operation.operationName, errorType, message });
  });

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

  const isSubscription = (operation: ApolloLink.Operation): boolean => {
    const definition = getMainDefinition(operation.query);
    return definition.kind === "OperationDefinition" && definition.operation === "subscription";
  };

  const shouldUseWebSocket = (operation: ApolloLink.Operation): boolean => {
    const context = operation.getContext() as { useWS?: boolean };
    return !!context.useWS;
  };

  const client = new ApolloClient({
    link: ApolloLink.from([
      retryLink,
      loggingLink,
      errorLink,
      ApolloLink.split(
        isSubscription,
        ApolloLink.split(shouldUseWebSocket, wsLink, sseLink), // Subscriptions: WS or SSE
        ApolloLink.from([authLink, uploadLink]), // Queries/mutations
      ),
    ]),
    cache,
    devtools: { enabled: process.env.NODE_ENV === "development" },
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default Provider;
