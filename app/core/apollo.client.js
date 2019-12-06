import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { getToken } from 'utils/storage';
import { setContext } from 'apollo-link-context';
import { concat, split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

if (process.env.WEB !== 'true') {
  require('../publicenv');
}

const cache = new InMemoryCache({
  dataIdFromObject: object => object._id || null
});

cache.restore(window.__APOLLO_STATE__);

const uri = process.env.API_SERVER;
const wsUri = uri.replace('http', 'ws');

const wsLink = new WebSocketLink({
  uri: `${wsUri}/graphql`,
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

const httpLink = new HttpLink({ uri: `${uri}/graphql` });

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
