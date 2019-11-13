import { composeWithMongoose } from 'graphql-compose-mongoose';
import Treasury from './treasury.model';

const customizationOptions = {}; // left it empty for simplicity, described below
const UserTC = composeWithMongoose(Treasury, customizationOptions);

// STEP 3: Add needed CRUD User operations to the GraphQL Schema
// via graphql-compose it will be much much easier, with less typing
export const TreasuryQuery = {
  treasuryOne: UserTC.getResolver('findOne')
  // userById: UserTC.getResolver('findById'),
  // userByIds: UserTC.getResolver('findByIds'),
  // userMany: UserTC.getResolver('findMany'),
  // userCount: UserTC.getResolver('count'),
  // userConnection: UserTC.getResolver('connection'),
  // userPagination: UserTC.getResolver('pagination'),
};

export const TreasuryMutation = {};

// schemaComposer.Mutation.addFields({
//   //   userCreateOne: UserTC.getResolver('createOne'),
//   //   userCreateMany: UserTC.getResolver('createMany'),
//   //   userUpdateById: UserTC.getResolver('updateById'),
//   //   userUpdateOne: UserTC.getResolver('updateOne'),
//   //   userUpdateMany: UserTC.getResolver('updateMany'),
//   //   userRemoveById: UserTC.getResolver('removeById'),
//   //   userRemoveOne: UserTC.getResolver('removeOne'),
//   //   userRemoveMany: UserTC.getResolver('removeMany'),
// });
