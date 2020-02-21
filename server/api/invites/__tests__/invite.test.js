import Invite from 'server/api/invites/invite.model';
import User from 'server/api/user/user.model';
import Notification from 'server/api/notification/notification.model';
import CommunityMember from 'server/api/community/community.member.model';
import { response } from 'jest-mock-express';
import { create, adminInvite } from 'server/api/invites/invite.controller';
import { create as createUser } from 'server/api/user/user.controller';
import { referral, referralWithEmail, adminReferral } from 'app/mockdata/invite';
import { twitter } from 'app/mockdata';
import { sanitize, toObject } from 'server/test/utils';
import { getUsers, getCommunities } from 'server/test/seedData';
import {
  totalAllowedInvites,
  TWITTER_REWARD,
  EMAIL_REWARD,
  REFERRAL_REWARD,
  newUserCoins,
  PUBLIC_LINK_REWARD,
  MAX_AIRDROP
} from 'server/config/globalConstants';
import { user2, user3 } from 'app/mockdata/user';
import computePageRank from 'server/pagerank/pagerankCompute';
import { handleTwitterAuth } from 'server/auth/twitter/passport';

// this will define the database name where the tests are run
process.env.TEST_SUITE = 'invites';

describe('CreatePost', () => {
  let {
    alice,
    bob,
    relevant,
    communityMember,
    res,
    communityId,
    invite,
    inviteWithEmail,
    aliceInitialAirdrop
  } = {};
  global.console.log = jest.fn(); // hides logs
  const next = console.log; // eslint-disable-line
  let newUser;

  beforeAll(async () => {
    ({ relevant } = getCommunities());
    ({ alice, bob } = getUsers());
    aliceInitialAirdrop = alice.airdropTokens;
    communityId = relevant._id;
    communityMember = await CommunityMember.findOne({ user: alice._id, communityId });

    // need to run this to give inital rank to admin
    await computePageRank({ community: relevant.slug, communityId });
  });

  beforeEach(() => {
    res = response();
  });

  describe('api/invite/create', () => {
    test('create invite', async () => {
      const req = {
        user: alice,
        body: referral,
        communityMember
      };
      await create(req, res, next);
      let apiRes = toObject(res.json.mock.calls[0][0]);
      invite = apiRes.invite[0];
      expect(invite.code).toBeDefined();
      apiRes = sanitize(apiRes, 'code');
      expect(apiRes).toMatchSnapshot();
    });

    test('create invite with email', async () => {
      const req = {
        user: alice,
        communityMember,
        body: referralWithEmail
      };
      await create(req, res, next);
      const apiRes = toObject(res.json.mock.calls[0][0]);
      inviteWithEmail = apiRes.invite[0];
      expect(inviteWithEmail.code).toBeDefined();
    });
  });

  describe('after invite was created', () => {
    test('invite count should update', async () => {
      const aliceMember = await CommunityMember.findOne({ user: alice._id, communityId });
      const totalInvites = totalAllowedInvites({ alice, communityId });
      expect(aliceMember.invites).toBe(totalInvites - 2);
    });

    test('should create new user with referral', async () => {
      const req = { body: { user: user2, invitecode: invite.code } };
      await createUser(req, res, next);
      const apiRes = toObject(res.json.mock.calls[0][0]);
      apiRes.user.relevance.pagerank =
        Math.round(apiRes.user.relevance.pagerank * 100) / 100;
      apiRes.user.relevance.pagerankRaw =
        Math.round(apiRes.user.relevance.pagerankRaw * 100000) / 100000;
      newUser = apiRes.user;
      const newUserClean = sanitize(apiRes.user, 'confirmCode lastVote user');
      expect(newUserClean).toMatchSnapshot();
    });

    test('should create new user with email referral', async () => {
      const req = { body: { user: user3, invitecode: inviteWithEmail.code } };
      await createUser(req, res, next);
      const apiRes = toObject(res.json.mock.calls[0][0]);
      expect(apiRes.user.balance).toBe(REFERRAL_REWARD + newUserCoins(apiRes.user));
    });

    test('should create new user via twitter and referral', async () => {
      // hack reuse last invite
      await Invite.findOneAndUpdate(
        { _id: inviteWithEmail._id },
        { redeemed: false },
        { upsert: false }
      );
      const req = {};
      const twitterAuth = 'xxxx';
      await handleTwitterAuth({
        req,
        twitterAuth,
        profile: twitter.profile,
        invitecode: inviteWithEmail.code
      });
      const twitterUser = await User.findOne({ handle: twitter.profile.username });
      expect(twitterUser.balance).toBe(TWITTER_REWARD + EMAIL_REWARD + REFERRAL_REWARD);
    });
  });

  describe('after invite is used', () => {
    test('invite should not be usable again', async () => {
      const usedInvite = await Invite.findOne({ _id: invite._id });
      expect(usedInvite.redeemed).toBe(true);
      expect(usedInvite.status).toBe('registered');
    });

    test('users should have tokens', async () => {
      const invitee = await User.findOne({ _id: newUser._id });
      const inviter = await User.findOne({ _id: alice._id });

      expect(invitee.balance).toBe(REFERRAL_REWARD);
      expect(inviter.balance).toBe(alice.balance + 3 * REFERRAL_REWARD);

      expect(inviter.airdropTokens).toBe(3 * REFERRAL_REWARD + aliceInitialAirdrop);
      expect(invitee.airdropTokens).toBe(REFERRAL_REWARD);

      expect(inviter.referralTokens).toBe(3 * REFERRAL_REWARD);
    });

    test('should create notifications', async () => {
      const inviteeNote = await Notification.findOne({ forUser: newUser._id }).sort(
        '-createdAt'
      );
      const inviterNote = await Notification.findOne({ forUser: alice._id }).sort(
        '-createdAt'
      );

      expect(inviterNote.type).toBe('reward_referral');
      expect(inviteeNote.type).toBe('reward_referredBy');

      expect(inviterNote.coin).toBe(REFERRAL_REWARD);
      expect(inviteeNote.coin).toBe(REFERRAL_REWARD);
    });
  });

  describe('public link', () => {
    test('should be able to get reward for public link', async () => {
      const req = {
        body: { user: { ...user2, name: 'bobby' }, invitecode: alice.handle }
      };
      await createUser(req, res, next);
      const invitee = toObject(res.json.mock.calls[0][0].user);

      const inviter = await User.findOne({ _id: alice._id });
      expect(inviter.referralTokens).toBe(3 * REFERRAL_REWARD + PUBLIC_LINK_REWARD);

      const inviterNote = await Notification.findOne({ forUser: alice._id }).sort(
        '-createdAt'
      );

      expect(inviterNote.type).toBe('reward_publicLink');
      expect(inviterNote.coin).toBe(PUBLIC_LINK_REWARD);

      const inviteeNote = await Notification.findOne({ forUser: invitee._id }).sort(
        '-createdAt'
      );

      expect(inviteeNote.type).toBe('reward_publicInvite');
      expect(inviteeNote.coin).toBe(PUBLIC_LINK_REWARD);
    });
  });

  describe('admin invite', () => {
    test('create admin invite', async () => {
      alice.role = 'admin';
      const req = {
        user: alice,
        body: adminReferral,
        communityMember
      };
      await create(req, res, next);
      const apiRes = toObject(res.json.mock.calls[0][0]);
      invite = apiRes.invite[0];
      expect(invite.code).toBeDefined();
      expect(invite.type).toBe('admin');
    });

    test('should be able to redeem admin invite', async () => {
      const req = {
        user: bob,
        body: {
          invitecode: invite.code
        }
      };
      await adminInvite(req, res, next);
      const user = toObject(res.json.mock.calls[0][0]);
      expect(user.relevance.pagerank).toBeGreaterThan(50);

      const bobMember = await CommunityMember.findOne({
        communityId: invite.communityId,
        user: bob._id
      });
      expect(bobMember.role).toBe('admin');
    });
  });

  describe('max airdrop', () => {
    test('should not be able to get more than MAX_AIRDOP', async () => {
      const req = {
        user: alice,
        body: referral,
        communityMember
      };
      await create(req, res, next);
      const apiRes = toObject(res.json.mock.calls[0][0]);
      const testInvite = apiRes.invite[0];
      alice.airdropTokens = MAX_AIRDROP;
      await alice.save();
      const req2 = {
        body: { user: { ...user2, name: 'testing' }, invitecode: testInvite.code }
      };
      await createUser(req2, res, next);
      const updatedAlice = await User.findOne({ _id: alice._id });
      expect(updatedAlice.airdropTokens).toBe(MAX_AIRDROP);
    });
  });
});
