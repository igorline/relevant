import { composeWithMongoose } from 'graphql-compose-mongoose';
import { PubSub } from 'apollo-server';
import User from './user.model';

const USER_UPDATED = 'USER_UPDATED';

const pubsub = new PubSub();

const remove = Object.keys(User.schema.paths).filter(
  key => User.schema.paths[key].options.select === false
);

const customizationOptions = {};
const TC = composeWithMongoose(User, customizationOptions);

// async function testSub() {
//   const user = await User.findOne({ handle: 'slava' }, '+email');
//   setInterval(() => {
//     user.balance += 10;
//     pubsub.publish(USER_UPDATED, user);
//   }, 1000);
// }
// testSub();

remove.map(field =>
  TC.extendField(field, {
    description: 'Only visible to owner',
    resolve: (source, args, context) => {
      const isOwner = context.user && source._id.equals(context.user._id);
      return isOwner ? source[field] : null;
    }
  })
);

// STEP 3: Add needed CRUD User operations to the GraphQL Schema
// via graphql-compose it will be much much easier, with less typing
export const userQuery = {
  userOne: TC.getResolver('findOne'),

  // userById: TC.getResolver('findById'),
  // userByIds: TC.getResolver('findByIds'),
  // userMany: TC.getResolver('findMany'),
  // userCount: TC.getResolver('count'),
  // userConnection: TC.getResolver('connection'),
  // userPagination: TC.getResolver('pagination')

  me: TC.getResolver('findOne').wrapResolve(next => rp => {
    if (!rp.context.user) return null;
    rp.args.user = rp.context.user._id;
    return next(rp);
  })
};

// TC.addFields({
//   test: { type: 'String' }
// });

export const userSubscription = {
  userUpdated: {
    type: TC.getType(),
    // args: {
    //   userId: 'ID!'
    // },
    description: 'Subscribe to userUpdated',
    resolve: payload => payload,
    subscribe: () => pubsub.asyncIterator([USER_UPDATED])
  }
};

export const userMutation = {};

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
