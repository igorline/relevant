import { schemaComposer } from 'graphql-compose';
import { treasuryQuery } from 'server/api/treasury/treasury.schema';
import { userQuery, userSubscription } from 'server/api/user/user.schema';
import {
  memberQuery,
  memberMutation,
  memberSubscription
} from 'server/api/community/member.schema';

schemaComposer.Query.addFields({
  ...treasuryQuery,
  ...userQuery,
  ...memberQuery
});

schemaComposer.Subscription.addFields({
  ...userSubscription,
  ...memberSubscription
});

schemaComposer.Mutation.addFields({
  ...memberMutation
});

export default schemaComposer.buildSchema();
