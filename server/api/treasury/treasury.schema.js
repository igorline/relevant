import { composeWithMongoose } from 'graphql-compose-mongoose';
import User from 'server/api/user/user.model';
import Earnings from 'server/api/earnings/earnings.model';
import Community from 'server/api/community/community.model';
import Treasury from './treasury.model';

const customizationOptions = {}; // left it empty for simplicity, described below
const TreasuryTC = composeWithMongoose(Treasury, customizationOptions);

// STEP 3: Add needed CRUD User operations to the GraphQL Schema
// via graphql-compose it will be much much easier, with less typing
export const treasuryQuery = {
  distributedTokens: {
    type: `type Aggregate {
      _id: String,
      balance: Float,
      legacyTokens: Float,
      legacyAirdrop: Float,
      airdropTokens: Float,
      cashedOut: Float,
      tokenBalance: Float,
      curationRewards: Float,
      airdrop: Float,
      earned: Float,
      rewardFund: Float,
    }`,
    resolve: async () => {
      const ag = await User.aggregate([
        { $match: {} },
        {
          $group: {
            _id: '',
            balance: { $sum: '$balance' },
            legacyTokens: { $sum: '$legacyTokens' },
            airdropTokens: { $sum: '$airdropTokens' },
            legacyAirdrop: { $sum: '$legacyAirdrop' },
            cashedOut: { $sum: '$cashedOut' },
            tokenBalance: { $sum: '$tokenBalance' }
          }
        }
      ]);
      const earnigns = await Earnings.aggregate([
        { $match: { status: 'paidout' } },
        {
          $group: {
            _id: '',
            earned: { $sum: '$earned' }
          }
        }
      ]);
      const rewards = await Community.aggregate([
        { $match: {} },
        {
          $group: {
            _id: '',
            rewardFund: { $sum: '$rewardFund' }
          }
        }
      ]);
      const { earned } = earnigns[0];
      const rewardFund = rewards[0].rewardFund / 1e18;
      const { balance, legacyTokens, airdropTokens, legacyAirdrop, cashedOut } = ag[0];
      const curationRewards =
        balance - legacyTokens - airdropTokens - legacyAirdrop + cashedOut;
      const airdrop = legacyTokens + airdropTokens + legacyAirdrop;
      return { ...ag[0], curationRewards, airdrop, earned, rewardFund };
    }
  },
  treasuryOne: TreasuryTC.getResolver('findOne'),
  treasuryById: TreasuryTC.getResolver('findById'),
  treasuryByIds: TreasuryTC.getResolver('findByIds'),
  treasuryMany: TreasuryTC.getResolver('findMany'),
  treasuryCount: TreasuryTC.getResolver('count'),
  treasuryConnection: TreasuryTC.getResolver('connection'),
  treasuryPagination: TreasuryTC.getResolver('pagination')
};

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
