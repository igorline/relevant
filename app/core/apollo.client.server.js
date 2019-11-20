import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import schema from 'server/graphql/schema';
import { SchemaLink } from 'apollo-link-schema';
import { getToken } from 'utils/storage';
import { setContext } from 'apollo-link-context';
import { concat } from 'apollo-link';

const cache = new InMemoryCache({
  dataIdFromObject: object => object._id || null
});

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

export const client = new ApolloClient({
  cache,
  link: concat(authMiddleware, new SchemaLink({ schema })),
  ssrMode: true
});
