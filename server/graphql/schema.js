import { schemaComposer } from 'graphql-compose';
import { TreasuryQuery } from 'server/api/treasury/treasury.gql';

schemaComposer.Query.addFields({
  ...TreasuryQuery
});

export default schemaComposer.buildSchema();
