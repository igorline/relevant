import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { getToken } from 'utils/storage';
import { setContext } from 'apollo-link-context';
import { concat, split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

const cache = new InMemoryCache();
cache.restore(window.__APOLLO_STATE__);

const uri = process.env.API_SERVER.length ? process.env.API_SERVER : 'localhost:3000';
const wsUri = process.env.API_SERVER.length
  ? process.env.API_SERVER + ':3001'
  : 'localhost:3001';

const wsLink = new WebSocketLink({
  uri: `ws://${wsUri}/graphql`,
  options: {
    reconnect: true
  }
});

const subscriptionMiddleware = {
  applyMiddleware: async (options, next) => {
    options.token = await getToken();
    next();
  }
};
wsLink.subscriptionClient.use([subscriptionMiddleware]);

const httpLink = new HttpLink({ uri: `http://${uri}/graphql` });

const authMiddleware = setContext(async (req, { headers }) => {
  const token = await getToken();
  return {
    credentials: 'include',
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  };
});

const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  cache,
  link: concat(authMiddleware, link)
});
