import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { getToken } from 'utils/storage';
import { setContext } from 'apollo-link-context';
import { concat } from 'apollo-link';

const cache = new InMemoryCache();
cache.restore(window.__APOLLO_STATE__);

const uri = process.env.API_SERVER.length
  ? process.env.API_SERVER
  : 'http://localhost:3000';

const httpLink = new HttpLink({ uri: uri + '/graphql' });

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
  link: concat(authMiddleware, httpLink)
});
