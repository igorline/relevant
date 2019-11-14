import { schemaComposer } from 'graphql-compose';
import { treasuryQuery } from 'server/api/treasury/treasury.schema';
import { userQuery, userSubscription } from 'server/api/user/user.schema';

schemaComposer.Query.addFields({
  ...treasuryQuery,
  ...userQuery
});

schemaComposer.Subscription.addFields({
  ...userSubscription
});

export default schemaComposer.buildSchema();
