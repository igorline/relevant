import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import schema from 'server/graphql/schema';
import { SchemaLink } from 'apollo-link-schema';
// import { getToken } from 'utils/storage';

// let SchemaLink;
// let schema;

const cache = new InMemoryCache();

export const client = new ApolloClient({
  cache,
  link: new SchemaLink({ schema }),
  ssrMode: true
  // resolvers,
  // typeDefs,
});
