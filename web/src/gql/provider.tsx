import { ApolloProvider, ApolloClient, ApolloLink, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

import { useAuth } from "@reearth-cms/auth";
import { useError } from "@reearth-cms/state";

type Props = {
  children?: React.ReactNode;
};

const Provider: React.FC<Props> = ({ children }) => {
  const endpoint = window.REEARTH_CONFIG?.api
    ? `${window.REEARTH_CONFIG.api}/graphql`
    : "/api/graphql";
  const [, setError] = useError();
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

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (!networkError && !graphQLErrors) return;
    const error = networkError?.message ?? graphQLErrors?.map(e => e.message).join(", ");
    if (error) {
      setError(error);
    }
  });

  const httpLink = new HttpLink({
    uri: endpoint,
  });

  const cache = new InMemoryCache({});

  const client = new ApolloClient({
    uri: endpoint,
    link: ApolloLink.from([errorLink, authLink, httpLink]),
    cache,
    connectToDevTools: process.env.NODE_ENV === "development",
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default Provider;
